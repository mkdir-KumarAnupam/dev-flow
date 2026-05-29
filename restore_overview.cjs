const fs = require('fs');
const cp = require('child_process');

// 1. Get the original 3000-line file directly via git buffer (avoids PowerShell UTF-16 corruption)
const origAppBuffer = cp.execSync('git show f287645:dashboard/src/App.tsx');
const origApp = origAppBuffer.toString('utf8').split('\n');

// 2. Find the Overview body
const startIdx = origApp.findIndex(l => l.includes("{activeTab === 'Overview' && (<>"));
const endIdx = origApp.findIndex((l, i) => i > startIdx && l.includes('</>)}'));

const overviewBody = origApp.slice(startIdx + 1, endIdx).join('\n');

// 3. Prepare the getGreeting functions
const greetingCode = `
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getGreetingIcon = () => {
  const hour = new Date().getHours();
  if (hour < 12) return <Sun className="w-5 h-5" />;
  if (hour < 18) return <Sun className="w-5 h-5 text-amber-500" />;
  return <Moon className="w-5 h-5" />;
};
`;

// 4. Read the current DashboardOverviewTab.tsx
const tabLines = fs.readFileSync('dashboard/src/components/views/DashboardOverviewTab.tsx', 'utf8').split('\n');

// 5. Inject getGreeting BEFORE export default
const componentStartIdx = tabLines.findIndex(l => l.includes('export default function DashboardOverviewTab()'));
tabLines.splice(componentStartIdx, 0, greetingCode);

// 6. Wrap return in <>
const returnIdx = tabLines.findIndex(l => l.includes('return ('));
tabLines.splice(returnIdx + 1, 0, '    <>');

// 7. Inject the Overview body correctly!
const closeIdx = tabLines.findIndex((l, i) => i > returnIdx && l.includes('  );'));
if (closeIdx !== -1) {
    tabLines.splice(closeIdx, 0, overviewBody, '    </>');
}

fs.writeFileSync('dashboard/src/components/views/DashboardOverviewTab.tsx', tabLines.join('\n'));
console.log('Restored Overview body and greeting functions!');
