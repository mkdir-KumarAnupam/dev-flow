import { motion, AnimatePresence } from 'framer-motion';
import { X, FileCode } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

const mV: any = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } };

export default function CodeSearchModal() {
  const { codeModal, setCodeModal } = useGlobalApp();

  return (
    <AnimatePresence>
        {codeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-6" onClick={() => setCodeModal(null)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit" onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div><h2 className="text-sm font-bold text-foreground">{codeModal.title}</h2><p className="text-[10px] text-slate-400">{codeModal.files.length} file(s) found</p></div>
                <button onClick={() => setCodeModal(null)} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="h-4 w-4 text-slate-500" /></button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {codeModal.files.map((f: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <FileCode className="h-3 w-3 text-violet-500" />
                      <p className="text-[10px] font-mono font-medium text-slate-600">{f.name}</p>
                    </div>
                    <pre className="bg-slate-900 text-slate-100 text-[10px] p-3 rounded-lg overflow-x-auto font-mono leading-relaxed max-h-[250px] overflow-y-auto scrollbar-thin">{f.content}</pre>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
