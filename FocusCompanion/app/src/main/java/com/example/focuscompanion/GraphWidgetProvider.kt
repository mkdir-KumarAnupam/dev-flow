package com.example.focuscompanion

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.widget.RemoteViews
import com.google.firebase.FirebaseApp
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

class GraphWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_graph)

        try {
            FirebaseApp.initializeApp(context)
        } catch (e: Exception) {}

        val db = FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/graph")
        db.addListenerForSingleValueEvent(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    val data = mutableListOf<Int>()
                    for (child in snapshot.children) {
                        data.add(child.getValue(Int::class.java) ?: 0)
                    }
                    if (data.isNotEmpty()) {
                        val bitmap = drawGraph(data)
                        views.setImageViewBitmap(R.id.iv_graph, bitmap)
                        appWidgetManager.updateAppWidget(appWidgetId, views)
                    }
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })
    }

    private fun drawGraph(data: List<Int>): Bitmap {
        val width = 400
        val height = 200
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val maxVal = data.maxOrNull()?.coerceAtLeast(1) ?: 1
        val barWidth = width / (data.size * 2f)
        val space = barWidth

        val paint = Paint().apply {
            color = Color.parseColor("#82AAFF")
            style = Paint.Style.FILL
            isAntiAlias = true
        }

        for ((i, value) in data.withIndex()) {
            val barHeight = (value.toFloat() / maxVal) * (height - 20) // 20px padding
            val left = (i * (barWidth + space)) + (space / 2)
            val top = height - barHeight
            val right = left + barWidth
            val bottom = height.toFloat()
            canvas.drawRoundRect(left, top, right, bottom, 10f, 10f, paint)
        }

        return bitmap
    }
}
