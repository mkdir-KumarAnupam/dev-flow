package com.example.focuscompanion

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.graphics.Color
import android.widget.RemoteViews
import com.google.firebase.FirebaseApp
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

class SubmissionWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) updateAppWidget(context, appWidgetManager, id)
    }
    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, id: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_submission)
        try { FirebaseApp.initializeApp(context) } catch (e: Exception) {}
        val db = FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/latestSubmission")
        db.addListenerForSingleValueEvent(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    val title = snapshot.child("title").getValue(String::class.java) ?: "--"
                    val diff = snapshot.child("difficulty").getValue(String::class.java) ?: "easy"
                    views.setTextViewText(R.id.tv_sub_title, title)
                    views.setTextViewText(R.id.tv_sub_diff, diff.uppercase())
                    
                    val color = when(diff.lowercase()) {
                        "easy" -> Color.parseColor("#39D353")
                        "medium" -> Color.parseColor("#FFB86C")
                        "hard" -> Color.parseColor("#FF5555")
                        else -> Color.parseColor("#82AAFF")
                    }
                    views.setTextColor(R.id.tv_sub_diff, color)
                    appWidgetManager.updateAppWidget(id, views)
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })
        appWidgetManager.updateAppWidget(id, views)
    }
}
