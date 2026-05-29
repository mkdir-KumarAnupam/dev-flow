import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderGit2, FolderOpen, Layers, Play, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGlobalApp } from '@/context/GlobalAppContext';

const mV: any = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } };

export default function AllWorkspacesModal() {
  const { modalOpen, setModalOpen, search, setSearch, projects, sandboxes, resumeWork, openSandbox } = useGlobalApp();

  return (
    <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-sm p-6" onClick={() => setModalOpen(false)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit" onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between"><div><h2 className="text-sm font-bold text-foreground">All Workspaces</h2><p className="text-[10px] text-slate-400">{projects.length} projects · {sandboxes.length} sandboxes</p></div><button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="h-4 w-4 text-slate-500" /></button></div>
              <div className="px-4 py-2 border-b border-slate-100 bg-transparent"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" /><input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all" /></div></div>
              <div className="p-3 overflow-y-auto flex-1 space-y-1">
                {projects.filter((p: any) => (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.path || '').toLowerCase().includes(search.toLowerCase())).map((p: any, i: number) => (
                  <motion.div key={`p-${i}`} whileHover={{ x: 3 }} className="flex items-center gap-3 p-2.5 rounded-xl glass-panel hover:border-violet-200 hover:shadow-sm transition-all cursor-default">
                    <FolderGit2 className="h-4 w-4 text-violet-500 flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground">{p.name}</p><p className="text-[10px] text-slate-400 font-mono truncate">{p.path}</p></div>
                    {p.type && <Badge variant="outline" className="text-[8px]">{p.type}</Badge>}
                    <button onClick={() => resumeWork(p)} className="p-1 hover:bg-violet-50 rounded"><Play className="h-3 w-3 text-violet-500" /></button>
                  </motion.div>
                ))}
                {sandboxes.filter((s: any) => (s.name || '').toLowerCase().includes(search.toLowerCase())).map((s: any, i: number) => (
                  <motion.div key={`s-${i}`} whileHover={{ x: 3 }} className="flex items-center gap-3 p-2.5 rounded-xl glass-panel hover:border-amber-200 hover:shadow-sm transition-all cursor-default">
                    <Layers className="h-4 w-4 text-amber-500 flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground">{s.name}</p><p className="text-[10px] text-slate-400 font-mono truncate">{s.path}</p></div>
                    <Badge variant="outline" className="text-[8px]">{s.language}</Badge>
                    <button onClick={() => openSandbox(s)} className="p-1 hover:bg-amber-50 rounded"><FolderOpen className="h-3 w-3 text-amber-600" /></button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
