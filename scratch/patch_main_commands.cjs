const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

const regex = /server\.post\("\/api\/focus\/stop", async \(req, res\) => \{/;
const replacement = `
  // Listen for remote commands from Firebase
  if (fbInitialized) {
    admin.database().ref('dashboard_stats/commands').on('value', async (snapshot) => {
      const val = snapshot.val();
      if (val && val.command) {
        const home = process.env.HOME || process.env.USERPROFILE || "";
        const controlPath = require('path').join(home, '.dev-cli', 'flow-control.json');
        try {
          await fs.writeJson(controlPath, { command: val.command, timestamp: Date.now() });
          // Clear it in Firebase so we don't re-trigger indefinitely
          await admin.database().ref('dashboard_stats/commands').remove();
        } catch (e) {}
      }
    });
  }

  server.post("/api/focus/stop", async (req, res) => {`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
  console.log('Added command listener to main.cjs');
} else {
  console.log('Regex not found');
}
