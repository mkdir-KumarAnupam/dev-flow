import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Save, RefreshCw } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

const overlayV: any = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } };
const modalV: any = { 
  hidden: { opacity: 0, scale: 0.95, y: 10 }, 
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, 
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } 
};

export default function FocusedNoteModal() {
  const { focusedNoteModalOpen, setFocusedNoteModalOpen, activeTab, projects, fetchAll } = useGlobalApp();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (focusedNoteModalOpen) {
      setTitle('');
      setContent('');
    }
  }, [focusedNoteModalOpen]);

  const handleSave = async () => {
    if (!content.trim() && !title.trim()) {
      setFocusedNoteModalOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const tagRegex = /#(\w+)/g;
      const projectRegex = /@(\w+)/;
      
      const detectedTags: string[] = ['focused']; // Automatically add focused tag
      let tMatch;
      let tempContent = content + " " + title;
      while ((tMatch = tagRegex.exec(tempContent)) !== null) {
        if (!detectedTags.includes(tMatch[1])) detectedTags.push(tMatch[1]);
      }

      const pMatch = tempContent.match(projectRegex);
      let detectedProject = pMatch ? pMatch[1] : "";

      if (!detectedProject && activeTab !== 'Overview' && projects) {
        const found = projects.find((p: any) => p.name === activeTab);
        if (found) {
          detectedProject = found.name;
        }
      }

      const notePayload = {
        name: title.trim() || "Untitled Focused Note",
        content: content,
        tags: detectedTags,
        project: detectedProject,
        createdAt: new Date().toISOString()
      };

      const apiUrl = (path: string) => typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin + (path.startsWith('/') ? path : '/' + path) : 'http://localhost:4000' + (path.startsWith('/') ? path : '/' + path);
      
      const res = await fetch(apiUrl('/api/obsidian/note'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notePayload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save note");
      }

      setFocusedNoteModalOpen(false);
      setTitle('');
      setContent('');
      fetchAll();
    } catch (error: any) {
      console.error("Failed to save focused note:", error);
      alert(`Failed to save note: ${error.message}`);
    }
    setIsSaving(false);
  };

  return (
    <AnimatePresence>
      {focusedNoteModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center pointer-events-auto p-4 md:p-6">
          <motion.div variants={overlayV} initial="hidden" animate="show" exit="exit" onClick={() => setFocusedNoteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md" />
          
          <motion.div variants={modalV} initial="hidden" animate="show" exit="exit" className="relative w-full max-w-4xl glass-panel border border-slate-200/60 dark:border-slate-700/50 shadow-2xl rounded-2xl flex flex-col h-[85vh] md:h-[80vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-xl">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground leading-none">Focused Note</h3>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Deep Dive Workspace</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setFocusedNoteModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="flex-1 flex flex-col min-h-0 bg-white/50 dark:bg-slate-950/50">
              <div className="px-6 pt-6 pb-2 shrink-0">
                <input 
                  type="text"
                  placeholder="Note Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-foreground placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>
              <div className="flex-1 px-6 pb-6 min-h-0">
                <textarea 
                  placeholder="Start writing... Use @project and #tags"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-sm leading-relaxed text-foreground placeholder:text-slate-400 custom-scrollbar"
                />
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
              <div className="text-[10px] text-slate-500 font-medium">
                Supports markdown, @project matching, and #tags
              </div>
              <button 
                onClick={handleSave} 
                disabled={isSaving || (!content.trim() && !title.trim())} 
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {isSaving ? 'Saving...' : 'Save to Vault'}
              </button>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
