const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

// Replace dayCounts
const newDayCounts = `const dayCounts = {};
    flow.forEach(f => {
      if (!f.timestamp) return;
      const ds = new Date(f.timestamp).toISOString().split('T')[0];
      dayCounts[ds] = (dayCounts[ds] || 0) + (f.durationMinutes || 0);
    });
    practice.forEach(p => {
      if (!p.startedAt) return;
      const ds = new Date(p.startedAt).toISOString().split('T')[0];
      dayCounts[ds] = (dayCounts[ds] || 0) + (p.timeSpentMinutes || 0);
    });`;

code = code.replace(/const dayCounts = \{\};\s*flow\.forEach.*?dayCounts\[ds\] = \(dayCounts\[ds\] \|\| 0\) \+ 1;\s*\}\);\s*practice\.forEach.*?dayCounts\[ds\] = \(dayCounts\[ds\] \|\| 0\) \+ 1;\s*\}\);/s, newDayCounts);

// Replace payload and add latestSubmission and lastOpened
const newPayloadLogic = `
    let lastProjectOpened = '--';
    if (flow.length > 0) {
      lastProjectOpened = flow[flow.length - 1].timestamp || '--';
    }

    let latestSubTitle = '--';
    let latestSubDifficulty = 'easy';
    if (practice.length > 0) {
       const sub = practice[practice.length - 1];
       latestSubTitle = sub.title || '--';
       latestSubDifficulty = sub.difficulty || 'easy';
    }

    const payload = {
      metrics: {
        streak: streak,
        solved: solved,
        loc: totalLoc,
        deepWork: deepWorkHrs,
        avgFlow: avgFlow,
        practice: practiceMins,
        totalTracked: Math.round(flow.reduce((a, c) => a + (c.durationMinutes || 0), 0))
      },
      graph: graphData,
      heatmap: heatmapData,
      lastProject: {
        name: lastProjectName,
        desc: lastProjectDesc,
        lastOpened: lastProjectOpened
      },
      uncommitted: uncommittedCount,
      latestSubmission: {
        title: latestSubTitle,
        difficulty: latestSubDifficulty
      }
    };
`;

code = code.replace(/const payload = \{[\s\S]*?uncommitted: uncommittedCount\s*\};/, newPayloadLogic);

fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
console.log('Patched main.cjs with accurate graphs and submissions');
