package expo.modules.wallpaper

import android.app.AlarmManager
import android.app.PendingIntent
import android.app.WallpaperManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.RectF
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
            
            val displayMetrics = context.resources.displayMetrics
            val screenWidth = displayMetrics.widthPixels
            val screenHeight = displayMetrics.heightPixels

            // Suggest dimensions to the system to try and disable scrolling
            wallpaperManager.suggestDesiredDimensions(screenWidth, screenHeight)

            var inputStream: InputStream? = null
            if (currentImageUriString.startsWith("content://") || currentImageUriString.startsWith("file://")) {
                inputStream = context.contentResolver.openInputStream(uri)
            } else {
                inputStream = context.contentResolver.openInputStream(Uri.parse("file://$currentImageUriString"))
            }

            inputStream?.use {
                val originalBitmap = BitmapFactory.decodeStream(it)
                if (originalBitmap != null) {
                    // Center-crop and scale to fill the screen exactly
                    val processedBitmap = createCenterCropBitmap(originalBitmap, screenWidth, screenHeight)
                    
                    var flags = 0
                    if (targets.contains("home")) flags = flags or WallpaperManager.FLAG_SYSTEM
                    if (targets.contains("lock")) flags = flags or WallpaperManager.FLAG_LOCK

                    if (flags != 0) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            wallpaperManager.setBitmap(processedBitmap, null, true, flags)
                        } else {
                            wallpaperManager.setBitmap(processedBitmap)
                        }
                        Log.d("WallpaperReceiver", "Fixed wallpaper set successfully. Index: $safeIndex")
                    }
                    
                    if (processedBitmap != originalBitmap) {
                        processedBitmap.recycle()
                    }
                    originalBitmap.recycle()
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

    private fun createCenterCropBitmap(src: Bitmap, targetWidth: Int, targetHeight: Int): Bitmap {
        val srcWidth = src.width
        val srcHeight = src.height
        
        val scale: Float
        val dx: Float
        val dy: Float

        if (srcWidth * targetHeight > targetWidth * srcHeight) {
            scale = targetHeight.toFloat() / srcHeight.toFloat()
            dx = (targetWidth - srcWidth * scale) * 0.5f
            dy = 0f
        } else {
            scale = targetWidth.toFloat() / srcWidth.toFloat()
            dx = 0f
            dy = (targetHeight - srcHeight * scale) * 0.5f
        }

        val matrix = Matrix()
        matrix.setScale(scale, scale)
        matrix.postTranslate(dx, dy)

        val target = Bitmap.createBitmap(targetWidth, targetHeight, src.config ?: Bitmap.Config.ARGB_8888)
        val canvas = Canvas(target)
        canvas.drawBitmap(src, matrix, null)
        return target
    }
}
