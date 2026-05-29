import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Trash2, Code, Clock, Zap } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

const mV: any = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } };

export default function DevFocusSessionsModal() {
  const { flowModalOpen, setFlowModalOpen, flow, deleteFlow } = useGlobalApp();

  return (
    <AnimatePresence>
        {flowModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-sm p-6" onClick={() => setFlowModalOpen(false)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit" onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Dev Focus Sessions</h2>
                  <p className="text-[10px] text-slate-400">{flow.length} recorded sessions</p>
                </div>
                <button onClick={() => setFlowModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="h-4 w-4 text-slate-500" /></button>
              </div>
              <div className="p-3 overflow-y-auto flex-1 space-y-2 bg-transparent">
                {flow.map((f: any, i: number) => ({ ...f, _originalIndex: i })).reverse().map((f: any) => (
                  <motion.div key={f._originalIndex} whileHover={{ x: 2 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl glass-panel shadow-sm hover:border-emerald-200 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0 text-emerald-600">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{new Date(f.timestamp || Date.now()).toLocaleString()}</p>
                        <div className="flex gap-2 mt-1 text-[10px] text-slate-500 flex-wrap">
                          {f.locDelta !== undefined && <span className="flex items-center gap-1"><Code className="h-3 w-3" /> {f.locDelta > 0 ? '+' : ''}{f.locDelta} LOC</span>}
                          {f.durationMinutes !== undefined && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {f.durationMinutes}m</span>}
                          {f.flowScore !== undefined && <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-violet-500" /> {f.flowScore} Flow</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { if(confirm('Delete this focus session?')) { deleteFlow(f._originalIndex); } }} className="self-end sm:self-center p-1.5 hover:bg-rose-50 rounded-lg transition-colors group">
                      <Trash2 className="h-3.5 w-3.5 text-slate-300 group-hover:text-rose-500" />
                    </button>
                  </motion.div>
                ))}
                {flow.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No focus sessions found.</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
