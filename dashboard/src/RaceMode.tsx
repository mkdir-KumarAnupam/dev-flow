import { useState, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, Code2, AlertTriangle, Sword, Trophy, History, Clock, Target, CheckCircle2, XCircle, Search, Ghost, ChevronDown, ChevronUp, Flag, PartyPopper } from 'lucide-react';

loader.config({ monaco });
//this is some text
//this is another text
//more text
//hello text
//textttt
//tessee
const TARGET_MULTIPLIER_CAP = 2.0;

export default function RaceMode() {
  const [practiceList, setPracticeList] = useState<any[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [sortOption, setSortOption] = useState<'Recent' | 'Rusty' | 'Fastest' | 'Slowest'>('Recent');

  const [problem, setProblem] = useState<any>(null);
  const [language, setLanguage] = useState<'javascript' | 'cpp' | 'java'>('javascript');
  const [codeSnippets, setCodeSnippets] = useState<any[]>([]);
  const [code, setCode] = useState('');

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [raceStatus, setRaceStatus] = useState<'idle' | 'running' | 'won'>('idle');
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [targetSecs, setTargetSecs] = useState(600);
  const [editorTheme, setEditorTheme] = useState('glassThemeDark');
  const [expandedPane, setExpandedPane] = useState<'none' | 'problem' | 'testcases'>('none');

  useEffect(() => {
    setEditorTheme(document.documentElement.classList.contains('dark') ? 'glassThemeDark' : 'glassThemeLight');
    const observer = new MutationObserver(() => {
      setEditorTheme(document.documentElement.classList.contains('dark') ? 'glassThemeDark' : 'glassThemeLight');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleEditorWillMount = (m: any) => {
    m.editor.defineTheme('glassThemeDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000',
        'editor.lineHighlightBackground': '#ffffff10',
      }
    });
    m.editor.defineTheme('glassThemeLight', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000',
        'editor.lineHighlightBackground': '#00000010',
      }
    });
  };

  useEffect(() => {
    fetchPractice();
  }, []);

  const fetchPractice = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/practice');
      if (res.ok) {
        let data = await res.json();
        // Only Leetcode problems, ensure unique slugs
        data = data.filter((p: any) => p.platform === 'leetcode');
        const unique = [];
        const seen = new Set();
        for (const p of data) {
          if (!seen.has(p.slug)) { seen.add(p.slug); unique.push(p); }
        }
        setPracticeList(unique);
      }
    } catch (e) {
      setError("Could not load practice history.");
    }
    setLoading(false);
  };

  useEffect(() => {
    let interval: any;
    if (raceStatus === 'running') {
      interval = setInterval(() => {
        setElapsedSecs(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [raceStatus]);

  const selectProblem = async (prac: any) => {
    setSelectedPractice(prac);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:4000/api/leetcode/${prac.slug}`);
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      const p = json.data.question;
      const meta = JSON.parse(p.metaData);

      const snippets = p.codeSnippets || [];
      setCodeSnippets(snippets);

      const jsSnippet = snippets.find((s:any) => s.langSlug === 'javascript')?.code || '';
      setCode(jsSnippet);
      setLanguage('javascript');

      setProblem({ ...p, meta });
      setResults(null);

      // Calculate Ghost Target
      const baseMinutes = prac.timeSpentMinutes || 10;
      let bufferMultiplier = 1.0;
      if (prac.endedAt) {
        const days = (Date.now() - new Date(prac.endedAt).getTime()) / (1000 * 60 * 60 * 24);
        bufferMultiplier += Math.floor(days / 30) * 0.1;
      }
      bufferMultiplier = Math.min(bufferMultiplier, TARGET_MULTIPLIER_CAP);

      setTargetSecs(Math.floor(baseMinutes * 60 * bufferMultiplier));
      setElapsedSecs(0);
      setRaceStatus('idle');
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setSelectedPractice(null);
    }
    setLoading(false);
  };

  const changeLanguage = (lang: 'javascript' | 'cpp' | 'java') => {
    setLanguage(lang);
    const slugMap = { 'javascript': 'javascript', 'cpp': 'cpp', 'java': 'java' };
    const snippet = codeSnippets.find((s:any) => s.langSlug === slugMap[lang])?.code || '';
    setCode(snippet);
  };

  const handleRun = async () => {
    if (!problem) return;
    setRunning(true);
    setResults(null);

    try {
      const res = await fetch('http://localhost:4000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testcases: problem.exampleTestcaseList,
          functionName: problem.meta.name,
          metaData: problem.meta
        })
      });
      const data = await res.json();
      setResults(data);

      if (data.results && Array.isArray(data.results)) {
        let allPassed = true;
        for (let i = 0; i < data.results.length; i++) {
          const outputStr = JSON.stringify(data.results[i]);
          const match = problem.content.match(new RegExp('<strong>Output:</strong>\\s*([^<\\n]+)', 'g'));
          const expectedRaw = match && match[i] ? match[i].replace(new RegExp('<strong>Output:</strong>\\s*'), '').trim() : '';
          const passed = outputStr.replace(/\s/g, '') === expectedRaw.replace(/\s/g, '');
          if (!passed) allPassed = false;
        }
        if (allPassed && data.results.length === problem.exampleTestcaseList.length) {
          setRaceStatus('won');
          if (elapsedSecs <= targetSecs && selectedPractice) {
            const timeSpentMinutes = Math.max(1, Math.round(elapsedSecs / 60));
            fetch('http://localhost:4000/api/practice/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug: selectedPractice.slug, timeSpentMinutes })
            }).catch(e => console.error('Failed to update practice time', e));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setRunning(false);
  };

  if (loading && !problem) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-xs font-bold tracking-widest uppercase">Loading Arena...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 glass-panel rounded-xl border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p className="text-sm max-w-md text-center">{error}</p>
        <button onClick={() => { setError(null); fetchPractice(); }} className="mt-6 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg ">Retry</button>
      </div>
    );
  }

  if (!selectedPractice) {
    const filteredList = practiceList.filter(prac => {
      const matchesSearch = prac.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'All' || prac.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
      return matchesSearch && matchesDifficulty;
    }).sort((a, b) => {
      const aTime = new Date(a.endedAt || a.startedAt || 0).getTime();
      const bTime = new Date(b.endedAt || b.startedAt || 0).getTime();
      if (sortOption === 'Recent') return bTime - aTime;
      if (sortOption === 'Rusty') return aTime - bTime;
      if (sortOption === 'Fastest') return (a.timeSpentMinutes || 0) - (b.timeSpentMinutes || 0);
      if (sortOption === 'Slowest') return (b.timeSpentMinutes || 0) - (a.timeSpentMinutes || 0);
      return 0;
    });

    const getGhostPace = (prac: any) => {
      const baseMinutes = prac.timeSpentMinutes || 10;
      let bufferMultiplier = 1.0;
      if (prac.endedAt) {
        const days = (Date.now() - new Date(prac.endedAt).getTime()) / (1000 * 60 * 60 * 24);
        bufferMultiplier += Math.floor(days / 30) * 0.1;
      }
      bufferMultiplier = Math.min(bufferMultiplier, TARGET_MULTIPLIER_CAP);
      return Math.floor(baseMinutes * bufferMultiplier);
    };

    return (
      <div className="h-full overflow-y-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} className="flex items-center justify-between mb-5 rounded-3xl  glass-panel backdrop-blur-md  p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-2xl flex items-center justify-center shadow-inner">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Historical Race Mode</h1>
                <p className="text-sm text-slate-500">Select a previously solved problem to race against your Ghost.</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 24 }} className="flex flex-col md:flex-row gap-4 mb-7 glass-panel backdrop-blur-md p-3 rounded-2xl  ">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search past problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-panel border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 transition-all"
              />
            </div>

            <div className="flex gap-1 glass-panel p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff as any)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${difficultyFilter === diff ? 'bg-white dark:bg-slate-700 text-violet-600 ' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <div className="relative group">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="appearance-none glass-panel border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all cursor-pointer"
              >
                <option value="Recent">Most Recent</option>
                <option value="Rusty">Most Rusty</option>
                <option value="Fastest">Fastest Target</option>
                <option value="Slowest">Slowest Target</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-violet-500 transition-colors" />
            </div>
          </motion.div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredList.map((prac, i) => {
                const ghostPace = getGhostPace(prac);
                const daysAgo = prac.endedAt ? Math.floor((Date.now() - new Date(prac.endedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                return (
                  <motion.div
                    layout
                    key={prac.slug}
                    initial={{ opacity: 0, scale: 0.96, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ type: "spring", stiffness: 280, damping: 24, delay: i * 0.03 }}
                    whileHover={{ scale: 1.025, y: -5 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => selectProblem(prac)}
                    className="relative bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl cursor-pointer  hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-600 transition-all group overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.12] pointer-events-none text-slate-900 dark:text-slate-100" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-violet-600 transition-colors line-clamp-2">{prac.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ml-2 flex-shrink-0 ${prac.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : prac.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                          {prac.difficulty}
                        </span>
                      </div>

                      <div className="mt-auto pt-4 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
                        <div className="flex items-center gap-1.5 glass-panel px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                          <Ghost className="w-3 h-3 text-violet-500" />
                          <span className="text-violet-600 dark:text-violet-400 font-bold">{ghostPace}m Target</span>
                        </div>
                        <div className="flex items-center gap-1.5 glass-panel px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {prac.timeSpentMinutes}m base
                        </div>
                        {daysAgo > 0 && (
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${daysAgo > 30 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'glass-panel text-slate-500 border-slate-100 dark:border-slate-800'}`}>
                            <History className="w-3 h-3" />
                            {daysAgo}d ago
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
          {filteredList.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm font-medium">
              No previous problems match your filters.
            </div>
          )}
        </div>
      </div>
    );
  }

  const ghostRatio = Math.min(1, elapsedSecs / targetSecs);
  const userRatio = Math.min(1, elapsedSecs / targetSecs); // Since user doesn't have a specific final time until won
  const minutes = Math.floor(elapsedSecs / 60);
  const seconds = elapsedSecs % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const targetMins = Math.floor(targetSecs / 60);
  const targetString = `${targetMins.toString().padStart(2, "0")}:${(targetSecs % 60).toString().padStart(2, "0")}`;

  let paceString = "";
  if (elapsedSecs <= targetSecs) {
    const diff = targetSecs - elapsedSecs;
    paceString = `-${Math.floor(diff/60)}m ${diff%60}s`;
  } else {
    const diff = elapsedSecs - targetSecs;
    paceString = `+${Math.floor(diff/60)}m ${diff%60}s`;
  }

  return (
    <div className="flex h-full gap-4 relative">
      <AnimatePresence>
        {raceStatus === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 backdrop-blur-md bg-white/40 dark:bg-slate-950/40 flex items-center justify-center rounded-2xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRaceStatus('running')}
              className="flex items-center gap-3 bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl shadow-lg font-bold text-lg"
            >
              <Sword className="w-6 h-6" /> Start Race against Ghost ({targetString})
            </motion.button>
          </motion.div>
        )}

        {raceStatus === 'won' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 backdrop-blur-md bg-white/40 dark:bg-slate-950/40 flex items-center justify-center rounded-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 glass-panel border border-emerald-200 dark:border-emerald-900/50 p-8 rounded-3xl shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner relative">
                {elapsedSecs <= targetSecs && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }} className="absolute -top-4 -right-4 bg-fuchsia-100 text-fuchsia-600 p-2 rounded-full">
                    <PartyPopper className="w-6 h-6" />
                  </motion.div>
                )}
                <Trophy className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Race Finished!</h2>
                <p className="text-slate-500 mt-1">Time: <span className="font-mono text-emerald-600 font-bold">{timeString}</span></p>
                {elapsedSecs <= targetSecs ? (
                  <div className="mt-3 bg-fuchsia-50 dark:bg-fuchsia-900/30 border border-fuchsia-100 dark:border-fuchsia-800/50 p-3 rounded-xl">
                    <p className="text-sm text-fuchsia-700 dark:text-fuchsia-400 font-extrabold flex items-center justify-center gap-2">
                      <PartyPopper className="w-4 h-4" /> New Record Established!
                    </p>
                    <p className="text-xs text-fuchsia-600/80 dark:text-fuchsia-400/80 font-bold mt-1">Beat Ghost by {paceString.replace('-', '')}</p>
                  </div>
                ) : (
                  <p className="text-xs text-rose-500 font-bold mt-2">Ghost won by {paceString.replace('+', '')}</p>
                )}
              </div>
              <button onClick={() => { setRaceStatus('idle'); setSelectedPractice(null); }} className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">Select Another Problem</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT: Problem & Race UI */}
      <div className="w-[450px] flex flex-col gap-4">
        {/* HUD */}
        <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04, type: "spring", stiffness: 260, damping: 24 }} className="glass-panel backdrop-blur-md p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-500" />
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Race HUD</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-xs font-bold px-2 py-1 rounded-md bg-background border border-border ${elapsedSecs <= targetSecs ? 'text-emerald-600' : 'text-rose-600'}`}>
                {paceString}
              </div>
              {raceStatus === 'running' && (
                <button onClick={() => { setRaceStatus('idle'); setSelectedPractice(null); }} className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors" title="Give Up">
                  <Flag className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                <span>Ghost</span>
                <span>{targetString}</span>
              </div>
              <div className="h-2 glass-panel rounded-full overflow-hidden border border-border/50">
                <motion.div
                  className="h-full bg-slate-400 dark:bg-slate-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${ghostRatio * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                <span>You</span>
                <span>{timeString}</span>
              </div>
              <div className="h-2 glass-panel rounded-full overflow-hidden border border-border/50">
                <motion.div
                  className={`h-full ${elapsedSecs > targetSecs ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${userRatio * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Problem Description */}
        <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 24 }} className={`glass-panel backdrop-blur-md rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${expandedPane === 'problem' ? 'flex-[3]' : expandedPane === 'testcases' ? 'h-14 flex-none' : 'flex-1'}`}>
          <div className="flex items-center justify-between p-3 border-b border-border/50 bg-background/30 cursor-pointer hover:bg-background/50 transition-colors" onClick={() => setExpandedPane(p => p === 'problem' ? 'none' : 'problem')}>
            <h3 className="font-bold text-sm text-foreground line-clamp-1">{problem.title}</h3>
            <div className="flex items-center gap-3 pl-4">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ml-2 flex-shrink-0 ${problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                {problem.difficulty}
              </span>
              {expandedPane === 'problem' ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
          {expandedPane !== 'testcases' && (
            <div
              className="p-5 overflow-y-auto custom-scrollbar text-sm text-muted-foreground prose prose-sm max-w-none prose-pre:bg-muted/50 prose-pre:text-foreground flex-1"
              dangerouslySetInnerHTML={{ __html: problem.content }}
            />
          )}
        </motion.div>

        {/* Test Cases Output */}
        <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 24 }} className={`glass-panel backdrop-blur-md rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${expandedPane === 'testcases' ? 'flex-[3]' : expandedPane === 'problem' ? 'h-14 flex-none' : 'h-64'}`}>
          <div className="flex items-center justify-between p-3 border-b border-border/50 bg-background/30 cursor-pointer hover:bg-background/50 transition-colors" onClick={() => setExpandedPane(p => p === 'testcases' ? 'none' : 'testcases')}>
            <h2 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-rose-500" /> Test Cases
            </h2>
            <div className="flex items-center gap-3">
              {results && <span className="text-[10px] font-medium text-muted-foreground">{results.duration}ms execution</span>}
              {expandedPane === 'testcases' ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>

          {expandedPane !== 'problem' && (
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
              {results ? (
                results.error ? (
                  <div className="text-xs text-rose-600 font-mono bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    {results.error}
                    {results.stderr && <pre className="mt-2 whitespace-pre-wrap">{results.stderr}</pre>}
                  </div>
                ) : (
                  problem.exampleTestcaseList.map((tc: string, i: number) => {
                    const output = results.results[i];
                    const outputStr = JSON.stringify(output);

                    const cleanText = problem.content.replace(/<[^>]*>/g, '');
                    const outputMatches = cleanText.match(/Output:\s*(.*?)(?=\n*Explanation:|\n*Example \d+:|\n*Constraints:|$)/gs);
                    let expectedRaw = outputMatches && outputMatches[i] ? outputMatches[i].replace(/Output:\s*/, '').trim() : '';
                    
                    const txt = document.createElement('textarea');
                    txt.innerHTML = expectedRaw;
                    expectedRaw = txt.value;

                    const passed = outputStr?.replace(/\s/g, '') === expectedRaw?.replace(/\s/g, '');

                    return (
                      <div key={i} className={`p-3 rounded-xl border ${passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                        <div className="flex justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>Case {i + 1}</span>
                          {passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                        </div>
                        <div className="grid grid-cols-[50px_1fr] gap-2 text-[11px] font-mono">
                          <span className="text-muted-foreground">Input</span>
                          <span className="text-foreground/90">{tc.replace(/\n/g, ', ')}</span>

                          <span className="text-muted-foreground">Output</span>
                          <span className={passed ? 'text-emerald-500' : 'text-rose-500'}>{outputStr}</span>

                          {!passed && (
                            <>
                              <span className="text-muted-foreground">Expected</span>
                              <span className="text-emerald-500">{expectedRaw}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                  <Target className="w-6 h-6 opacity-20" />
                  <span className="text-xs">Run code to see results</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* RIGHT: Editor */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} className="flex-1 flex flex-col glass-panel backdrop-blur-md rounded-2xl overflow-hidden relative isolate">
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.08] pointer-events-none text-slate-900 dark:text-slate-100 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
        <div className="flex items-center justify-between p-3 border-b border-border/50 bg-background/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedPractice(null)} className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
              &larr; Back
            </button>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-violet-500" />
              <h2 className="text-xs font-bold text-foreground">Editor</h2>
              <div className="flex glass-panel rounded-lg p-0.5 ml-2">
                {(['javascript', 'cpp', 'java'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => changeLanguage(l)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${language === l ? 'bg-background shadow-sm text-violet-500' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleRun} disabled={running || raceStatus === 'idle'}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold transition-colors shadow-lg border border-violet-500/50 disabled:opacity-50"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {running ? 'Running...' : 'Run Code'}
          </motion.button>
        </div>

        <div className="flex-1 relative z-10 bg-transparent py-4">
          <Editor
            beforeMount={handleEditorWillMount}
            height="100%"
            language={language}
            value={code}
            onChange={(v) => setCode(v || '')}
            theme={editorTheme}
            options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, smoothScrolling: true }}
          />
        </div>
      </motion.div>
    </div>
  );
}
