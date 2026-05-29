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
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class LastProjectWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) updateAppWidget(context, appWidgetManager, id)
    }
    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, id: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_last_project)
        try { FirebaseApp.initializeApp(context) } catch (e: Exception) {}
        val db = FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/lastProject")
        db.addListenerForSingleValueEvent(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    val name = snapshot.child("name").getValue(String::class.java) ?: "--"
                    val desc = snapshot.child("desc").getValue(String::class.java) ?: "--"
                    val lastOpened = snapshot.child("lastOpened").getValue(String::class.java) ?: "--"
                    
                    views.setTextViewText(R.id.tv_project_name, name)
                    views.setTextViewText(R.id.tv_project_desc, desc)
                    
                    if (lastOpened != "--") {
                        try {
                            val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                            parser.timeZone = TimeZone.getTimeZone("UTC")
                            val date = parser.parse(lastOpened)
                            if (date != null) {
                                val formatter = SimpleDateFormat("MMM dd, yyyy h:mm a", Locale.getDefault())
                                views.setTextViewText(R.id.tv_project_date, "Last opened: " + formatter.format(date))
                            }
                        } catch (e: Exception) {
                            views.setTextViewText(R.id.tv_project_date, "Last opened: " + lastOpened.take(10))
                        }
                    } else {
                        views.setTextViewText(R.id.tv_project_date, "")
                    }
                    
                    appWidgetManager.updateAppWidget(id, views)
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })
        appWidgetManager.updateAppWidget(id, views)
    }
}
