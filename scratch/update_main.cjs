const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

const regex = /res\.json\(result \|\| \{ error: "Failed to parse JSON", stdout \}\);/;
const replacement = `
        if (fbInitialized && result) {
          admin.database().ref('dashboard_stats/lastReport').set(result).catch(() => {});
        }
        res.json(result || { error: "Failed to parse JSON", stdout });
`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
  console.log('Added Firebase upload to generate-report');
} else {
  console.log('Regex not found');
}
