package expo.modules.wallpaper

import android.app.AlarmManager
import android.app.PendingIntent
import android.app.WallpaperManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.util.Log
import java.io.InputStream

class WallpaperReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Log.d("WallpaperReceiver", "Wallpaper rotation triggered")

        val images = intent.getStringArrayListExtra("images") ?: return
        if (images.isEmpty()) return
        
        val intervalMs = intent.getLongExtra("intervalMs", 60000L)
        val targets = intent.getStringArrayListExtra("targets") ?: arrayListOf("home", "lock")
        val currentIndex = intent.getIntExtra("currentIndex", 0)

        // Ensure index is within bounds
        val safeIndex = if (currentIndex >= images.size) 0 else currentIndex
        val currentImageUriString = images[safeIndex]

        try {
            val wallpaperManager = WallpaperManager.getInstance(context)
            val uri = Uri.parse(currentImageUriString)
            
            var inputStream: InputStream? = null
            if (currentImageUriString.startsWith("content://") || currentImageUriString.startsWith("file://")) {
                inputStream = context.contentResolver.openInputStream(uri)
            } else {
                // If it's a direct path without scheme
                inputStream = context.contentResolver.openInputStream(Uri.parse("file://$currentImageUriString"))
            }

            inputStream?.use {
                val bitmap = BitmapFactory.decodeStream(it)
                if (bitmap != null) {
                    var flags = 0
                    if (targets.contains("home")) flags = flags or WallpaperManager.FLAG_SYSTEM
                    if (targets.contains("lock")) flags = flags or WallpaperManager.FLAG_LOCK

                    if (flags != 0) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            wallpaperManager.setBitmap(bitmap, null, true, flags)
                        } else {
                            wallpaperManager.setBitmap(bitmap)
                        }
                        Log.d("WallpaperReceiver", "Wallpaper set successfully. Index: $safeIndex")
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("WallpaperReceiver", "Error setting wallpaper", e)
        }

        // Schedule the next one
        val nextIndex = if (safeIndex + 1 >= images.size) 0 else safeIndex + 1
        
        val nextIntent = Intent(context, WallpaperReceiver::class.java).apply {
            putStringArrayListExtra("images", images)
            putExtra("intervalMs", intervalMs)
            putStringArrayListExtra("targets", targets)
            putExtra("currentIndex", nextIndex)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            nextIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarmManager.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            System.currentTimeMillis() + intervalMs,
            pendingIntent
        )
    }
}
