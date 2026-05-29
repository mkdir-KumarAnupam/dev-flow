const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf-8');

// Find the first Sketch button
const sketchBtnStart = `<button onClick={() => setActiveTab('Arena')}`;
const sketchBtnEnd = `<span className="text-[10px] font-bold text-foreground">Sketch</span>
            </div>`;

const idxSketch1Start = content.indexOf(sketchBtnStart);
const idxSketch1End = content.indexOf(sketchBtnEnd, idxSketch1Start);

if (idxSketch1Start !== -1 && idxSketch1End !== -1) {
    // We will keep everything up to the end of the Sketch button's inner div
    const goodContent = content.substring(0, idxSketch1End + sketchBtnEnd.length);
    
    // Now we append the closing tag for Sketch, plus the remaining buttons, plus the end of the dock
    const restOfDock = `
          </button>

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
          </button>
        </div>
      </div>

      </motion.div>
        )}
      </AnimatePresence>

`;

    // Now find the Deployments Modal
    const deploymentsModalStr = `{/* Deployments Modal */}`;
    // Find the LAST instance of Deployments Modal because the file might be duplicated
    const lastIdxDeploy = content.lastIndexOf(deploymentsModalStr);
    
    if (lastIdxDeploy !== -1) {
        const finalContent = goodContent + restOfDock + content.substring(lastIdxDeploy - 6);
        fs.writeFileSync('App.tsx', finalContent, 'utf-8');
        console.log('App.tsx completely repaired');
    } else {
        console.log('Failed to find Deployments Modal');
    }
} else {
    console.log('Failed to find Sketch button start or end');
}
