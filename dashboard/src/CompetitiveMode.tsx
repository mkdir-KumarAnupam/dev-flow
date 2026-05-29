import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Check, X, Trophy, Save, Activity, RefreshCw, ChevronDown, Sword, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ value, onChange, options, label }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], label: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];
  
  return (
    <div className="relative flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <motion.div 
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/40 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 backdrop-blur-xl rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer flex justify-between items-center hover:bg-white/60 dark:hover:bg-white/[0.06] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_5px_15px_rgba(0,0,0,0.2)]"
      >
        {selectedOption.label}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.div>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-[calc(100%+8px)] left-0 right-0 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] z-50 flex flex-col max-h-56 overflow-y-auto custom-scrollbar"
            >
              {options.map(opt => (
                <motion.div 
                  key={opt.value}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(139, 92, 246, 0.08)' }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors flex items-center justify-between ${value === opt.value ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  {opt.label}
                  {value === opt.value && <Check className="w-4 h-4" />}
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

interface CompetitiveModeProps {
  onBack: () => void;
  practice?: any[];
}

export default function CompetitiveMode({ onBack, practice = [] }: CompetitiveModeProps) {
  const [activeProblem, setActiveProblem] = useState<any>(null);
  const [difficulty, setDifficulty] = useState('any');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [language, setLanguage] = useState('cpp');
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [solved, setSolved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [extractedCode, setExtractedCode] = useState("");
  const webviewRef = useRef<any>(null);

  const startProblem = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (difficulty !== 'any') filters.difficulty = difficulty;
      const validTopics = selectedTopics.filter(t => t !== "random");
      if (validTopics.length > 0) filters.topics = validTopics;

      const res = await fetch('http://localhost:4000/api/competitive/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }
      
      await fetch('http://localhost:4000/api/competitive/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: data.slug, status: 'attempted', problemRecord: data })
      });

      setActiveProblem(data);
      setStartTime(Date.now());
      setElapsed(0);
      setSolved(false);
      setShowSaveModal(false);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch problem");
    }
    setLoading(false);
  };

  const [isHovered, setIsHovered] = useState(false);

  // Compute recommended topics based on practice history
  const [showConfigModal, setShowConfigModal] = useState(false);
  const { recommended, counts } = useMemo(() => {
    const topicCounts: Record<string, number> = {};
    const ALL_TOPICS = ["array", "binary-search", "two-pointers", "sliding-window", "dynamic-programming", "graph", "tree", "stack", "queue", "backtracking", "greedy", "math", "bit-manipulation", "linked-list", "string", "hash-table"];
    ALL_TOPICS.forEach(t => topicCounts[t] = 0);
    
    practice.forEach(p => {
      if (p.status === 'solved' && p.topics && Array.isArray(p.topics)) {
        p.topics.forEach((t: string) => {
          if (topicCounts[t] !== undefined) topicCounts[t]++;
        });
      }
    });

    const sorted = Object.entries(topicCounts).sort((a, b) => a[1] - b[1]);
    return {
      recommended: new Set(sorted.slice(0, 3).map(x => x[0])),
      counts: topicCounts
    };
  }, [practice]);

  const stats = useMemo(() => {
    let solved = 0;
    let attempted = 0;
    let totalMinutes = 0;
    let easy = 0, medium = 0, hard = 0;
    
    practice.forEach(p => {
      attempted++;
      if (p.status === 'solved') {
        solved++;
        totalMinutes += p.timeSpentMinutes || 0;
        if (p.difficulty === 'easy') easy++;
        if (p.difficulty === 'medium') medium++;
        if (p.difficulty === 'hard') hard++;
      }
    });

    const sortedTopics = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topTopics = sortedTopics.slice(0, 3).filter(x => x[1] > 0);

    const winRate = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
    const avgTime = solved > 0 ? Math.round(totalMinutes / solved) : 0;

    const recentProblems = [...practice]
       .filter(p => p.status === 'solved')
       .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
       .slice(0, 3);

    return { solved, attempted, winRate, avgTime, totalMinutes, easy, medium, hard, topTopics, recentProblems };
  }, [practice, counts]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (activeProblem && !solved) {
      timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeProblem, startTime, solved]);

  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval>;
    if (activeProblem && !solved) {
      pollTimer = setInterval(async () => {
        const webview = webviewRef.current;
        if (webview && typeof webview.executeJavaScript === 'function') {
           try {
             const isSolved = await webview.executeJavaScript(`
               (function() {
                   const result = document.querySelector('[data-e2e-locator="submission-result"]') || document.querySelector('.text-green-s');
                   return result ? result.textContent.includes('Accepted') : false;
               })()
             `);
             if (isSolved) {
                 handleSolved();
             }
           } catch(e) {}
        }
      }, 5000);
    }
    return () => clearInterval(pollTimer);
  }, [activeProblem, solved]);

  useEffect(() => {
    // We intentionally do not strictly lock navigation here as it can cause 
    // the webview process to crash if loadURL is called during will-navigate
    // LeetCode's SPA handles its own routing fine.
  }, [activeProblem]);

  const handleSolved = async () => {
    setSolved(true);
    const webview = webviewRef.current;
    if (webview && typeof webview.executeJavaScript === 'function') {
      try {
        const code = await webview.executeJavaScript(`
          (function() {
              // Strategy 1: Monaco editor global instance
              try {
                  if (window.monaco && window.monaco.editor) {
                      const models = window.monaco.editor.getModels();
                      if (models.length > 0) {
                          const val = models[0].getValue();
                          if (val && val.trim().length > 0) return val;
                      }
                  }
              } catch(e) {}

              // Strategy 2: Monaco editor from DOM
              try {
                  const editors = document.querySelectorAll('.monaco-editor');
                  for (const ed of editors) {
                      const model = ed._modelData && ed._modelData.model;
                      if (model) {
                          const val = model.getValue();
                          if (val && val.trim().length > 0) return val;
                      }
                  }
              } catch(e) {}

              // Strategy 3: CodeMirror 6 (CM6)
              try {
                  const cmEditors = document.querySelectorAll('.cm-editor');
                  for (const cm of cmEditors) {
                      const view = cm.cmView && cm.cmView.view;
                      if (view && view.state) {
                          const val = view.state.doc.toString();
                          if (val && val.trim().length > 0) return val;
                      }
                  }
              } catch(e) {}

              // Strategy 4: view-lines DOM scrape
              try {
                  const lines = document.querySelectorAll('.view-lines .view-line');
                  if (lines.length > 0) {
                      let c = Array.from(lines).map(line => line.textContent).join('\\n');
                      return c.replace(/\\u00a0/g, ' ');
                  }
              } catch(e) {}

              // Strategy 5: LeetCode code editor textarea
              try {
                  const ta = document.querySelector('[data-testid="code-editor"] textarea') ||
                             document.querySelector('.CodeMirror textarea') ||
                             document.querySelector('textarea[name="code"]');
                  if (ta && ta.value && ta.value.trim().length > 0) return ta.value;
              } catch(e) {}

              return "";
          })()
        `);
        setExtractedCode(code || "");
      } catch(e) {
        setExtractedCode("");
      }
    }
    setShowSaveModal(true);
  };

  const handleManualDone = () => {
    handleSolved();
  };

  const markStuck = async () => {
    const timeSpentMinutes = Math.ceil(elapsed / 60);
    await fetch('http://localhost:4000/api/competitive/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: activeProblem.slug, status: 'stuck', timeSpentMinutes })
    });
    setActiveProblem(null);
  };

  const saveSolution = async () => {
    const timeSpentMinutes = Math.ceil(elapsed / 60);
    await fetch('http://localhost:4000/api/competitive/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: activeProblem.slug, status: 'solved', timeSpentMinutes })
    });
    
    await fetch('http://localhost:4000/api/competitive/save-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: activeProblem.slug, code: extractedCode, language, problemRecord: activeProblem })
    });

    setShowSaveModal(false);
    setActiveProblem(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (activeProblem) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col animate-in fade-in duration-300 rounded-b-3xl overflow-hidden glass-panel bg-white/40 dark:bg-slate-950/40">
        <div className="h-16 border-b border-slate-200/50 dark:border-slate-800/50 glass-panel flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveProblem(null)} className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-slate-800 dark:text-white font-bold text-sm truncate max-w-xs">{activeProblem.title}</span>
              <div className="flex gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                <span className={activeProblem.difficulty === 'easy' ? 'text-emerald-500 dark:text-emerald-400' : activeProblem.difficulty === 'medium' ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400 uppercase'}>
                  {activeProblem.difficulty}
                </span>
                <span>•</span>
                <span className="uppercase">{language}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass border border-slate-200/50 dark:border-slate-700/50 font-mono text-sm shadow-inner">
              <Activity className="w-4 h-4 text-violet-500 dark:text-violet-400 animate-pulse" />
              <span className="text-violet-600 dark:text-violet-300 font-bold tracking-wider">{formatTime(elapsed)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={markStuck} className="px-5 py-2 rounded-2xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all">Mark Stuck</button>
              <button onClick={handleManualDone} className="px-5 py-2 rounded-2xl text-xs font-bold bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 backdrop-blur-md shadow-inner shadow-emerald-500/10 transition-all flex items-center gap-2"><Check className="w-4 h-4" /> Solved</button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative bg-white dark:bg-[#1a1a1a]">
          <webview 
            ref={webviewRef}
            src={activeProblem.url} 
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>

        <AnimatePresence>
        {showSaveModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="p-7 rounded-[24px] w-full max-w-xl flex flex-col gap-5 overflow-hidden bg-[#13111c]/80 backdrop-blur-2xl border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] relative"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
                backgroundSize: "16px 16px"
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Trophy className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight">Problem Solved!</h2>
                    <p className="text-[13px] text-muted-foreground mt-0.5">Save your solution to your local workspace.</p>
                  </div>
                </div>
                <button onClick={() => {
                  fetch('http://localhost:4000/api/competitive/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug: activeProblem.slug, status: 'solved', timeSpentMinutes: Math.ceil(elapsed/60) })
                  });
                  setShowSaveModal(false); 
                  setActiveProblem(null);
                }} className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4"/></button>
              </div>
              <div className="bg-black/20 rounded-2xl border border-white/5 shadow-inner relative z-10 overflow-hidden flex flex-col">
                {!extractedCode && (
                  <div className="px-4 py-3 bg-indigo-500/10 border-b border-indigo-500/10 text-indigo-300 text-[12px] font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    We couldn't auto-extract your code. Please paste it below.
                  </div>
                )}
                <div className="h-56 overflow-auto p-4 custom-scrollbar">
                  <textarea 
                    value={extractedCode} 
                    onChange={e => setExtractedCode(e.target.value)}
                    className="w-full h-full bg-transparent text-slate-300 font-mono text-[13px] leading-relaxed resize-none outline-none"
                    placeholder="// Paste your code here..."
                    spellCheck={false}
                    autoFocus={!extractedCode}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 relative z-10 mt-1">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    fetch('http://localhost:4000/api/competitive/status', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ slug: activeProblem.slug, status: 'solved', timeSpentMinutes: Math.ceil(elapsed/60) })
                    });
                    setShowSaveModal(false); 
                    setActiveProblem(null);
                  }} 
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Skip Saving
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveSolution} 
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4"/> Save Solution
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    );
  }
  return (
    <div className="h-full flex items-center justify-center p-12 relative overflow-hidden w-full">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[100px] will-change-transform transform-gpu"></div>
      </div>

      <div className="flex w-full max-w-7xl justify-center items-center gap-10 xl:gap-16 relative z-10 mt-4">
        
        {/* Left Stats Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden lg:flex flex-col gap-5 flex-1 max-w-[280px]"
        >
          <div className="glass-panel bg-white/5 dark:bg-white/[0.02] p-6 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.2)] border border-white/20 dark:border-white/5 flex flex-col gap-4">
             <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <Activity className="w-3.5 h-3.5" /> Performance
             </h3>
             <div className="flex items-end justify-between">
               <div className="flex flex-col gap-1">
                 <span className="text-4xl font-extrabold text-slate-800 dark:text-white leading-none">{stats.solved}</span>
                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Solved</span>
               </div>
               <div className="flex flex-col gap-1 items-end">
                 <span className="text-xl font-bold text-violet-600 dark:text-violet-400 leading-none">{Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m</span>
                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time in Arena</span>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5">
                <div className="flex flex-col items-center gap-1">
                   <span className="text-sm font-bold text-slate-300">{stats.winRate}%</span>
                   <span className="text-[9px] font-semibold text-slate-500 uppercase">Win Rate</span>
                </div>
                <div className="flex flex-col items-center gap-1 border-x border-white/5">
                   <span className="text-sm font-bold text-slate-300">{stats.avgTime}m</span>
                   <span className="text-[9px] font-semibold text-slate-500 uppercase">Avg Time</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <span className="text-sm font-bold text-slate-300">{stats.attempted}</span>
                   <span className="text-[9px] font-semibold text-slate-500 uppercase">Attempts</span>
                </div>
             </div>
             
             <div className="flex flex-col gap-2">
               <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Difficulty Split</span>
               <div className="flex h-2 w-full rounded-full overflow-hidden bg-white/5">
                 <div style={{width: `${(stats.easy / Math.max(1, stats.solved)) * 100}%`}} className="bg-emerald-500" />
                 <div style={{width: `${(stats.medium / Math.max(1, stats.solved)) * 100}%`}} className="bg-amber-500" />
                 <div style={{width: `${(stats.hard / Math.max(1, stats.solved)) * 100}%`}} className="bg-red-500" />
               </div>
               <div className="flex justify-between text-[10px] font-semibold">
                 <span className="text-emerald-500/80">{stats.easy} Easy</span>
                 <span className="text-amber-500/80">{stats.medium} Med</span>
                 <span className="text-red-500/80">{stats.hard} Hard</span>
               </div>
             </div>
          </div>
        </motion.div>

        {/* Center Main Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-lg w-full flex flex-col gap-8"
        >
          <div className="flex flex-col items-center text-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5, y: -2 }}
            className="p-3.5 rounded-3xl glass-panel border border-violet-500/20 mb-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_30px_rgba(139,92,246,0.15)] bg-white/5 dark:bg-white/[0.02]"
          >
            <Trophy className="w-10 h-10 text-violet-600 dark:text-violet-400" />
          </motion.div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">Competitive Arena</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium max-w-[380px] leading-relaxed mt-1">Select your parameters and step into the arena to solve random problems strictly focused on LeetCode.</p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowConfigModal(true)}
          className="mt-6 w-full py-4 rounded-2xl font-extrabold text-white bg-violet-600/40 dark:bg-violet-500/30 backdrop-blur-md transition-all flex items-center justify-center gap-2 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_0_50px_rgba(139,92,246,0.4)] relative overflow-hidden group border border-white/20 dark:border-white/10 hover:bg-violet-600/50 dark:hover:bg-violet-500/40"
        >
          {/* Glass shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-30 pointer-events-none" />
          <Play className="w-5 h-5 fill-current" />
          <span className="text-sm uppercase tracking-[0.15em] relative z-10">Ready Up Arena</span>
        </motion.button>
        </motion.div>


        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:flex flex-col gap-5 flex-1 max-w-[280px]"
        >
          <div className="glass-panel bg-white/5 dark:bg-white/[0.02] p-6 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.2)] border border-white/20 dark:border-white/5 flex flex-col gap-4">
             <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <Trophy className="w-3.5 h-3.5" /> Strengths
             </h3>
             <div className="flex flex-col gap-3 mt-1">
               {stats.topTopics.length > 0 ? stats.topTopics.map((topic, i) => (
                 <div key={topic[0]} className="flex flex-col gap-1.5">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="w-5 h-5 rounded flex items-center justify-center bg-white/5 text-[10px] font-bold text-slate-400">#{i+1}</span>
                       <span className="text-xs font-semibold text-slate-300 capitalize">{topic[0].replace('-', ' ')}</span>
                     </div>
                     <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">{topic[1]} Solved</span>
                   </div>
                   <div className="w-[calc(100%-1.75rem)] ml-7 bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full rounded-full opacity-80" style={{width: `${(Number(topic[1]) / Math.max(...stats.topTopics.map(t => Number(t[1])))) * 100}%`}}></div>
                   </div>
                 </div>
               )) : (
                 <span className="text-xs text-slate-500">Solve some problems to see your top topics!</span>
               )}
             </div>

             <div className="w-full h-[1px] bg-white/5 my-2"></div>

             <h3 className="text-[10px] font-extrabold text-emerald-500/80 uppercase tracking-widest flex items-center gap-2">
               <Activity className="w-3.5 h-3.5" /> Growth Areas
             </h3>
             <div className="flex flex-wrap gap-1.5 mt-1">
                {Array.from(recommended).map(t => (
                  <span key={t} className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg capitalize border border-emerald-500/20">{t.replace('-', ' ')}</span>
                ))}
             </div>

             <div className="w-full h-[1px] bg-white/5 my-2"></div>

             <h3 className="text-[10px] font-extrabold text-amber-500/80 uppercase tracking-widest flex items-center gap-2">
               <Trophy className="w-3.5 h-3.5" /> Recent Victories
             </h3>
             <div className="flex flex-col gap-3 mt-1">
                {stats.recentProblems.length > 0 ? stats.recentProblems.map(p => (
                  <div key={p.slug} className="flex items-center justify-between">
                     <div className="flex flex-col">
                       <span className="truncate max-w-[150px] text-xs font-semibold text-slate-300" title={p.title}>{p.title}</span>
                       <span className="text-[9px] text-slate-500 font-medium">{p.timeSpentMinutes}m spent</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-[9px] uppercase font-bold text-slate-500">{p.difficulty}</span>
                       <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-sm ${p.difficulty === 'easy' ? 'bg-emerald-500 shadow-emerald-500/50' : p.difficulty === 'medium' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
                     </div>
                  </div>
                )) : (
                  <span className="text-xs text-slate-500">No recent problems solved.</span>
                )}
             </div>
          </div>
        </motion.div>
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-6" 
            onClick={() => setShowConfigModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20, rotateX: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20, rotateX: -10 }} 
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={e => e.stopPropagation()} 
              className="max-w-lg w-full relative z-10 perspective-1000"
            >
              <div 
                className="p-7 rounded-[24px] flex flex-col gap-6 overflow-hidden bg-[#13111c]/80 backdrop-blur-2xl border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] relative"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
                  backgroundSize: "16px 16px"
                }}
              >
                <button onClick={() => setShowConfigModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col gap-1 mb-2">
                  <h2 className="text-xl font-extrabold text-white">Arena Configuration</h2>
                  <p className="text-xs text-slate-400">Tweak your match parameters.</p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <CustomSelect 
                    label="Difficulty" 
                    value={difficulty} 
                    onChange={setDifficulty} 
                    options={[
                      { value: "any", label: "Any Difficulty" },
                      { value: "easy", label: "Easy" },
                      { value: "medium", label: "Medium" },
                      { value: "hard", label: "Hard" }
                    ]} 
                  />
                  <CustomSelect 
                    label="Language" 
                    value={language} 
                    onChange={setLanguage} 
                    options={[
                      { value: "cpp", label: "C++" },
                      { value: "java", label: "Java" },
                      { value: "python", label: "Python" },
                      { value: "javascript", label: "JavaScript" },
                      { value: "c", label: "C" }
                    ]} 
                  />
                </div>
                
                <div className="flex flex-col gap-2.5">
                   <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
                     <span>Topics</span>
                     <span className="flex items-center gap-1 normal-case tracking-normal text-emerald-500/80"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Recommended</span>
                   </label>
                   <div className="relative">
                     <div className="flex overflow-x-auto gap-2 py-3 px-1 -mx-1 -mt-3 custom-scrollbar relative z-10 pr-8">
                       <motion.button 
                           initial={{ opacity: 0, scale: 0.8 }}
                           animate={{ opacity: 1, scale: 1 }}
                           whileHover={{ scale: 1.05, y: -2, rotateX: 10 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => {
                              if (selectedTopics.includes("random")) {
                                  setSelectedTopics(selectedTopics.filter(x => x !== "random"));
                              } else {
                                  setSelectedTopics([...selectedTopics, "random"]);
                              }
                           }}
                           className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.15)] ${selectedTopics.includes("random") ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30' : 'bg-amber-500/5 text-amber-600/70 dark:text-amber-400/70 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 dark:hover:text-amber-300'}`}
                         >
                           Surprise Me
                       </motion.button>
                     {[
                       { value: "array", label: "Array" },
                       { value: "binary-search", label: "Binary Search" },
                       { value: "two-pointers", label: "Two Pointers" },
                       { value: "sliding-window", label: "Sliding Window" },
                       { value: "dynamic-programming", label: "DP" },
                       { value: "graph", label: "Graph" },
                       { value: "tree", label: "Tree" },
                       { value: "stack", label: "Stack" },
                       { value: "queue", label: "Queue" },
                       { value: "backtracking", label: "Backtracking" },
                       { value: "greedy", label: "Greedy" },
                       { value: "math", label: "Math" },
                       { value: "bit-manipulation", label: "Bit Manipulation" },
                       { value: "linked-list", label: "Linked List" },
                       { value: "string", label: "String" },
                       { value: "hash-table", label: "Hash Table" }
                     ].map(t => ({...t, underused: recommended.has(t.value), count: counts[t.value] || 0}))
                     .sort((a,b) => {
                        // First sort by underused (true comes first)
                        if (a.underused && !b.underused) return -1;
                        if (!a.underused && b.underused) return 1;
                        // Then sort by frequency (lowest first)
                        return a.count - b.count;
                     }).map((t, idx) => (
                       <motion.button 
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: idx * 0.05 }}
                         whileHover={{ scale: 1.05, y: -2, rotateX: 10 }}
                         whileTap={{ scale: 0.95 }}
                         key={t.value} 
                         onClick={() => {
                            if (selectedTopics.includes(t.value)) {
                                setSelectedTopics(selectedTopics.filter(x => x !== t.value));
                            } else {
                                setSelectedTopics([...selectedTopics, t.value]);
                            }
                         }}
                         className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.15)] ${selectedTopics.includes(t.value) ? 'bg-violet-500/20 text-violet-600 dark:text-violet-300 border-violet-500/30' : 'bg-white/40 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-white/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-slate-300'}`}
                       >
                         {t.label}
                         {t.underused && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_3px_rgba(52,211,153,0.5)]" title="Recommended: Underused" />}
                       </motion.button>
                     ))}
                     </div>
                     
                     {/* Scroll Indicator */}
                     <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-[#1e1a2c] to-transparent pointer-events-none flex items-center justify-end z-20">
                        <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                          <ChevronRight className="w-4 h-4 text-slate-500/50" />
                        </motion.div>
                     </div>
                   </div>
                </div>

                <motion.button 
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startProblem}
                  disabled={loading}
                  className="mt-2 w-full py-3.5 rounded-2xl font-extrabold text-white bg-violet-600/40 dark:bg-violet-500/30 backdrop-blur-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_0_50px_rgba(139,92,246,0.4)] relative overflow-hidden group border border-white/20 dark:border-white/10 hover:bg-violet-600/50 dark:hover:bg-violet-500/40"
                >
                  {/* Glass shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-30 pointer-events-none" />
                  
                  {/* Shimmer effect */}
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 w-1/2"
                  />
                  
                  <AnimatePresence>
                    {isHovered && !loading && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, x: -60, y: '-50%', rotate: -60, scale: 0.2 }}
                          animate={{ opacity: 1, x: 0, y: '-50%', rotate: 15, scale: 1.3 }}
                          exit={{ opacity: 0, x: -60, y: '-50%', rotate: -60, scale: 0.2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="absolute left-7 top-1/2 pointer-events-none"
                        >
                          <Sword className="w-5 h-5 text-white fill-white/40 drop-shadow-lg" />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, x: 60, y: '-50%', rotate: 60, scale: 0.2 }}
                          animate={{ opacity: 1, x: 0, y: '-50%', rotate: -15, scale: 1.3 }}
                          exit={{ opacity: 0, x: 60, y: '-50%', rotate: 60, scale: 0.2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="absolute right-7 top-1/2 pointer-events-none"
                        >
                          <Sword className="w-5 h-5 text-white fill-white/40 -scale-x-100 drop-shadow-lg" />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                  
                  <motion.div 
                    animate={{ opacity: (isHovered || loading) ? 0 : 1, scale: (isHovered || loading) ? 0.5 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 flex items-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                  </motion.div>
                  
                  <span className="text-sm uppercase tracking-[0.15em] relative z-10">{loading ? 'Finding Problem...' : 'Ready Up Arena'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
