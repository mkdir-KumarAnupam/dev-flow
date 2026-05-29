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

class HeatmapWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) updateAppWidget(context, appWidgetManager, id)
    }
    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, id: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_heatmap)
        try { FirebaseApp.initializeApp(context) } catch (e: Exception) {}
        val db = FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/heatmap")
        db.addListenerForSingleValueEvent(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    val data = mutableListOf<Int>()
                    for (child in snapshot.children) {
                        data.add(child.getValue(Int::class.java) ?: 0)
                    }
                    if (data.isNotEmpty()) {
                        val bitmap = drawHeatmap(data)
                        views.setImageViewBitmap(R.id.iv_heatmap, bitmap)
                        appWidgetManager.updateAppWidget(id, views)
                    }
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })
        appWidgetManager.updateAppWidget(id, views)
    }
    private fun drawHeatmap(data: List<Int>): Bitmap {
        val width = 400
        val height = 200
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        
        val rows = 5
        val cols = 7
        val padding = 8f
        val boxWidth = (width - padding * (cols + 1)) / cols
        val boxHeight = (height - padding * (rows + 1)) / rows
        val boxSize = minOf(boxWidth, boxHeight)
        
        val startX = (width - (cols * boxSize + (cols - 1) * padding)) / 2
        val startY = (height - (rows * boxSize + (rows - 1) * padding)) / 2
        
        val paint = Paint().apply { style = Paint.Style.FILL; isAntiAlias = true }
        
        for (i in 0 until minOf(data.size, rows * cols)) {
            val col = i % cols
            val row = i / cols
            val value = data[data.size - 1 - i] // Read backwards to put latest at bottom right
            
            paint.color = when {
                value == 0 -> Color.parseColor("#161B22")
                value < 3 -> Color.parseColor("#0E4429")
                value < 6 -> Color.parseColor("#006D32")
                value < 10 -> Color.parseColor("#26A641")
                else -> Color.parseColor("#39D353")
            }
            
            val x = startX + col * (boxSize + padding)
            val y = startY + row * (boxSize + padding)
            
            canvas.drawRoundRect(x, y, x + boxSize, y + boxSize, 4f, 4f, paint)
        }
        return bitmap
    }
}
