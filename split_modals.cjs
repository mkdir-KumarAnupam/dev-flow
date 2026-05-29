const fs = require('fs');
const path = require('path');

const modalsDir = path.join(__dirname, 'dashboard', 'src', 'components', 'features', 'modals');
if (!fs.existsSync(modalsDir)) {
    fs.mkdirSync(modalsDir, { recursive: true });
}

const sourceFile = path.join(__dirname, 'dashboard', 'src', 'components', 'features', 'GlobalModals.tsx');
let sourceCode = fs.readFileSync(sourceFile, 'utf8');

const modalDefinitions = [
    { name: 'RemoteDashboardModal', condition: 'showRemoteQRCode', startToken: '{showRemoteQRCode && (' },
    { name: 'AllWorkspacesModal', condition: 'modalOpen', startToken: '{modalOpen && (' },
    { name: 'CodeSearchModal', condition: 'codeModal', startToken: '{codeModal && (' },
    { name: 'SketchUpdateModal', condition: 'sketchModal', startToken: '{sketchModal && (' },
    { name: 'ScreenshotPreviewModal', condition: 'captureModal', startToken: '{captureModal && (' },
    { name: 'DevFocusSessionsModal', condition: 'flowModalOpen', startToken: '{flowModalOpen && (' },
    { name: 'GitStatusModal', condition: 'gitModalOpen', startToken: '{gitModalOpen && (' },
    { name: 'DrilldownModal', condition: 'drilldown', startToken: '{drilldown && (' },
    { name: 'IssueDetailsModal', condition: 'selectedIssue', startToken: '{selectedIssue && (' },
    { name: 'DeploymentsModal', condition: 'manageDeployment', startToken: '{manageDeployment && (' }
];

const lucideIcons = ['X', 'Activity', 'FolderGit2', 'FolderOpen', 'Layers', 'Play', 'Search', 'Trash2', 'FileCode', 'Code', 'Clock', 'Zap', 'Box', 'Tag', 'User', 'RefreshCw', 'Server', 'Cloud', 'Flame', 'Globe', 'Wifi'];

function getUsedIcons(code) {
    return lucideIcons.filter(icon => new RegExp(`\\b${icon}\\b`).test(code));
}

let newGlobalModalsCode = `import React from 'react';
`;

for (const def of modalDefinitions) {
    newGlobalModalsCode += `import ${def.name} from './modals/${def.name}';\n`;
}

newGlobalModalsCode += `
export default function GlobalModals() {
  return (
    <>
`;
for (const def of modalDefinitions) {
    newGlobalModalsCode += `      <${def.name} />\n`;
}
newGlobalModalsCode += `    </>
  );
}
`;

for (const def of modalDefinitions) {
    const tokenIdx = sourceCode.indexOf(def.startToken);
    if (tokenIdx === -1) {
        console.error(`Could not find token ${def.startToken} for ${def.name}`);
        continue;
    }
    
    // Find nearest <AnimatePresence> before tokenIdx
    const startStr = '<AnimatePresence>';
    const startIdx = sourceCode.lastIndexOf(startStr, tokenIdx);
    
    // Find nearest </AnimatePresence> after tokenIdx
    const endStr = '</AnimatePresence>';
    let endIdx = sourceCode.indexOf(endStr, tokenIdx);
    
    if (startIdx === -1 || endIdx === -1) {
        console.error(`Could not find bounds for ${def.name}`);
        continue;
    }
    
    endIdx += endStr.length;

    const block = sourceCode.substring(startIdx, endIdx);

    const usedIcons = getUsedIcons(block);
    let imports = `import { motion, AnimatePresence } from 'framer-motion';\n`;
    if (usedIcons.length > 0) imports += `import { ${usedIcons.join(', ')} } from 'lucide-react';\n`;
    if (block.includes('QRCodeSVG')) imports += `import { QRCodeSVG } from 'qrcode.react';\n`;
    if (block.includes('Badge')) imports += `import { Badge } from '@/components/ui/badge';\n`;
    if (block.includes('Whiteboard')) imports += `import Whiteboard from '@/Whiteboard';\n`;
    imports += `import { useGlobalApp } from '@/context/GlobalAppContext';\n\n`;

    imports += `const mV: any = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } };\n\n`;

    let stateDestructures = [];
    const possibleStates = [
        'modalOpen', 'setModalOpen', 'search', 'setSearch', 'codeModal', 'setCodeModal', 
        'sketchModal', 'setSketchModal', 'captureModal', 'setCaptureModal', 
        'flowModalOpen', 'setFlowModalOpen', 'gitModalOpen', 'setGitModalOpen', 
        'drilldown', 'setDrilldown', 'selectedIssue', 'setSelectedIssue', 
        'showRemoteQRCode', 'setShowRemoteQRCode', 'manageDeployment', 'setManageDeployment', 
        'isHealthChecking', 'setIsHealthChecking', 'fetchAll', 'flow', 'projects', 'sandboxes', 
        'gitStatus', 'deleteFlow', 'resumeWork', 'openSandbox', 'remoteDashboardUrl'
    ];

    for (const state of possibleStates) {
        if (new RegExp(`\\b${state}\\b`).test(block)) {
            stateDestructures.push(state);
        }
    }

    let componentCode = `export default function ${def.name}() {\n`;
    componentCode += `  const { ${stateDestructures.join(', ')} } = useGlobalApp();\n`;
    
    if (block.includes('API_BASE') || block.includes('apiUrl')) {
        componentCode += `  const API_BASE = typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin : 'http://localhost:4000';\n`;
        componentCode += `  const apiUrl = (path: string) => \`\${API_BASE}\${path.startsWith('/') ? path : \`/\${path}\`}\`;\n`;
    }

    componentCode += `\n  return (\n    ${block}\n  );\n}\n`;

    fs.writeFileSync(path.join(modalsDir, `${def.name}.tsx`), imports + componentCode);
    console.log(`Generated ${def.name}.tsx`);
}

fs.writeFileSync(sourceFile, newGlobalModalsCode);
console.log('Updated GlobalModals.tsx');
