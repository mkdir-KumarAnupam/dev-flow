const fs = require('fs');

const path = 'dashboard/src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const newImports = `
import SetupOnboardingScreen from './components/features/SetupOnboardingScreen';
import GlobalCommandPalette from './components/features/GlobalCommandPalette';
`;

content = content.replace("import ActivityHeatmapGrid from './components/ui/ActivityHeatmapGrid';", "import ActivityHeatmapGrid from './components/ui/ActivityHeatmapGrid';\n" + newImports);

let onboardingComponent = "";
let commandPaletteComponent = "";

function extractBlock(startStr, endStr) {
    const startIndex = content.indexOf(startStr);
    if (startIndex === -1) return null;
    const endIndex = content.indexOf(endStr, startIndex) + endStr.length;
    if (endIndex - endStr.length === -1) return null;
    
    const block = content.substring(startIndex, endIndex);
    content = content.substring(0, startIndex) + content.substring(endIndex);
    return block;
}

// Extract SetupOnboardingScreen
onboardingComponent = extractBlock("const OnboardingScreen = ({ onComplete }: { onComplete: () => void }) => {", "          </motion.div>\n        </AnimatePresence>\n      </div>\n    </div>\n  );\n};\n");
if (!onboardingComponent) console.log("Failed to extract Onboarding");

// Extract GlobalCommandPalette 
commandPaletteComponent = extractBlock("const CommandPalette = () => {", "      )}\n    </AnimatePresence>\n  );\n};\n");
if (!commandPaletteComponent) console.log("Failed to extract CommandPalette");

if (onboardingComponent) {
    // Write OnboardingScreen
    let code = `import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Monitor, Server, Rocket, ArrowRight } from 'lucide-react';
const apiUrl = (path: string) => typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin + (path.startsWith('/') ? path : '/' + path) : 'http://localhost:4000' + (path.startsWith('/') ? path : '/' + path);
const isElectronRuntime = () => typeof window !== 'undefined' && typeof (window as any).require === 'function';
`;
    code += onboardingComponent.replace("const OnboardingScreen =", "const SetupOnboardingScreen =");
    code += "\nexport default SetupOnboardingScreen;\n";
    fs.writeFileSync('dashboard/src/components/features/SetupOnboardingScreen.tsx', code);
    content = content.replace(/<OnboardingScreen /g, '<SetupOnboardingScreen ');
}

if (commandPaletteComponent) {
    let code = `import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';
import { Search, X, Code2, AlertTriangle, Monitor, Play, Minus } from 'lucide-react';
const apiUrl = (path: string) => typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin + (path.startsWith('/') ? path : '/' + path) : 'http://localhost:4000' + (path.startsWith('/') ? path : '/' + path);
`;
    code += commandPaletteComponent.replace("const CommandPalette =", "const GlobalCommandPalette =").replace(/<Terminal/g, '<XTerminal');
    code += "\nexport default GlobalCommandPalette;\n";
    fs.writeFileSync('dashboard/src/components/features/GlobalCommandPalette.tsx', code);
    content = content.replace(/<CommandPalette \/>/g, '<GlobalCommandPalette />');
}

fs.writeFileSync(path, content);
console.log("Done extracting features.");
