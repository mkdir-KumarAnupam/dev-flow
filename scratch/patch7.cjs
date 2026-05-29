const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/src/daemon/telemetry.ts', 'utf8');

const target = '      idleSeconds,\n      currentStreak\n    }).catch(() => {});';
const replacement = '      idleSeconds,\n      currentStreak,\n      pid: process.pid\n    }).catch(() => {});';

code = code.replace(target, replacement);
fs.writeFileSync('C:/dev-cli/src/daemon/telemetry.ts', code);
console.log('Patched telemetry.ts');
