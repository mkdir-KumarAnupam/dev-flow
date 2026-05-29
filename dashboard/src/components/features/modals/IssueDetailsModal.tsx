import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, User } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

export default function IssueDetailsModal() {
  const { selectedIssue, setSelectedIssue } = useGlobalApp();

  return (
    <AnimatePresence>
        {selectedIssue && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedIssue(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl overflow-hidden max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-white/10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded border border-slate-300/50 dark:border-slate-700/50 shadow-inner">{selectedIssue.identifier}</span>
                  <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />
                  <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: selectedIssue.project?.color || '#94a3b8' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedIssue.project?.color || '#94a3b8' }} /> {selectedIssue.project?.name || 'No Project'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.open(selectedIssue.url, '_blank')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-indigo-500" title="Open in Linear"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>
                  <button onClick={() => setSelectedIssue(null)} className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white/40 dark:bg-slate-900/40">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">{selectedIssue.title}</h1>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">State</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm" style={{ color: selectedIssue.state?.color }}>
                      <span className="w-2 h-2 rounded-full shadow-inner" style={{ backgroundColor: selectedIssue.state?.color }} /> {selectedIssue.state?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Assignee</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300">
                      <User className="w-3 h-3 text-slate-400" /> {selectedIssue.assignee || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Labels</span>
                    <div className="flex gap-1.5">
                      {selectedIssue.labels?.map((l: string) => (
                         <span key={l} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30 shadow-sm"><Tag className="w-3 h-3" /> {l}</span>
                      ))}
                      {(!selectedIssue.labels || selectedIssue.labels.length === 0) && <span className="text-xs text-slate-400 italic">None</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Priority</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.22-1.82A2 2 0 0 0 8.53 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg> {selectedIssue.priorityLabel || 'None'}
                    </span>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Description</h3>
                  {selectedIssue.description ? (
                    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedIssue.description}</div>
                  ) : (
                    <p className="text-slate-400 italic text-sm">No description provided.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
