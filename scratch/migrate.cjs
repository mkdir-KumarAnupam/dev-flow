const fs = require('fs');
const path = require('path');

const main = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');
let dashboard = fs.readFileSync('C:/dev-cli/src/commands/dashboard.ts', 'utf8');

const focusStartIdx = main.indexOf('// ═══ FOCUS MODE ENDPOINTS ═══');
const sysDesignIdx = main.indexOf('server.get("/api/ip"');
let focusCode = main.substring(focusStartIdx, sysDesignIdx);

// Replace 'server.' with 'app.'
focusCode = focusCode.replace(/server\./g, 'app.');
focusCode = focusCode.replace(/const util = require\('util'\);/g, 'const util = await import(\'util\');');
focusCode = focusCode.replace(/require\("child_process"\)/g, 'await import("child_process")');

// Replace __dirname resolution
focusCode = focusCode.replace(/let daemonPath =.*?telemetry\.ts"\);\s*}/s, 
  `let daemonPath = path.join(__dirname, "..", "..", "dist", "daemon", "telemetry.js");
      if (!fs.existsSync(daemonPath)) {
        daemonPath = path.join(__dirname, "..", "daemon", "telemetry.js");
      }`);

// Insert into dashboard.ts before 'const distPath ='
const insertIdx = dashboard.indexOf('const distPath =');
dashboard = dashboard.substring(0, insertIdx) + '\n' + focusCode + '\n  ' + dashboard.substring(insertIdx);

fs.writeFileSync('C:/dev-cli/src/commands/dashboard.ts', dashboard);
console.log('Done migrating focus endpoints');
