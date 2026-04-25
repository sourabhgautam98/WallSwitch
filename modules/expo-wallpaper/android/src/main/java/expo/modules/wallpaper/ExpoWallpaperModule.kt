package expo.modules.wallpaper

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoWallpaperModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoWallpaper")

    AsyncFunction("startRotation") { images: List<String>, intervalMs: Long, targets: List<String> ->
      val context = appContext.reactContext ?: return@AsyncFunction null
      val intent = Intent(context, WallpaperReceiver::class.java).apply {
        putStringArrayListExtra("images", ArrayList(images))
        putExtra("intervalMs", intervalMs)
        putStringArrayListExtra("targets", ArrayList(targets))
        putExtra("currentIndex", 0)
      }

      val pendingIntent = PendingIntent.getBroadcast(
        context,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )

      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      alarmManager.setExactAndAllowWhileIdle(
        AlarmManager.RTC_WAKEUP,
        System.currentTimeMillis() + 100, // Start almost immediately
        pendingIntent
      )
    }

    AsyncFunction("stopRotation") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      val intent = Intent(context, WallpaperReceiver::class.java)
      val pendingIntent = PendingIntent.getBroadcast(
        context,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      alarmManager.cancel(pendingIntent)
    }
  }
}

