const fs = require('fs');
let code = fs.readFileSync('dashboard/src/App.tsx', 'utf8');

// Replace the recharts import completely
code = code.replace(/import\s*\{\s*[^}]*\}\s*from\s*'recharts';/s, '');

// Replace the Lucide icons import with just the used ones
const usedIcons = 'Code, Clock, FolderGit2, Search, X, Flame, Target, Zap, Camera, Layers, Activity, Play, Trash2, FileCode, FolderOpen, Box, Sun, Sunset, Moon, Sword, Timer, User, Tag, FlaskConical, Cloud, Globe, Server, RefreshCw, Wifi';
code = code.replace(/import\s*\{\s*[^}]*\}\s*from\s*'lucide-react';/s, `import { ${usedIcons} } from 'lucide-react';`);

// Remove the *Mode components and Playground
code = code.replace(/import RaceMode from '\.\/RaceMode';\s*/, '');
code = code.replace(/import WarMode from '\.\/WarMode';\s*/, '');
code = code.replace(/import SystemDesignMode from '\.\/SystemDesignMode';\s*/, '');
code = code.replace(/import Whiteboard from '\.\/Whiteboard';\s*/, '');
code = code.replace(/import CompetitiveMode from '\.\/CompetitiveMode';\s*/, '');
code = code.replace(/import Playground from '\.\/Playground';\s*/, '');

// Remove unused UI components
code = code.replace(/import TrendArrowIcon from '\.\/components\/ui\/TrendArrowIcon';\s*/, '');
code = code.replace(/import MetricCard from '\.\/components\/ui\/MetricCard';\s*/, '');
code = code.replace(/import SectionHeader from '\.\/components\/ui\/SectionHeader';\s*/, '');
code = code.replace(/import LiveDateTimeClock from '\.\/components\/ui\/LiveDateTimeClock';\s*/, '');
code = code.replace(/import ActivityHeatmapGrid from '\.\/components\/ui\/ActivityHeatmapGrid';\s*/, '');
code = code.replace(/import \{ Card, CardContent, CardHeader, CardTitle, CardDescription \} from "@\/components\/ui\/card";\s*/, '');
code = code.replace(/import \{ Badge \} from "@\/components\/ui\/badge";\s*/, '');

// Clean up extra blank lines
code = code.replace(/\n\s*\n\s*\n/g, '\n\n');

// Save it back
fs.writeFileSync('dashboard/src/App.tsx', code);
console.log('Cleaned up App.tsx');
