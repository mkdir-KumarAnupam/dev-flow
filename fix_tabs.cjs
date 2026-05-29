const fs = require('fs');

// 1. Read App.tsx
const appLines = fs.readFileSync('dashboard/src/App.tsx', 'utf8').split('\n');

// 2. Extract Overview body (lines 204 to 516)
const overviewBody = appLines.slice(203, 516).join('\n');

// 3. Read DashboardOverviewTab.tsx
const tabLines = fs.readFileSync('dashboard/src/components/views/DashboardOverviewTab.tsx', 'utf8').split('\n');

// 4. Wrap DashboardOverviewTab return in <>
const returnIdx = tabLines.findIndex(l => l.includes('return ('));
tabLines.splice(returnIdx + 1, 0, '    <>');

// 5. Append Overview body before the closing );
const endIdx = tabLines.lastIndexOf('  );');
tabLines.splice(endIdx, 0, overviewBody, '    </>');

// 6. Save DashboardOverviewTab.tsx
fs.writeFileSync('dashboard/src/components/views/DashboardOverviewTab.tsx', tabLines.join('\n'));

// 7. Remove Overview body and the old injected tabs from App.tsx
// First, find the injected tabs AnimatePresence block at the end
const injectStart = appLines.findIndex((l, i) => i > 800 && l.includes('<AnimatePresence mode="wait">'));
const injectEnd = appLines.findIndex((l, i) => i > injectStart && l.includes('</AnimatePresence>'));

// Remove the injected tabs from the bottom
if (injectStart !== -1 && injectEnd !== -1) {
    appLines.splice(injectStart, injectEnd - injectStart + 1);
}

// Replace activeTab === 'Overview' block with the consolidated AnimatePresence block
const newBlock = `
          <AnimatePresence mode="wait">
            {activeTab === 'Overview' && <DashboardOverviewTab />}
            {activeTab === 'Workspace' && <AssetWorkspaceTab />}
            {activeTab === 'Tracker' && <KanbanTrackerTab />}
            {activeTab === 'Arena' && <CodingArenaTab />}
            {activeTab === 'Focus' && <FocusTimerTab />}
            {activeTab === 'Playground' && <DeveloperPlaygroundTab />}
          </AnimatePresence>
`.trimEnd();

const overviewStart = appLines.findIndex(l => l.includes("{activeTab === 'Overview'"));
const overviewEnd = appLines.findIndex((l, i) => i > overviewStart && l.includes('</>)}'));

appLines.splice(overviewStart, overviewEnd - overviewStart + 1, newBlock);

fs.writeFileSync('dashboard/src/App.tsx', appLines.join('\n'));
console.log('Successfully restructured tabs!');
