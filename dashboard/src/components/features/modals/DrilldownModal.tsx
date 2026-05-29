import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, FolderGit2 } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

export default function DrilldownModal() {
  const { drilldown, setDrilldown, flow } = useGlobalApp();

  return (
    <AnimatePresence>
        {drilldown && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrilldown(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border bg-transparent dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                    {drilldown.type === 'date' ? <Activity className="h-5 w-5" /> : <FolderGit2 className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Activity Timeline</h2>
                    <p className="text-[10px] text-slate-500">{drilldown.type === 'date' ? `For ${drilldown.value}` : `For project: ${drilldown.value}`}</p>
                  </div>
                </div>
                <button onClick={() => setDrilldown(null)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"><X className="h-4 w-4" /></button>
              </div>
              <div className="overflow-y-auto p-4 custom-scrollbar glass-panel flex-1 space-y-4">
                {(() => {
                  const filtered = flow.filter((f: any) => {
                    if (!f.timestamp) return false;
                    if (drilldown.type === 'date') return new Date(f.timestamp).toISOString().slice(0, 10) === drilldown.value;
                    if (drilldown.type === 'project') {
                      let proj = f.projectContext;
                      if (proj && ['src', 'public', 'components', 'lib', 'app', 'bin', 'tests', 'daemon', 'file:src'].includes(proj.toLowerCase())) proj = 'dev-cli';
                      return proj === drilldown.value;
                    }
                    return false;
                  });
                  if (filtered.length === 0) return <p className="text-xs text-slate-400 text-center py-6">No detailed activity found for this selection.</p>;

                  return filtered.map((f: any, idx: number) => (
                    <div key={idx} className=" rounded-lg p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/20">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="text-[11px] font-bold text-muted-foreground">{new Date(f.timestamp).toLocaleTimeString()}</span>
                        <div className="flex gap-2 text-[10px] text-slate-500">
                          {f.durationMinutes !== undefined && <span>{f.durationMinutes}m duration</span>}
                          {f.flowScore !== undefined && <span className="text-violet-500 font-semibold">{f.flowScore} Flow</span>}
                        </div>
                      </div>
                      <div className="space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                        {f.timeline && f.timeline.length > 0 ? f.timeline.map((t: any, tIdx: number) => (
                          <div key={tIdx} className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${t.category === 'coding' ? 'bg-violet-500' : t.category === 'distraction' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{Math.round((t.durationSecs || 0)/60)}m</span>
                              <span className="text-[11px] font-medium text-foreground">{t.category}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 ml-3.5 truncate max-w-full" title={t.title}>{t.title} <span className="opacity-50">({t.process})</span></p>
                          </div>
                        )) : <p className="text-[10px] text-slate-400">No fine-grained timeline data</p>}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
