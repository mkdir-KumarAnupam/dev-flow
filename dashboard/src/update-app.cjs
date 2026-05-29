const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf-8');

// 1. Add import
if (!content.includes("import CourseHub from './CourseHub';")) {
  content = content.replace(
    "import Playground from './Playground';",
    "import Playground from './Playground';\nimport CourseHub from './CourseHub';"
  );
}

// 2. Add Component Render
if (!content.includes("activeTab === 'Courses'")) {
  const playgroundStr = `{activeTab === 'Playground' && (
             <div className="w-full h-[calc(100vh-120px)] relative z-10">
               <Playground />
             </div>
           )}`;
  const replaceStr = playgroundStr + `\n           {activeTab === 'Courses' && (
             <div className="w-full h-[calc(100vh-120px)] relative z-10">
               <CourseHub />
             </div>
           )}`;
  content = content.replace(playgroundStr, replaceStr);
}

// 3. Add to Navbar
if (!content.includes("setActiveTab('Courses')")) {
  // Try finding the Playground button to insert after it
  const playgroundBtn = `<button onClick={() => setActiveTab('Playground')} className={\`group relative p-3 rounded-full flex items-center justify-center transition-all \${activeTab === 'Playground' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}\`}>
            {activeTab === 'Playground' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <FlaskConical className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Playground</span>
            </div>
          </button>`;
  const coursesBtn = `<button onClick={() => setActiveTab('Courses')} className={\`group relative p-3 rounded-full flex items-center justify-center transition-all \${activeTab === 'Courses' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}\`}>
            {activeTab === 'Courses' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Layers className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Courses</span>
            </div>
          </button>`;
  content = content.replace(playgroundBtn, playgroundBtn + '\n          ' + coursesBtn);
}

fs.writeFileSync('App.tsx', content, 'utf-8');
console.log('App.tsx updated');
