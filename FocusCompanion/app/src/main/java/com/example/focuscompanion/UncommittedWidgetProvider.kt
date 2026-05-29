package com.example.focuscompanion

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.google.firebase.FirebaseApp
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

class UncommittedWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) updateAppWidget(context, appWidgetManager, id)
    }
    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, id: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_uncommitted)
        try { FirebaseApp.initializeApp(context) } catch (e: Exception) {}
        val db = FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/uncommitted")
        db.addListenerForSingleValueEvent(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    val count = snapshot.getValue(Int::class.java) ?: 0
                    views.setTextViewText(R.id.tv_count, count.toString())
                    appWidgetManager.updateAppWidget(id, views)
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })
        appWidgetManager.updateAppWidget(id, views)
    }
}
