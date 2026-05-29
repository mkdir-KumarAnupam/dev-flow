const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf-8');

const sketchBtn = `            <Sword className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Sketch</span>
            </div>
          </button>`;

const firstIdx = content.indexOf(sketchBtn);
const lastIdx = content.lastIndexOf(sketchBtn);

if (firstIdx !== -1 && lastIdx !== -1 && firstIdx !== lastIdx) {
    // Delete everything between first instance of sketchBtn and second instance of sketchBtn
    const before = content.substring(0, firstIdx + sketchBtn.length);
    const after = content.substring(lastIdx + sketchBtn.length);
    
    // We also need to add Focus, Playground, and Courses!
    const missingButtons = `
          <button onClick={() => setActiveTab('Focus')} className={\`group relative p-3 rounded-full flex items-center justify-center transition-all \${activeTab === 'Focus' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}\`}>
            {activeTab === 'Focus' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Timer className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Timer</span>
            </div>
          </button>
          
          <button onClick={() => setActiveTab('Playground')} className={\`group relative p-3 rounded-full flex items-center justify-center transition-all \${activeTab === 'Playground' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}\`}>
            {activeTab === 'Playground' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <FlaskConical className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Playground</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Courses')} className={\`group relative p-3 rounded-full flex items-center justify-center transition-all \${activeTab === 'Courses' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}\`}>
            {activeTab === 'Courses' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <List className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Courses</span>
            </div>
          </button>`;

    content = before + '\n' + missingButtons + after;
    fs.writeFileSync('App.tsx', content, 'utf-8');
    console.log('App.tsx fixed successfully.');
} else {
    console.log('Could not find duplicates to fix.');
}
