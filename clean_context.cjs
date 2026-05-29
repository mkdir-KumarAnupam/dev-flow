const fs = require('fs');
const path = require('path');

const contextPath = path.join(__dirname, 'dashboard', 'src', 'context', 'GlobalAppContext.tsx');
let code = fs.readFileSync(contextPath, 'utf8');

// Replace standard useState for theme with a constant 'oled'
code = code.replace(/const \[theme, setTheme\] = useState<string>\(localStorage\.getItem\('devos-theme'\) \|\| 'dark'\);/g, "const theme = 'oled';\n  const setTheme = () => {};");

// Remove useEffect that watches 'theme'
code = code.replace(/useEffect\(\(\) => \{\s*localStorage\.setItem\('devos-theme', theme\);\s*if \(theme === 'light'\) document\.body\.classList\.remove\('dark', 'oled', 'brutal'\);\s*else \{\s*document\.body\.classList\.remove\('dark', 'oled', 'brutal'\);\s*document\.body\.classList\.add\(theme\);\s*\}\s*\}, \[theme\]\);/g, '');

fs.writeFileSync(contextPath, code);
console.log('GlobalAppContext cleaned!');
