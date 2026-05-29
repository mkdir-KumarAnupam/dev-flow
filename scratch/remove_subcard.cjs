const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/src/App.tsx', 'utf8');

const regex = /<motion\.div variants=\{fadeUp\} className="text-center py-4 pb-8 flex justify-center">[\s\S]*?<\/motion\.div>/;
code = code.replace(regex, '');

fs.writeFileSync('C:/dev-cli/dashboard/src/App.tsx', code);
console.log('Removed subcard');
