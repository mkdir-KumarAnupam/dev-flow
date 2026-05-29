const fs = require('fs');
const path = require('path');

const pkgDir = 'C:/dev-cli/FocusCompanion/app/src/main/java/com/example/focuscompanion';
const xmlDir = 'C:/dev-cli/FocusCompanion/app/src/main/res/xml';

const tpl = (layout) => `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="120dp"
    android:minHeight="120dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/${layout}"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen" />`;

fs.writeFileSync(path.join(xmlDir, 'widget_info_lastproject.xml'), tpl('widget_last_project'));
fs.writeFileSync(path.join(xmlDir, 'widget_info_uncommitted.xml'), tpl('widget_uncommitted'));
fs.writeFileSync(path.join(xmlDir, 'widget_info_heatmap.xml'), tpl('widget_heatmap'));

let manifest = fs.readFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', 'utf8');

const newReceivers = `
        <receiver android:name=".LastProjectWidgetProvider" android:label="DevOS Last Project" android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/widget_info_lastproject" />
        </receiver>

        <receiver android:name=".UncommittedWidgetProvider" android:label="DevOS Uncommitted" android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/widget_info_uncommitted" />
        </receiver>

        <receiver android:name=".HeatmapWidgetProvider" android:label="DevOS Activity Pulse" android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/widget_info_heatmap" />
        </receiver>
`;

if (!manifest.includes('LastProjectWidgetProvider')) {
    manifest = manifest.replace('</application>', newReceivers + '</application>');
    fs.writeFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', manifest);
}
console.log('Created advanced widget files and patched manifest');
