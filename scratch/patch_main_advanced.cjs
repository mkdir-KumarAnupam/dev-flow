const fs = require('fs');
const path = require('path');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

const additionalLogic = `
    // 35-day heatmap data (5 weeks x 7 days)
    const heatmapData = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      heatmapData.push(dayCounts[ds] || 0);
    }
    
    // Last Project & Uncommitted
    let lastProjectName = '--';
    let lastProjectDesc = '--';
    let uncommittedCount = 0;
    
    try {
      if (flow.length > 0) {
        lastProjectName = flow[flow.length - 1].projectContext || '--';
        const projPath = path.join(home, '.dev-cli', 'projects.json');
        if (await fs.pathExists(projPath)) {
          const projects = await fs.readJson(projPath);
          const p = projects.find(x => x.name === lastProjectName);
          if (p) {
             lastProjectDesc = p.type || p.description || '--';
             const cp = require('child_process');
             const gitStatus = cp.execSync('git status -s', { cwd: p.path, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
             uncommittedCount = gitStatus.split('\\n').filter(l => l.trim().length > 0).length;
          }
        }
      }
    } catch (err) {
      console.log('Error getting last project info:', err.message);
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
        desc: lastProjectDesc
      },
      uncommitted: uncommittedCount
    };
    
    await admin.database().ref('dashboard_stats').set(payload);
`;

code = code.replace(/const payload = \{[\s\S]*?await admin.database\(\)\.ref\('dashboard_stats'\)\.set\(payload\);/, additionalLogic);

fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
console.log('Patched main.cjs with advanced widget metrics');
