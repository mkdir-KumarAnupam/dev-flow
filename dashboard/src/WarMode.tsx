import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sword, Check, Lock, ShieldAlert, Flag, Loader2, Target, CheckCircle2, XCircle, Trash2, Search, Crosshair, ChevronLeft, ArrowRight, Database, Link2, Network, BrainCircuit, Binary } from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

loader.config({ monaco });

// --- HEX MATH & ADJACENCY ---
const getNeighbors = (col: number, row: number) => {
  if (row % 2 === 0) {
    return [
      [col + 1, row], [col, row - 1], [col - 1, row - 1],
      [col - 1, row], [col - 1, row + 1], [col, row + 1]
    ];
  } else {
    return [
      [col + 1, row], [col + 1, row - 1], [col, row - 1],
      [col - 1, row], [col, row + 1], [col + 1, row + 1]
    ];
  }
};

type NodeOwner = 'player' | 'enemy' | 'unclaimed';
type NodeDifficulty = 'easy' | 'medium' | 'hard' | 'boss';

interface HexNode {
  id: string;
  col: number;
  row: number;
  owner: NodeOwner;
  difficulty: NodeDifficulty;
  isBase?: boolean;
}

interface WarState {
  topic: string;
  focusArea: string;
  nodes: HexNode[];
  seenUrls: string[];
}

const TOPICS = [
  { name: 'Arrays & Strings', icon: <Database className="w-6 h-6 text-blue-500 drop-shadow-sm" />, areas: ['Two Pointers', 'Sliding Window', 'Prefix Sum', 'Hash Maps', 'String Manipulation', 'Matrix Traversal'] },
  { name: 'Linked Lists', icon: <Link2 className="w-6 h-6 text-emerald-500 drop-shadow-sm" />, areas: ['Fast & Slow Pointers', 'Reversal', 'Merge & Sort', 'Cycle Detection', 'Doubly Linked Lists'] },
  { name: 'Trees & Graphs', icon: <Network className="w-6 h-6 text-amber-500 drop-shadow-sm" />, areas: ['DFS', 'BFS', 'Shortest Path', 'Topological Sort', 'Trie', 'Union Find'] },
  { name: 'Dynamic Programming', icon: <BrainCircuit className="w-6 h-6 text-violet-500 drop-shadow-sm" />, areas: ['1D DP', '2D DP', 'Knapsack', 'State Machines', 'Memoization', 'LCS & LIS'] },
  { name: 'Sorting & Searching', icon: <Binary className="w-6 h-6 text-rose-500 drop-shadow-sm" />, areas: ['Binary Search', 'Merge Sort', 'Quick Select', 'Intervals', 'Heap & Priority Queue'] }
];

const generateMap = (): HexNode[] => {
  const nodes: HexNode[] = [];
  const rows = 5;
  const cols = 7;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === 0 && (c === 0 || c === cols - 1)) || (r === rows - 1 && (c === 0 || c === cols - 1))) {
        continue;
      }

      let owner: NodeOwner = 'unclaimed';
      let difficulty: NodeDifficulty = 'medium';
      let isBase = false;

      if (r === 2 && c === 1) { owner = 'player'; isBase = true; }
      else if (r === 2 && c === 5) { owner = 'enemy'; difficulty = 'boss'; isBase = true; }
      else if (c <= 2) difficulty = 'easy';
      else if (c >= 4) difficulty = 'hard';

      nodes.push({ id: `hex-${c}-${r}`, col: c, row: r, owner, difficulty, isBase });
    }
  }
  return nodes;
};

export default function WarMode() {
  const [warState, setWarState] = useState<WarState | null>(null);
  const [activeBattleNode, setActiveBattleNode] = useState<HexNode | null>(null);
  
  // Battle / Problem State
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('warState');
    if (saved) {
      try { setWarState(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (warState) {
      localStorage.setItem('warState', JSON.stringify(warState));
    } else {
      localStorage.removeItem('warState');
    }
  }, [warState]);

  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  const startWar = (topic: string, focusArea: string) => {
    setWarState({ topic, focusArea, nodes: generateMap(), seenUrls: [] });
  };

  const forfeitWar = () => {
    if (confirm("Are you sure you want to forfeit this campaign? All tactical progress will be lost.")) {
      setWarState(null);
      setSelectedTopic(null);
      setActiveBattleNode(null);
    }
  };

  const playerOwnedIds = useMemo(() => new Set(warState?.nodes.filter(n => n.owner === 'player').map(n => n.id) || []), [warState]);

  const getAttackableIds = useMemo(() => {
    const attackable = new Set<string>();
    if (!warState) return attackable;
    warState.nodes.forEach(node => {
      if (node.owner === 'player') {
        const neighbors = getNeighbors(node.col, node.row);
        neighbors.forEach(([nc, nr]) => {
          const neighborId = `hex-${nc}-${nr}`;
          if (!playerOwnedIds.has(neighborId)) {
            attackable.add(neighborId);
          }
        });
      }
    });
    return attackable;
  }, [warState, playerOwnedIds]);

  const [showModal, setShowModal] = useState(false);

  const handleHexClick = async (node: HexNode) => {
    if (node.owner === 'player') return;
    if (!getAttackableIds.has(node.id)) return;
    
    setActiveBattleNode(node);
    setLoadingQuestion(true);
    setProblem(null);
    setResults(null);
    setBattleResult(null);

    try {
      const res = await fetch('http://localhost:4000/api/generate-problem-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: warState?.topic,
          focusArea: warState?.focusArea,
          difficulty: node.difficulty,
          seenUrls: warState?.seenUrls || []
        })
      });

      if (!res.ok) {
        let errMsg = "API returned " + res.status;
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch(e) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setProblem(data);
      setCode('');
      window.open(data.url, '_blank');
    } catch (e: any) {
      console.error(e);
      alert("Error: Failed to generate question.\n\nDetails: " + e.message);
      setActiveBattleNode(null);
    }
    setLoadingQuestion(false);
  };

  const handleValidateCode = async () => {
    if (!problem || !activeBattleNode || !warState) return;
    setRunning(true);
    setBattleResult(null);
    setResults(null);

    try {
      const res = await fetch('http://localhost:4000/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          topic: `${warState.topic} - ${warState.focusArea}`,
          url: problem.url
        })
      });
      const data = await res.json();
      setResults(data);

      if (data.passed) {
        setBattleResult('win');
        setTimeout(() => {
          setWarState({
            ...warState,
            seenUrls: [...(warState.seenUrls || []), problem.url],
            nodes: warState.nodes.map(n => n.id === activeBattleNode.id ? { ...n, owner: 'player' } : n)
          });
          setActiveBattleNode(null);
          setShowModal(false);
        }, 3000);
      } else {
        setBattleResult('lose');
      }
    } catch (e: any) {
      console.error(e);
      setResults({ error: e.message });
    }
    setRunning(false);
  };

  const hexWidth = 90;
  const hexHeight = 104;
  const rowOffset = hexHeight * 0.75;
  const mapWidth = 7 * hexWidth + hexWidth * 0.5;
  const mapHeight = 5 * rowOffset + hexHeight * 0.25;

  if (!warState) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 glass-panel rounded-2xl  overflow-hidden relative">
        {!selectedTopic && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-12 relative z-10">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-2">Select Campaign</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Choose a Data Structures & Algorithms topic to conquer.</p>
          </motion.div>
        )}

        {!selectedTopic ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl w-full relative z-10">
            {TOPICS.map((topic, i) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedTopic(topic)}
                className="group relative glass-panel rounded-2xl p-5 cursor-pointer transition-all shadow-sm hover:shadow-md hover:border-violet-500/30 flex flex-col justify-start overflow-hidden"
              >
                <div className={`absolute ${['top-[-40px] left-[-40px]', 'top-[-40px] right-[-40px]', 'bottom-[-40px] left-[-40px]', 'bottom-[-40px] right-[-40px]'][i % 4]} w-32 h-32 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full glass-panel text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 shadow-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="opacity-90 group-hover:scale-110 transition-transform origin-left">{topic.icon}</div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1 relative z-10">{topic.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed relative z-10">{topic.areas.join(' • ')}</p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="w-full max-w-2xl glass-panel rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative z-10 flex flex-col max-h-[calc(100vh-200px)] min-h-0">
            <button onClick={() => setSelectedTopic(null)} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 mb-8 flex items-center gap-1.5 transition-colors shrink-0">
              <ChevronLeft className="w-4 h-4" /> Back to Topics
            </button>
            <div className="flex items-center gap-5 mb-8 shrink-0">
              <div className="p-4 glass-panel rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/50">{selectedTopic.icon}</div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{selectedTopic.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-sm">Select a specific focus area to train your logic.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-2 min-h-0 flex-1">
              {selectedTopic.areas.map((area: string, i: number) => (
                <motion.button
                  key={area}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => startWar(selectedTopic.name, area)}
                  className="relative overflow-hidden glass-panel border border-slate-200/60 dark:border-slate-700/50 hover:border-violet-300 dark:hover:border-violet-500/40 p-6 rounded-2xl text-left transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-md min-h-[180px]"
                >
                  <div className={`absolute ${['top-[-40px] left-[-40px]', 'top-[-40px] right-[-40px]', 'bottom-[-40px] left-[-40px]', 'bottom-[-40px] right-[-40px]'][i % 4]} w-32 h-32 bg-violet-500/20 dark:bg-violet-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
                  
                  <div className="relative z-10">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors mb-2">{area}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Master the patterns and tactics of {area.toLowerCase()}.</p>
                  </div>

                  <div className="relative z-10 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-6 font-bold flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-4">
                    <span>Deploy Forces</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-all transform -translate-x-2 group-hover:translate-x-0">
                      <span>Engage</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden glass-panel rounded-2xl ">
      
      {/* Header Info */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2 glass-panel  py-2 px-4 rounded-xl shadow-sm">
          <Target className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h2 className="text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-300">
            {warState.topic} <span className="text-slate-300 dark:text-slate-600 font-normal mx-1">/</span> <span className="text-slate-900 dark:text-slate-100">{warState.focusArea}</span>
          </h2>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <button onClick={forfeitWar} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg font-medium text-sm transition-colors">
          <Trash2 className="w-4 h-4" /> Forfeit War
        </button>
      </div>

      {/* Hex Map */}
      <div className="relative z-0" style={{ width: mapWidth, height: mapHeight }}>
        
        {/* SVG Connecting Lines - Removed overflow-visible to prevent infinite bounds issue and removed scaling */}
        <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: mapWidth, height: mapHeight }}>
           {warState.nodes.map(node => {
              const x1 = node.col * hexWidth + (node.row % 2 === 1 ? hexWidth / 2 : 0) + hexWidth / 2;
              const y1 = node.row * rowOffset + hexHeight / 2;
              const neighbors = getNeighbors(node.col, node.row);
              return neighbors.map(([nc, nr]) => {
                const n2 = warState.nodes.find(n => n.col === nc && n.row === nr);
                if (!n2) return null;
                const x2 = n2.col * hexWidth + (n2.row % 2 === 1 ? hexWidth / 2 : 0) + hexWidth / 2;
                const y2 = n2.row * rowOffset + hexHeight / 2;
                
                if (node.id > n2.id) return null;

                const isConnectedToPlayer = node.owner === 'player' || n2.owner === 'player';
                const strokeColor = isConnectedToPlayer ? 'rgba(139, 92, 246, 0.5)' : 'rgba(148, 163, 184, 0.25)'; 
                const strokeWidth = isConnectedToPlayer ? '2' : '1.5';

                return <line key={`${node.id}-${n2.id}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={isConnectedToPlayer ? "none" : "4 4"} />
              })
           })}
        </svg>

        <AnimatePresence>
          {warState.nodes.map(node => {
            const isAttackable = getAttackableIds.has(node.id);
            const isPlayer = node.owner === 'player';
            const isEnemy = node.owner === 'enemy';
            
            const x = node.col * hexWidth + (node.row % 2 === 1 ? hexWidth / 2 : 0);
            const y = node.row * rowOffset;

            let bgColor = 'glass-panel';
            let strokeColor = 'border-slate-200 dark:border-slate-800';
            let shadow = 'shadow-sm';
            let icon = null;

            if (isPlayer) {
              bgColor = 'bg-violet-600 dark:bg-violet-600';
              strokeColor = 'border-violet-500 dark:border-violet-500';
              shadow = 'shadow-md shadow-violet-500/20';
              icon = <Shield className="h-6 w-6 text-white" />;
              if (node.isBase) icon = <Flag className="h-8 w-8 text-white" />;
            } else if (isEnemy) {
              bgColor = 'bg-rose-500 dark:bg-rose-600';
              strokeColor = 'border-rose-400 dark:border-rose-500';
              shadow = 'shadow-md shadow-rose-500/20';
              icon = <ShieldAlert className="h-6 w-6 text-white" />;
              if (node.isBase) icon = <Flag className="h-8 w-8 text-white" />;
            } else if (isAttackable) {
              bgColor = 'bg-amber-50 dark:bg-amber-900/20';
              strokeColor = 'border-amber-200 dark:border-amber-700/50';
              shadow = 'shadow-sm hover:shadow-md hover:shadow-amber-500/10';
              icon = <Crosshair className="h-5 w-5 text-amber-500 opacity-80" />;
            }

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={isAttackable ? { scale: 1.05, zIndex: 10 } : {}}
                className={`absolute flex items-center justify-center cursor-${isAttackable ? 'pointer' : 'default'} transition-all duration-200 z-10 ${shadow}`}
                style={{
                  width: hexWidth - 4,
                  height: hexHeight - 4,
                  left: x,
                  top: y,
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
                onClick={() => handleHexClick(node)}
              >
                <div className={`w-full h-full flex flex-col items-center justify-center ${bgColor} border-[3px] ${strokeColor} relative`}>
                  <div className="relative z-10 flex flex-col items-center">
                    {icon}
                    {!isPlayer && !isEnemy && !isAttackable && <Lock className="h-4 w-4 text-slate-300 dark:text-slate-700" />}
                    
                    {(!isPlayer && !node.isBase) && (
                      <div className="flex gap-1 mt-2">
                        {Array.from({ length: node.difficulty === 'easy' ? 1 : node.difficulty === 'medium' ? 2 : 3 }).map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${node.difficulty === 'hard' ? 'bg-rose-500' : node.difficulty === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Loading & Action Modals - Removed backdrop-blur to fix Chromium tile memory limit warning */}
      <AnimatePresence>
        {activeBattleNode && !showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="absolute inset-0 z-40 bg-slate-900/40 dark:bg-black/60 p-4 flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="glass-panel p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 dark:border-slate-700/50 flex flex-col items-center max-w-sm w-full text-center"
            >
               <div className="flex flex-col items-center w-full">
                 {loadingQuestion ? (
                   <>
                     <div className="mb-6 flex items-center justify-center w-16 h-16 glass-panel rounded-2xl border border-slate-100 dark:border-slate-800">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-500" />
                     </div>
                     <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-2">Deploying Forces</h2>
                     <p className="text-sm text-slate-500 font-medium">Scouting enemy territory...</p>
                   </>
                 ) : problem ? (
                   <>
                     <div className="mb-6">
                       <div className="w-16 h-16 glass-panel rounded-2xl flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                         <Sword className="w-7 h-7 text-rose-500 transform -rotate-45" />
                       </div>
                     </div>
                     <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-6">War Declared</h2>
                     
                     <div className="glass-panel border border-slate-200/60 dark:border-slate-700/50 px-5 py-4 rounded-2xl w-full mb-8 text-left shadow-inner">
                       <p className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Active Objective</p>
                       <a href={problem.url} target="_blank" rel="noreferrer" className="text-base font-semibold text-slate-800 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors line-clamp-2">
                         {problem.title}
                       </a>
                     </div>
                     
                     <div className="flex gap-3 w-full">
                       <button onClick={() => setActiveBattleNode(null)} className="flex-1 h-11 glass-panel border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-medium text-sm transition-colors rounded-xl">Retreat</button>
                       <button onClick={() => setShowModal(true)} className="flex-1 h-11 bg-slate-900 dark:bg-violet-600 hover:bg-slate-800 dark:hover:bg-violet-700 text-white font-medium text-sm transition-all rounded-xl shadow-md">Engage Target</button>
                     </div>
                   </>
                 ) : null}
               </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Fullscreen Code Modal */}
        {showModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-50 glass-panel p-4 md:p-8 flex flex-col"
          >
             <div className="flex-1 flex flex-col glass-panel  rounded-[2rem] overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)]">
               
               {/* Header */}
               <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800/60 glass-panel">
                 <div className="flex items-center flex-1">
                   <button onClick={() => setShowModal(false)} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 py-1">
                     <ChevronLeft className="w-4 h-4" /> Tactical Map
                   </button>
                 </div>
                 <div className="flex items-center justify-center flex-[2]">
                   <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate max-w-md">
                     {problem?.title}
                   </h3>
                 </div>
                 <div className="flex items-center justify-end flex-1">
                   <button
                     onClick={handleValidateCode} disabled={running || battleResult === 'win'}
                     className={`flex items-center justify-center gap-2 h-9 px-5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 text-white shadow-sm ${battleResult === 'win' ? 'bg-emerald-500' : battleResult === 'lose' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-900 dark:bg-violet-600 hover:bg-slate-800 dark:hover:bg-violet-700'}`}
                   >
                     {running ? <Loader2 className="w-4 h-4 animate-spin" /> : battleResult === 'win' ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                     {running ? 'Validating...' : battleResult === 'win' ? 'Secured' : 'Run Validation'}
                   </button>
                 </div>
               </div>
               
               <div className="flex flex-1 overflow-hidden">
                 {/* Editor */}
                 <div className="flex-1 relative border-r border-slate-100 dark:border-slate-800/60 bg-[#1e1e1e]">
                   <Editor
                     height="100%" language="javascript" value={code} onChange={(v) => setCode(v || '')} theme="vs-dark"
                     options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 32 }, fontFamily: 'monospace', scrollBeyondLastLine: false }}
                   />
                   {!code && (
                     <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-500 font-mono text-sm opacity-60">
                       // Enter your elegant solution here...
                     </div>
                   )}
                 </div>
                 
                 {/* Feedback Panel */}
                 <div className="w-80 md:w-96 glass-panel flex flex-col p-8 relative overflow-hidden">
                   
                   <h4 className="text-xs font-semibold text-slate-500 mb-6 flex items-center gap-2">
                     <Target className="w-4 h-4 text-slate-400" /> AI Diagnostics
                   </h4>
                   
                   <div className="flex-1 overflow-y-auto pr-2">
                     {results ? (
                       results.error ? (
                         <div className="text-sm text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-5 rounded-2xl border border-rose-200/60 dark:border-rose-500/20 leading-relaxed font-medium">
                           {results.error}
                         </div>
                       ) : (
                         <div className={`p-6 rounded-2xl border ${results.passed ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20 text-rose-900 dark:text-rose-300'}`}>
                           <div className="flex items-center gap-3 mb-3">
                             {results.passed ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-500" />}
                             <h5 className="font-semibold text-base">{results.passed ? 'Algorithm Approved' : 'Algorithm Rejected'}</h5>
                           </div>
                           <p className="text-sm leading-relaxed opacity-90">{results.feedback}</p>
                         </div>
                       )
                     ) : (
                       <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-4 pb-10 opacity-80">
                         <div className="w-16 h-16 rounded-2xl glass-panel border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center">
                           <Search className="w-6 h-6 text-slate-300 dark:text-slate-500" />
                         </div>
                         <p className="text-sm text-center font-medium leading-relaxed max-w-[200px]">Submit your solution to receive AI-driven validation.</p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
