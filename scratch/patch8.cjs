const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/src/daemon/telemetry.ts', 'utf8');

code = code.replace(
  '  child.stdout?.on("data", (chunk) => {',
  '  process.on("SIGTERM", () => { try { child.kill(); fs.unlinkSync(livePath); } catch(e){} process.exit(0); });\n  child.stdout?.on("data", (chunk) => {'
);

fs.writeFileSync('C:/dev-cli/src/daemon/telemetry.ts', code);
console.log('Patched telemetry.ts for SIGTERM');
