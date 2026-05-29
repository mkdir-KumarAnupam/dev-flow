const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'dashboard', 'src', 'App.tsx');
let code = fs.readFileSync(appPath, 'utf8');

// 1. Extract GlobalModals
// It includes: RemoteDashboard (HEADER), MODALS section, and Deployments section.
// We'll create GlobalModals.tsx

let globalModalsCode = `import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Activity, FolderGit2, FolderOpen, Layers, Play, Search, 
  Trash2, FileCode, Code, Clock, Zap, Box, Tag, User, 
  RefreshCw, Server, Cloud, Flame, Globe, Wifi
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { useGlobalApp } from '@/context/GlobalAppContext';
import Whiteboard from '@/Whiteboard';

// Reuse animation variants
const mV: any = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } };

export default function GlobalModals() {
  const { 
    modalOpen, setModalOpen, search, setSearch, codeModal, setCodeModal, 
    sketchModal, setSketchModal, captureModal, setCaptureModal, 
    flowModalOpen, setFlowModalOpen, gitModalOpen, setGitModalOpen, 
    drilldown, setDrilldown, selectedIssue, setSelectedIssue, 
    showRemoteQRCode, setShowRemoteQRCode, manageDeployment, setManageDeployment, 
    isHealthChecking, setIsHealthChecking, fetchAll, flow, projects, sandboxes, 
    gitStatus, deleteFlow, resumeWork, openSandbox, remoteDashboardUrl 
  } = useGlobalApp();

  const API_BASE = typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin : 'http://localhost:4000';
  const apiUrl = (path: string) => \`\${API_BASE}\${path.startsWith('/') ? path : \`/\${path}\`}\`;

  return (
    <>
`;

// Extract Remote Dashboard Modal
const headerMatch = code.match(/\{\/\*\s*═══ HEADER ═══\s*\*\/\}([\s\S]*?)<AnimatePresence mode="wait">/);
if (headerMatch) {
  globalModalsCode += headerMatch[1].trim() + '\n\n';
  code = code.replace(headerMatch[1], ''); // Keep the HEADER comment
}

// Extract Main Modals
const modalsMatch = code.match(/\{\/\*\s*═══ MODALS ═══\s*\*\/\}([\s\S]*?)<\/div>\s*\{\/\* End inner scrolling container \*\/\}/);
if (modalsMatch) {
  globalModalsCode += modalsMatch[1].trim() + '\n\n';
  code = code.replace(modalsMatch[1], ''); // Keep the MODALS comment
}

// Extract Deployments Modal
const deployMatch = code.match(/\{\/\*\s*Deployments Modal\s*\*\/\}([\s\S]*?)<\/div>\s*\n\s*\);\s*\n\}/);
if (deployMatch) {
  globalModalsCode += '{/* Deployments Modal */}\n' + deployMatch[1].trim() + '\n';
  code = code.replace(deployMatch[0], '</div>\n  );\n}'); // Keep the closing tags
}

globalModalsCode += `
    </>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'dashboard', 'src', 'components', 'features', 'GlobalModals.tsx'), globalModalsCode);


// 2. Extract FloatingBottomNav
let floatingNavCode = `import { motion } from 'framer-motion';
import { Activity, Layers, Target, Sword, Timer, FlaskConical, Code } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

export default function FloatingBottomNav() {
  const { activeTab, setActiveTab } = useGlobalApp();

  return (
`;

const navMatch = code.match(/\{\/\*\s*═══ FLOATING BOTTOM NAV ═══\s*\*\/\}([\s\S]*?)<\/motion\.div>\s*\n\s*\)\}/);
if (navMatch) {
  floatingNavCode += navMatch[1].trim() + '\n  );\n}\n';
  code = code.replace(navMatch[1], '\n        <FloatingBottomNav />\n      ');
}

fs.writeFileSync(path.join(__dirname, 'dashboard', 'src', 'components', 'features', 'FloatingBottomNav.tsx'), floatingNavCode);


// 3. Inject imports into App.tsx
// Add GlobalModals to the MODALS section
code = code.replace(/\{\/\*\s*═══ MODALS ═══\s*\*\/\}/, '{/* ═══ MODALS ═══ */}\n      <GlobalModals />');

// Inject import statements at the top
const importsToAdd = `
import GlobalModals from './components/features/GlobalModals';
import FloatingBottomNav from './components/features/FloatingBottomNav';
`;
code = code.replace(/import GlobalCommandPalette from '\.\/components\/features\/GlobalCommandPalette';/, "import GlobalCommandPalette from './components/features/GlobalCommandPalette';\n" + importsToAdd);

// Remove unused state destructurings from useGlobalApp() in App.tsx to avoid linter warnings
// (We just leave it as is for now, it doesn't hurt, but we can clean it if we want).

fs.writeFileSync(appPath, code);

console.log('Extraction complete!');
