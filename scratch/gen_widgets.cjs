const fs = require('fs');
const path = require('path');

const metrics = [
  { id: 'Streak', key: 'streak', title: 'STREAK', sub: 'consecutive days' },
  { id: 'Solved', key: 'solved', title: 'SOLVED', sub: 'problems attempted' },
  { id: 'Loc', key: 'loc', title: 'LOC', sub: 'net output' },
  { id: 'DeepWork', key: 'deepWork', title: 'DEEP WORK', sub: 'total tracked' },
  { id: 'AvgFlow', key: 'avgFlow', title: 'AVG FLOW', sub: 'average session' },
  { id: 'Practice', key: 'practice', title: 'PRACTICE', sub: 'minutes spent' }
];

const pkgDir = 'C:/dev-cli/FocusCompanion/app/src/main/java/com/example/focuscompanion';
const xmlDir = 'C:/dev-cli/FocusCompanion/app/src/main/res/xml';

metrics.forEach(m => {
  // 1. Create WidgetProvider.kt
  const kt = `package com.example.focuscompanion

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

class ${m.id}WidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_single_metric)
        views.setTextViewText(R.id.tv_title, "${m.title}")
        views.setTextViewText(R.id.tv_subtext, "${m.sub}")

        try { FirebaseApp.initializeApp(context) } catch (e: Exception) {}

        val db = FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/metrics")
        db.addListenerForSingleValueEvent(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    var value = snapshot.child("${m.key}").getValue()?.toString() ?: "--"
                    if ("${m.id}" == "DeepWork") value += "h"
                    if ("${m.id}" == "AvgFlow") value += "%"
                    if ("${m.id}" == "Practice") value += "m"
                    if ("${m.id}" == "Streak") value += "d"
                    views.setTextViewText(R.id.tv_value, value)
                    appWidgetManager.updateAppWidget(appWidgetId, views)
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
`;
  fs.writeFileSync(path.join(pkgDir, `${m.id}WidgetProvider.kt`), kt);

  // 2. Create widget_info.xml
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="120dp"
    android:minHeight="120dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_single_metric"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen" />
`;
  fs.writeFileSync(path.join(xmlDir, `widget_info_${m.key}.xml`), xml);
});

console.log('Created 6 individual widget providers');
