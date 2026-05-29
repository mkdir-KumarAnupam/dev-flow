const fs = require('fs');
const path = require('path');
let code = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

const syncFn = `
const admin = require('firebase-admin');
const saPath = path.join(os.homedir(), '.dev-cli', 'firebase-service-account.json');
let fbInitialized = false;
try {
  if (fs.pathExistsSync(saPath)) {
    const sa = fs.readJsonSync(saPath);
    admin.initializeApp({
      credential: admin.credential.cert(sa),
      databaseURL: 'https://devcli-e1bc5-default-rtdb.asia-southeast1.firebasedatabase.app'
    });
    fbInitialized = true;
  }
} catch (e) {
  fbInitialized = true; // might be already init
}

async function syncDashboardMetrics() {
  if (!fbInitialized) return;
  try {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const flowPath = path.join(home, '.dev-cli', 'flow.json');
    const pracPath = path.join(home, '.dev-cli', 'practice.json');
    
    let flow = [];
    if (await fs.pathExists(flowPath)) flow = await fs.readJson(flowPath);
    let practice = [];
    if (await fs.pathExists(pracPath)) practice = await fs.readJson(pracPath);
    
    const totalLoc = flow.reduce((a, c) => a + Math.max(0, c.locDelta || 0), 0);
    const deepWorkSecs = flow.reduce((a, c) => a + (c.deepWorkSeconds || 0), 0);
    const deepWorkHrs = Math.round((deepWorkSecs / 3600) * 10) / 10;
    
    const avgFlow = flow.length > 0 ? Math.round(flow.reduce((a, c) => a + (c.flowScore || 0), 0) / flow.length) : 0;
    
    const solved = practice.length;
    const practiceMins = practice.reduce((a, c) => a + (c.timeSpentMinutes || 0), 0);
    
    const dayCounts = {};
    flow.forEach(f => {
      if (!f.timestamp) return;
      const ds = new Date(f.timestamp).toISOString().split('T')[0];
      dayCounts[ds] = (dayCounts[ds] || 0) + 1;
    });
    practice.forEach(p => {
      if (!p.startedAt) return;
      const ds = new Date(p.startedAt).toISOString().split('T')[0];
      dayCounts[ds] = (dayCounts[ds] || 0) + 1;
    });
    
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (dayCounts[ds] > 0) {
        streak++;
      } else {
        if (i > 0) break; // Missed a day before today breaks streak
      }
    }
    
    // Last 7 days chart data
    const graphData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      graphData.push(dayCounts[ds] || 0);
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
      graph: graphData
    };
    
    await admin.database().ref('dashboard_stats').set(payload);
  } catch (e) {
    console.error('Firebase Sync Error', e.message);
  }
}
`;

if (!code.includes('syncDashboardMetrics')) {
  code = code.replace('function startServer() {', syncFn + '\nfunction startServer() {');
  
  // Call it periodically and on endpoints
  const callCode = `
  syncDashboardMetrics();
  setInterval(syncDashboardMetrics, 60000); // Sync every minute
`;
  code = code.replace('const server = express();', 'const server = express();\n' + callCode);
  
  fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', code);
  console.log('Patched main.cjs with dashboard metrics sync');
} else {
  console.log('Already patched');
}
