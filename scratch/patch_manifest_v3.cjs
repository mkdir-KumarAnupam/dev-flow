const fs = require('fs');

let manifest = fs.readFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', 'utf8');

// Remove old MetricsWidgetProvider
manifest = manifest.replace(/<receiver[^>]+android:name="\.MetricsWidgetProvider"[\s\S]*?<\/receiver>/, '');

const metrics = ['Streak', 'Solved', 'Loc', 'DeepWork', 'AvgFlow', 'Practice'];
let receivers = '';
metrics.forEach(m => {
  receivers += `
        <receiver android:name=".${m}WidgetProvider" android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/widget_info_${m.toLowerCase()}" />
        </receiver>
`;
});

manifest = manifest.replace('</application>', receivers + '</application>');

fs.writeFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', manifest);
console.log('Patched AndroidManifest.xml for 6 widgets');
