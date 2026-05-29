const fs = require('fs');

let manifest = fs.readFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', 'utf8');

const labels = {
    'GraphWidgetProvider': 'DevOS Graph',
    'StreakWidgetProvider': 'DevOS Streak',
    'SolvedWidgetProvider': 'DevOS Solved',
    'LocWidgetProvider': 'DevOS LOC',
    'DeepWorkWidgetProvider': 'DevOS Deep Work',
    'AvgFlowWidgetProvider': 'DevOS Avg Flow',
    'PracticeWidgetProvider': 'DevOS Practice'
};

for (const [provider, label] of Object.entries(labels)) {
    // Replace <receiver android:name=".ProviderName" android:exported="true">
    // with <receiver android:name=".ProviderName" android:label="Label" android:exported="true">
    const regex = new RegExp(`<receiver android:name="\\.${provider}" android:exported="true">`, 'g');
    manifest = manifest.replace(regex, `<receiver android:name=".${provider}" android:label="${label}" android:exported="true">`);
}

fs.writeFileSync('C:/dev-cli/FocusCompanion/app/src/main/AndroidManifest.xml', manifest);
console.log('Added labels to AndroidManifest.xml');
