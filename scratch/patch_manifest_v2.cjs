const fs = require('fs');

let manifest = fs.readFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', 'utf8');

// Remove old DashboardWidgetProvider
manifest = manifest.replace(/<receiver[^>]+android:name="\.DashboardWidgetProvider"[\s\S]*?<\/receiver>/, '');

// Add new providers
const newProviders = `
        <receiver android:name=".MetricsWidgetProvider" android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/metrics_widget_info" />
        </receiver>

        <receiver android:name=".GraphWidgetProvider" android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/graph_widget_info" />
        </receiver>
`;

if (!manifest.includes('MetricsWidgetProvider')) {
    manifest = manifest.replace('</application>', newProviders + '</application>');
}

fs.writeFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', manifest);
console.log('Patched AndroidManifest.xml');
