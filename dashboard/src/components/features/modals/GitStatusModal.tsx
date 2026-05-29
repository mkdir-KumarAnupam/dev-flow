import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderGit2, Box } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGlobalApp } from '@/context/GlobalAppContext';

export default function GitStatusModal() {
  const { gitModalOpen, setGitModalOpen, gitStatus } = useGlobalApp();

  return (
    <AnimatePresence>
        {gitModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setGitModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-modal rounded-xl overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col border border-border">
              <div className="flex items-center justify-between p-4 border-b border-border bg-transparent">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${gitStatus.globalUncommittedChanges > 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                    {gitStatus.globalUncommittedChanges > 0 ? <FolderGit2 className="h-5 w-5" /> : <Box className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Uncommitted Changes</h2>
                    <p className="text-[10px] text-muted-foreground">{gitStatus.globalUncommittedChanges} total changes across {gitStatus.details?.length || 0} projects</p>
                  </div>
                </div>
                <button onClick={() => setGitModalOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="overflow-y-auto p-4 custom-scrollbar flex-1">
                {gitStatus.details && gitStatus.details.length > 0 ? (
                  <div className="space-y-4">
                    {gitStatus.details.map((proj: any, idx: number) => (
                      <div key={idx} className="glass-panel overflow-hidden">
                        <div className="px-3 py-2 border-b border-border/50 flex justify-between items-center">
                          <h3 className="text-xs font-bold text-foreground">{proj.project}</h3>
                          <Badge variant="outline" className="text-[9px] bg-background/50 backdrop-blur-sm shadow-sm border-border text-foreground">{proj.count} files</Badge>
                        </div>
                        <div className="p-2">
                          <ul className="space-y-1">
                            {proj.files.map((file: string, fIdx: number) => {
                              const isDeleted = file.trim().startsWith('D');
                              const isNew = file.trim().startsWith('?');
                              return (
                                <li key={fIdx} className="flex items-center gap-2 text-[10px] font-mono p-1 rounded hover:bg-muted/50 transition-colors">
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${isDeleted ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : isNew ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                    {isDeleted ? '-' : isNew ? '+' : 'M'}
                                  </span>
                                  <span className={`truncate ${isDeleted ? 'line-through text-muted-foreground' : 'text-foreground/80'}`}>{file.substring(2).trim()}</span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Box className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">Your workspace is perfectly clean.</p>
                    <p className="text-[10px]">No uncommitted changes detected in any active projects.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
