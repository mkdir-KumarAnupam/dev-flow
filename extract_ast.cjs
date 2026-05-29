const ts = require('typescript');
const fs = require('fs');

const fileContent = fs.readFileSync('dashboard/src/App.tsx', 'utf8');
const sourceFile = ts.createSourceFile('App.tsx', fileContent, ts.ScriptTarget.Latest, true);

let onboardingStr = '';
let paletteStr = '';
let appStart = 0;

ts.forEachChild(sourceFile, node => {
  if (ts.isVariableStatement(node)) {
    const decl = node.declarationList.declarations[0];
    if (decl.name.text === 'OnboardingScreen') {
        onboardingStr = fileContent.substring(node.pos, node.end);
    }
    if (decl.name.text === 'CommandPalette') {
        paletteStr = fileContent.substring(node.pos, node.end);
    }
  }
});

console.log(onboardingStr ? "Found Onboarding!" : "Missing Onboarding");
console.log(paletteStr ? "Found Palette!" : "Missing Palette");

if (onboardingStr && paletteStr) {
    let newApp = fileContent.replace(onboardingStr, '').replace(paletteStr, '');
    fs.writeFileSync('dashboard/src/App.tsx', newApp);
    
    // Write the files
    let codeO = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Monitor, Server, Rocket, ArrowRight } from 'lucide-react';
const apiUrl = (path: string) => typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin + (path.startsWith('/') ? path : '/' + path) : 'http://localhost:4000' + (path.startsWith('/') ? path : '/' + path);
const isElectronRuntime = () => typeof window !== 'undefined' && typeof (window as any).require === 'function';\n`;
    codeO += onboardingStr.replace("const OnboardingScreen =", "const SetupOnboardingScreen =");
    codeO += "\nexport default SetupOnboardingScreen;\n";
    fs.writeFileSync('dashboard/src/components/features/SetupOnboardingScreen.tsx', codeO.trim());
    
    let codeP = `import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';
import { Search, X, Code2, AlertTriangle, Monitor, Play, Minus } from 'lucide-react';
const apiUrl = (path: string) => typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin + (path.startsWith('/') ? path : '/' + path) : 'http://localhost:4000' + (path.startsWith('/') ? path : '/' + path);
\n`;
    codeP += paletteStr.replace("const CommandPalette =", "const GlobalCommandPalette =");
    codeP += "\nexport default GlobalCommandPalette;\n";
    fs.writeFileSync('dashboard/src/components/features/GlobalCommandPalette.tsx', codeP.trim());
    
    console.log("Successfully extracted via AST!");
}
