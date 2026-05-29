const fs = require('fs');

const content = fs.readFileSync('App.tsx', 'utf-8');
const lines = content.split('\n');

const components = [];
let currentComponent = null;

const componentRegex = /^(?:export\s+default\s+)?(?:const\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]+)\s*=>|function\s+(\w+)\s*\([^)]*\))/;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(componentRegex);
    
    if (match) {
        if (currentComponent) {
            currentComponent.endLine = i - 1;
            components.push(currentComponent);
        }
        
        const name = match[1] || match[2];
        currentComponent = {
            name: name,
            startLine: i + 1,
            endLine: -1
        };
    }
}

if (currentComponent) {
    currentComponent.endLine = lines.length;
    components.push(currentComponent);
}

console.log("Found components:");
components.forEach(c => {
    const lineCount = c.endLine - c.startLine + 1;
    console.log(`- ${c.name}: Lines ${c.startLine} to ${c.endLine} (${lineCount} lines)`);
});
