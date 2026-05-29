const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

const genStart = code.indexOf('server.post("/api/focus/generate-report"');
const genEnd = code.indexOf('server.post("/api/generate-problem-link"');

const newGenCode = `server.post("/api/focus/generate-report", async (req, res) => {
    try {
      const util = require('util');
      const execPromise = util.promisify(exec);
      // Run the global CLI to analyze
      const { stdout } = await execPromise('dev focus analyze-json');
      const lines = stdout.split('\\n');
      let result = null;
      for (const line of lines) {
        if (line.trim().startsWith('{')) {
           try { result = JSON.parse(line); break; } catch {}
        }
      }
      res.json(result || { error: "Failed to parse JSON", stdout });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  `;

code = code.substring(0, genStart) + newGenCode + code.substring(genEnd);
fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
console.log('Patched focus generate-report in main.cjs');
