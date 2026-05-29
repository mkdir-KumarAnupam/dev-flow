const fs = require('fs');

let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

// Fix deepWork calculation
code = code.replace(
  'const deepWorkSecs = flow.reduce((a, c) => a + (c.deepWorkSeconds || 0), 0);\n    const deepWorkHrs = Math.round((deepWorkSecs / 3600) * 10) / 10;',
  'const totalMin = flow.reduce((a, c) => a + (c.durationMinutes || 0), 0);\n    const deepWorkHrs = Math.round((totalMin / 60) * 10) / 10;'
);

// Fix avgFlow calculation
code = code.replace(
  'const avgFlow = flow.length > 0 ? Math.round(flow.reduce((a, c) => a + (c.flowScore || 0), 0) / flow.length) : 0;',
  'const flowScores = flow.filter(f => typeof f.flowScore === "number");\n    const avgFlow = flowScores.length > 0 ? Math.round(flowScores.reduce((a, c) => a + c.flowScore, 0) / flowScores.length) : 0;'
);

fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
console.log('Patched metrics in main.cjs');
