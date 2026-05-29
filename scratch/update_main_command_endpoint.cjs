const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

const regex = /server\.post\("\/api\/focus\/stop"/;
const replacement = `server.post("/api/focus/command", async (req, res) => {
    try {
      const { command } = req.body;
      const home = process.env.HOME || process.env.USERPROFILE || "";
      const controlPath = require('path').join(home, '.dev-cli', 'flow-control.json');
      await fs.writeJson(controlPath, { command, timestamp: Date.now() });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  server.post("/api/focus/stop"`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
  console.log('Added command endpoint to main.cjs');
} else {
  console.log('Regex not found');
}
