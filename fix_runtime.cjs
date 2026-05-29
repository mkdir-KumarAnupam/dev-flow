const fs = require('fs');

// 1. Get the getGreeting functions
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

// 2. Read the full App.tsx from scratch_app.tsx (which has the 3000-line version)
const oldApp = fs.readFileSync('scratch_app.tsx', 'utf8').split('\n');
const startIdx = oldApp.findIndex(l => l.includes("{activeTab === 'Overview'"));
const endIdx = oldApp.findIndex((l, i) => i > startIdx && l.includes('</>)}'));

const overviewBody = oldApp.slice(startIdx + 1, endIdx).join('\n');

// 3. Read DashboardOverviewTab.tsx
const tabLines = fs.readFileSync('dashboard/src/components/views/DashboardOverviewTab.tsx', 'utf8').split('\n');

// 4. Inject getGreeting
const componentStartIdx = tabLines.findIndex(l => l.includes('export default function DashboardOverviewTab()'));
tabLines.splice(componentStartIdx, 0, greetingCode);

// 5. Wrap return in <>
const returnIdx = tabLines.findIndex(l => l.includes('return ('));
tabLines.splice(returnIdx + 1, 0, '    <>');

// 6. Append Overview body
const closeIdx = tabLines.lastIndexOf('  );');
tabLines.splice(closeIdx, 0, overviewBody, '    </>');

fs.writeFileSync('dashboard/src/components/views/DashboardOverviewTab.tsx', tabLines.join('\n'));
console.log('Fixed DashboardOverviewTab!');
