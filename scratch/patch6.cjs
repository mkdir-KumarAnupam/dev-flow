const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/src/index.ts', 'utf8');

code = code.replace(
  '  .description("Initiate a telemetry-tracked flow state session (e.g. 90m) or view \'report\'")',
  '  .description("Initiate a telemetry-tracked flow state session (e.g. 90m) or view \'report\'")\n  .option("--no-hud", "Disable HUD")'
);

fs.writeFileSync('C:/dev-cli/src/index.ts', code);
console.log('Patched index.ts');
