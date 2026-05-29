const fs = require('fs');
let c = fs.readFileSync('dashboard/src/RaceMode.tsx', 'utf8');
c = c.replace(/\\\`/g, '`');
c = c.replace(/\\\$/g, '$');
c = c.replace(/\\\\s/g, '\\s');
c = c.replace(/\\\\n/g, '\\n');
fs.writeFileSync('dashboard/src/RaceMode.tsx', c);

let r = fs.readFileSync('src/commands/runners.ts', 'utf8');
r = r.replace(/let argsList = \[\];/g, 'let argsList: string[] = [];');
fs.writeFileSync('src/commands/runners.ts', r);
