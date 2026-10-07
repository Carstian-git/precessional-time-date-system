package ro.tpu.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.*
import android.widget.RemoteViews
import kotlin.math.*

/** Ceas TPU – widget Android. Schimbă LON (grade est, negativ la vest) și, dacă vrei, LANG ("ro", "en", "fr") înainte de compilare.
 *  HPT clock widget. Edit LON (degrees east) and LANG before building. / Modifiez LON et LANG avant la compilation. */
class TpuWidget : AppWidgetProvider() {
    companion object {
        const val LON = 26.1
        const val LANG = "ro"   // "ro", "en" sau/or/ou "fr"
        const val ACTION = "ro.tpu.widget.TICK"
        private const val EPOCA = 15330L; private const val CICLU = 25772L
        private const val AN_MEDIU = 365.0 + 1.0 / 4 - 1.0 / 128; private const val K_ANCORA = 2441 - 2011
        private val LIMITE = LongArray(13) { it * CICLU / 12 }
        private class T(val zile: Array<String>, val luna: String, val ziua: String, val za: String, val zb: String)
        private val TXT = mapOf(
            "ro" to T(arrayOf("Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"), "Luna", "ziua", "Ziua anului", "Ziua bisectă"),
            "en" to T(arrayOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), "Month", "day", "Year Day", "Leap Day"),
            "fr" to T(arrayOf("lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"), "Mois", "jour", "Jour de l'année", "Jour bissextile"))
        private fun inceput(k: Long) = EPOCA + 365 * (k - 1) + Math.floorDiv(k - 1, 4L) - Math.floorDiv(k - 1, 128L)
        private fun anPentruZi(z: Long): Long {
            var k = floor((z - EPOCA) / AN_MEDIU).toLong() + 1
            while (z < inceput(k)) k--
            while (z >= inceput(k + 1)) k++
            return k
        }
        private fun p2(n: Long) = n.toString().padStart(2, '0')

        data class Acum(val ora: String, val data: String, val unghi: Double, val minUnghi: Double)
        fun acum(ms: Long): Acum {
            val fus = floor(LON / 10 + 0.5).toLong()
            val loc = Math.floorDiv(ms, 1000L) + fus * 2400
            val z = Math.floorDiv(loc, 86400L)
            val k = anPentruZi(z); val n = z - inceput(k) + 1
            val p = Math.floorMod(k - K_ANCORA, CICLU); var j = 0
            for (i in 0 until 12) if (LIMITE[i] <= p) j = i
            val er = j + 1; val ae = p - LIMITE[j] + 1
            val lc: Long; val zn: Long
            if (n <= 364) { lc = (n - 1) / 28 + 1; zn = (n - 1) % 28 + 1 } else { lc = 0; zn = n - 364 }
            val t = Math.floorMod(loc, 86400L)
            val hn = t / 2400; var r = t % 2400; val mn = r / 240; r %= 240; val sn = r / 24; val ss = r % 24
            val tx = TXT[LANG] ?: TXT.getValue("ro")
            val zs = if (lc > 0) tx.zile[((zn - 1) % 7).toInt()] else if (zn == 1L) tx.za else tx.zb
            val data = (if (lc > 0) "$zs · ${tx.luna} $lc · ${tx.ziua} $zn" else zs) + " · ER $er AE $ae"
            return Acum("${p2(hn)}:${p2(mn)}:${p2(sn)}", data, t / 86400.0 * 360, (mn * 240 + sn * 24 + ss) / 2400.0 * 360)
        }

        fun deseneaza(a: Acum): Bitmap {
            val s = 400; val bmp = Bitmap.createBitmap(s, s, Bitmap.Config.ARGB_8888); val c = Canvas(bmp)
            val cx = s / 2f; val R = s / 2f - 6
            val p = Paint(Paint.ANTI_ALIAS_FLAG).apply { strokeCap = Paint.Cap.ROUND }
            fun pt(ang: Double, r: Float) = floatArrayOf(cx + sin(Math.toRadians(ang)).toFloat() * r, cx - cos(Math.toRadians(ang)).toFloat() * r)
            p.style = Paint.Style.STROKE; p.color = Color.parseColor("#2C3650"); p.strokeWidth = 4f; c.drawCircle(cx, cx, R, p)
            p.color = Color.parseColor("#EEF0F5")
            val tx = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = p.color; textSize = 26f; textAlign = Paint.Align.CENTER }
            for (h in 0 until 36) {
                val big = h % 3 == 0; p.strokeWidth = if (big) 4f else 2f
                val a1 = pt(h * 10.0, R - if (big) 34 else 18); val a2 = pt(h * 10.0, R)
                c.drawLine(a1[0], a1[1], a2[0], a2[1], p)
                if (big) { val t = pt(h * 10.0, R - 62); c.drawText("$h", t[0], t[1] + 9, tx) }
            }
            var q = pt(a.minUnghi, R - 20); p.strokeWidth = 5f; c.drawLine(cx, cx, q[0], q[1], p)
            q = pt(a.unghi, R * 0.62f); p.color = Color.parseColor("#FF8A6B"); p.strokeWidth = 12f; c.drawLine(cx, cx, q[0], q[1], p)
            p.style = Paint.Style.FILL; c.drawCircle(cx, cx, 11f, p)
            return bmp
        }

        fun actualizeaza(ctx: Context) {
            val mgr = AppWidgetManager.getInstance(ctx)
            val ids = mgr.getAppWidgetIds(ComponentName(ctx, TpuWidget::class.java))
            if (ids.isEmpty()) return
            val a = acum(System.currentTimeMillis())
            for (id in ids) {
                val v = RemoteViews(ctx.packageName, R.layout.widget_tpu)
                v.setImageViewBitmap(R.id.dial, deseneaza(a)); v.setTextViewText(R.id.ora, a.ora); v.setTextViewText(R.id.data, a.data)
                mgr.updateAppWidget(id, v)
            }
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val pi = PendingIntent.getBroadcast(ctx, 0, Intent(ctx, TpuWidget::class.java).setAction(ACTION), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            am.setAndAllowWhileIdle(AlarmManager.RTC, System.currentTimeMillis() + 30_000, pi)  // ~ la fiecare 30 s (o secundă nouă = 24 s SI)
        }
    }
    override fun onUpdate(ctx: Context, m: AppWidgetManager, ids: IntArray) = actualizeaza(ctx)
    override fun onReceive(ctx: Context, i: Intent) { super.onReceive(ctx, i); if (i.action == ACTION) actualizeaza(ctx) }
    override fun onDisabled(ctx: Context) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.cancel(PendingIntent.getBroadcast(ctx, 0, Intent(ctx, TpuWidget::class.java).setAction(ACTION), PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE) ?: return)
    }
}
