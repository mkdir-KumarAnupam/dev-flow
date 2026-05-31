
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Calendar, FolderGit2 } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

const overlayV: any = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } };
const modalV: any = { 
  hidden: { opacity: 0, scale: 0.95, y: 10 }, 
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, 
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } 
};

export default function NoteReaderModal() {
  const { noteReaderModalOpen, setNoteReaderModalOpen, selectedNote } = useGlobalApp();
  
  if (!selectedNote) return null;

  // Format content to highlight tags and projects
  const renderContent = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(#\w+|@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return <span key={i} className="text-emerald-500 font-medium bg-emerald-500/10 px-1 py-0.5 rounded mx-0.5">{part}</span>;
      }
      if (part.startsWith('@')) {
        return <span key={i} className="text-violet-500 font-medium bg-violet-500/10 px-1 py-0.5 rounded mx-0.5">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <AnimatePresence>
      {noteReaderModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-auto p-4">
          <motion.div variants={overlayV} initial="hidden" animate="show" exit="exit" onClick={() => setNoteReaderModalOpen(false)} className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" />
          
          <motion.div variants={modalV} initial="hidden" animate="show" exit="exit" className="relative w-full max-w-2xl glass-panel border border-slate-200/60 dark:border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-transparent">
              <div className="flex flex-col gap-1.5 min-w-0 pr-4">
                <h3 className="text-lg font-bold text-foreground leading-tight truncate flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-lg shrink-0">
                    <Tag className="w-4 h-4" />
                  </span>
                  {selectedNote.name || "Untitled Note"}
                </h3>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                  {selectedNote.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selectedNote.createdAt).toLocaleString()}
                    </span>
                  )}
                  {selectedNote.project && (
                    <span className="flex items-center gap-1.5 text-violet-500">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      {selectedNote.project}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setNoteReaderModalOpen(false)} className="p-2 shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white/50 dark:bg-slate-950/50">
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                <div className="whitespace-pre-wrap text-sm text-foreground/90 font-medium leading-relaxed">
                  {renderContent(selectedNote.content)}
                </div>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
