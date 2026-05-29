const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', 'utf8');

const receiverCode = `
        <receiver
            android:name=".DashboardWidgetProvider"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/dashboard_widget_info" />
        </receiver>
`;

if (!code.includes('DashboardWidgetProvider')) {
  code = code.replace('</application>', receiverCode + '    </application>');
  fs.writeFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', code);
}
console.log('Patched AndroidManifest.xml');
