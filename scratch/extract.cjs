const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');
const start = code.indexOf('  server.get("/companion",');
let htmlStart = code.indexOf('<!DOCTYPE html>', start);
let htmlEnd = code.indexOf('`);', htmlStart);
fs.writeFileSync('C:/dev-cli/scratch/companion_extracted.html', code.substring(htmlStart, htmlEnd));
console.log('Extracted HTML to scratch');
