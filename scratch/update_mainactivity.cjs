const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/FocusCompanion/app/src/main/java/com/example/focuscompanion/MainActivity.kt', 'utf8');

const regex = /fun showToast\(toast: String\) \{\n        Toast.makeText\(mContext, toast, Toast\.LENGTH_SHORT\)\.show\(\)\n    \}/;
const replacement = `fun showToast(toast: String) {
        Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun sendCommand(command: String) {
        try {
            val databaseCmd = com.google.firebase.database.FirebaseDatabase.getInstance("https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app").getReference("dashboard_stats/commands")
            val cmdObj = java.util.HashMap<String, Any>()
            cmdObj["command"] = command
            cmdObj["timestamp"] = System.currentTimeMillis()
            databaseCmd.setValue(cmdObj)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('C:/dev-cli/FocusCompanion/app/src/main/java/com/example/focuscompanion/MainActivity.kt', code);
  console.log('Added sendCommand to MainActivity');
} else {
  console.log('Regex not found');
}
