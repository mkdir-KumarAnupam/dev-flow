const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'dashboard', 'src');
const appTsxPath = path.join(srcDir, 'App.tsx');

let appContent = fs.readFileSync(appTsxPath, 'utf-8');

// Ensure directories exist
fs.mkdirSync(path.join(srcDir, 'components', 'ui'), { recursive: true });
fs.mkdirSync(path.join(srcDir, 'components', 'features'), { recursive: true });

function extractComponent(name, newName, folder, isFeature = false) {
    const regex = new RegExp(`const ${name} = .*?(?:;|\\}\\);)`, 's');
    const match = appContent.match(regex);
    if (!match) {
        console.log(`Could not find ${name}`);
        return;
    }
    
    let componentCode = match[0];
    
    // Add standard imports
    let imports = `import React, { useState, useEffect, useRef } from 'react';\n`;
    if (componentCode.includes('motion')) imports += `import { motion, AnimatePresence } from 'framer-motion';\n`;
    if (componentCode.includes('Card')) imports += `import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";\n`;
    if (componentCode.includes('Terminal')) {
        imports += `import { Terminal } from 'xterm';\nimport { FitAddon } from '@xterm/addon-fit';\nimport 'xterm/css/xterm.css';\n`;
    }
    // Simple lucide extraction
    const lucideRegex = /<([A-Z][a-zA-Z]+)[^>]*className=.*?lucide/g;
    // Actually, let's just import all commonly used icons in these components
    imports += `import { ArrowUpRight, ArrowDownRight, Minus, Moon, Sun, Sunset, Rocket, Code, Monitor, Play, List } from 'lucide-react';\n`;
    
    // Rename inside code
    componentCode = componentCode.replace(new RegExp(`const ${name} =`, 'g'), `const ${newName} =`);
    
    let finalCode = imports + '\n' + componentCode + `\n\nexport default ${newName};\n`;
    
    fs.writeFileSync(path.join(srcDir, 'components', folder, `${newName}.tsx`), finalCode);
    
    // Replace in App.tsx
    appContent = appContent.replace(match[0], '');
    console.log(`Extracted ${newName}`);
}

extractComponent('TrendIcon', 'TrendArrowIcon', 'ui');
extractComponent('Kpi', 'MetricCard', 'ui');
extractComponent('Sec', 'SectionHeader', 'ui');
extractComponent('LiveClock', 'LiveDateTimeClock', 'ui');
extractComponent('Heatmap', 'ActivityHeatmapGrid', 'ui');
extractComponent('OnboardingScreen', 'SetupOnboardingScreen', 'features', true);
extractComponent('CommandPalette', 'GlobalCommandPalette', 'features', true);

// Remove getGreeting and getGreetingIcon
const regexGreeting = /const getGreeting = .*?;/s;
const matchGreeting = appContent.match(regexGreeting);
let utilsCode = `import { Moon, Sun, Sunset } from 'lucide-react';\n\n`;
if (matchGreeting) {
    utilsCode += matchGreeting[0] + '\n\n';
    appContent = appContent.replace(matchGreeting[0], '');
}

const regexGreetingIcon = /const getGreetingIcon = .*?;/s;
const matchGreetingIcon = appContent.match(regexGreetingIcon);
if (matchGreetingIcon) {
    utilsCode += matchGreetingIcon[0] + '\n\n';
    appContent = appContent.replace(matchGreetingIcon[0], '');
}
utilsCode += `export { getGreeting, getGreetingIcon };\n`;
fs.writeFileSync(path.join(srcDir, 'components', 'ui', 'greetingUtils.tsx'), utilsCode);

// Add new imports at the top of App.tsx
const newImports = `
import TrendArrowIcon from './components/ui/TrendArrowIcon';
import MetricCard from './components/ui/MetricCard';
import SectionHeader from './components/ui/SectionHeader';
import LiveDateTimeClock from './components/ui/LiveDateTimeClock';
import ActivityHeatmapGrid from './components/ui/ActivityHeatmapGrid';
import SetupOnboardingScreen from './components/features/SetupOnboardingScreen';
import GlobalCommandPalette from './components/features/GlobalCommandPalette';
import { getGreeting, getGreetingIcon } from './components/ui/greetingUtils';
`;

appContent = appContent.replace(/import { QRCodeSVG } from 'qrcode.react';/, `import { QRCodeSVG } from 'qrcode.react';${newImports}`);

// Rename usages in App.tsx
appContent = appContent.replace(/<TrendIcon /g, '<TrendArrowIcon ');
appContent = appContent.replace(/<Kpi /g, '<MetricCard ');
appContent = appContent.replace(/<Sec>/g, '<SectionHeader>');
appContent = appContent.replace(/<\/Sec>/g, '</SectionHeader>');
appContent = appContent.replace(/<LiveClock \/>/g, '<LiveDateTimeClock />');
appContent = appContent.replace(/<Heatmap /g, '<ActivityHeatmapGrid ');
appContent = appContent.replace(/<OnboardingScreen /g, '<SetupOnboardingScreen ');
appContent = appContent.replace(/<CommandPalette \/>/g, '<GlobalCommandPalette />');

fs.writeFileSync(appTsxPath, appContent);
console.log('Modularization complete!');
