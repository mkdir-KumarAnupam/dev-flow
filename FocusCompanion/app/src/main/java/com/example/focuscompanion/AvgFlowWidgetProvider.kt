package com.example.focuscompanion

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.google.firebase.FirebaseApp
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

class AvgFlowWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_single_metric)
        views.setTextViewText(R.id.tv_title, "AVG FLOW")
        views.setTextViewText(R.id.tv_subtext, "average session")

        try { FirebaseApp.initializeApp(context) } catch (e: Exception) {}

        val db = FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/metrics")
        db.addListenerForSingleValueEvent(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    var value = snapshot.child("avgFlow").getValue()?.toString() ?: "--"
                    if ("AvgFlow" == "DeepWork") value += "h"
                    if ("AvgFlow" == "AvgFlow") value += "%"
                    if ("AvgFlow" == "Practice") value += "m"
                    if ("AvgFlow" == "Streak") value += "d"
                    views.setTextViewText(R.id.tv_value, value)
                    appWidgetManager.updateAppWidget(appWidgetId, views)
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
