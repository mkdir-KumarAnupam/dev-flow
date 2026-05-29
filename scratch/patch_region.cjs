const fs = require('fs');

// Patch telemetry.ts
let tel = fs.readFileSync('C:/dev-cli/src/daemon/telemetry.ts', 'utf8');
tel = tel.replace('https://devcli-e1bc5-default-rtdb.firebaseio.com', 'https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app');
fs.writeFileSync('C:/dev-cli/src/daemon/telemetry.ts', tel);

// Patch DashboardWidgetProvider.kt
let widget = fs.readFileSync('C:/dev-cli/FocusCompanion/app/src/main/java/com/example/focuscompanion/DashboardWidgetProvider.kt', 'utf8');
widget = widget.replace('FirebaseDatabase.getInstance().getReference', 'FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference');
fs.writeFileSync('C:/dev-cli/FocusCompanion/app/src/main/java/com/example/focuscompanion/DashboardWidgetProvider.kt', widget);

console.log('Patched region URLs');
