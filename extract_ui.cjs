const fs = require('fs');

const path = 'dashboard/src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// The new imports
const newImports = `
import TrendArrowIcon from './components/ui/TrendArrowIcon';
import MetricCard from './components/ui/MetricCard';
import SectionHeader from './components/ui/SectionHeader';
import LiveDateTimeClock from './components/ui/LiveDateTimeClock';
import ActivityHeatmapGrid from './components/ui/ActivityHeatmapGrid';
`;

// Insert new imports after QRCodeSVG
content = content.replace("import { QRCodeSVG } from 'qrcode.react';", "import { QRCodeSVG } from 'qrcode.react';\n" + newImports);

function removeBlock(startStr, endStr) {
    const startIndex = content.indexOf(startStr);
    if (startIndex === -1) {
        console.log("Could not find start: " + startStr.substring(0, 30));
        return;
    }
    const endIndex = content.indexOf(endStr, startIndex) + endStr.length;
    if (endIndex - endStr.length === -1) {
        console.log("Could not find end: " + endStr);
        return;
    }
    
    content = content.substring(0, startIndex) + content.substring(endIndex);
    console.log("Removed block: " + startStr.substring(0, 30) + "...");
}

// 1. TrendIcon
removeBlock("const TrendIcon = ({ trend }", "return <Minus className=\"h-3 w-3 text-slate-400\" />;\n};\n");

// 2. Kpi
removeBlock("const Kpi = ({ icon: Icon, ", "  );\n};\n");

// 3. Sec
removeBlock("const Sec = ({ children }", "  <motion.h2 variants={fadeUp} className=\"text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-[0.2em] pt-2 pb-1\">{children}</motion.h2>\n);\n");

// 4. LiveClock
removeBlock("const LiveClock = () => {", "    </motion.div>\n  );\n};\n");

// 5. Heatmap
removeBlock("const Heatmap = ({ data, onDateClick", "    </div>\n  );\n};\n");

// 6. Replace usages
content = content.replace(/<TrendIcon /g, '<TrendArrowIcon ');
content = content.replace(/<Kpi /g, '<MetricCard ');
content = content.replace(/<Sec>/g, '<SectionHeader>');
content = content.replace(/<\/Sec>/g, '</SectionHeader>');
content = content.replace(/<LiveClock \/>/g, '<LiveDateTimeClock />');
content = content.replace(/<Heatmap /g, '<ActivityHeatmapGrid ');

fs.writeFileSync(path, content);
console.log("Done.");
