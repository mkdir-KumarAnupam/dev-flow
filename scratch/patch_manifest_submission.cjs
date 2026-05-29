const fs = require('fs');
let manifest = fs.readFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', 'utf8');

const receiver = `
        <receiver android:name=".SubmissionWidgetProvider" android:label="DevOS Latest Submission" android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/widget_info_submission" />
        </receiver>
`;

if (!manifest.includes('SubmissionWidgetProvider')) {
    manifest = manifest.replace('</application>', receiver + '</application>');
    fs.writeFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', manifest);
    console.log('Added SubmissionWidgetProvider to manifest');
}
