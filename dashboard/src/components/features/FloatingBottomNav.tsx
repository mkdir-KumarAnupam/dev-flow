import { motion } from 'framer-motion';
import { Activity, Layers, Target, Sword, Timer, FlaskConical, Code } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

export default function FloatingBottomNav() {
  const { activeTab, setActiveTab } = useGlobalApp();

  return (
<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110]">
        <div className="glass-panel backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-2xl rounded-full p-1.5 flex items-center gap-1.5">
          {/* Terminal Toggle Button */}
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-terminal'))} className={`group relative p-3 rounded-full flex items-center justify-center transition-all text-slate-500 hover:text-violet-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 mr-2 border-r border-slate-700/50 pr-4 z-10`}>
            <Code className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center whitespace-nowrap">
              <span className="text-[10px] font-bold text-foreground">Terminal (Ctrl+`)</span>
            </div>
          </button>
          <button onClick={() => setActiveTab('Overview')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Overview' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Overview' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Activity className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Flow</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Workspace')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Workspace' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Workspace' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Layers className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Stack</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Tracker')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Tracker' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Tracker' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Target className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Focus</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Arena')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Arena' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Arena' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Sword className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Sketch</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Focus')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Focus' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Focus' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Timer className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Timer</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Playground')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Playground' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Playground' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <FlaskConical className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Playground</span>
            </div>
          </button>

        </div>
      </div>
  );
}
