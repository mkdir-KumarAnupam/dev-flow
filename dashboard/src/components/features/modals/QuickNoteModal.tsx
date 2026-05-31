import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalApp } from '../../../context/GlobalAppContext';

export default function QuickNoteModal() {
  const { quickNoteModalOpen, setQuickNoteModalOpen, setObsidianNotes, activeTab } = useGlobalApp();
  const [noteContent, setNoteContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (quickNoteModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [quickNoteModalOpen]);

  const handleSave = async () => {
    if (!noteContent.trim()) {
      setQuickNoteModalOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      let content = noteContent;
      
      const tagRegex = /#(\w+)/g;
      const projectRegex = /@(\w+)/;

      const detectedTags: string[] = [];
      let tMatch;
      let tempContent = noteContent;
      while ((tMatch = tagRegex.exec(tempContent)) !== null) {
        if (!detectedTags.includes(tMatch[1])) detectedTags.push(tMatch[1]);
      }

      let project = "";
      const projMatch = projectRegex.exec(content);
      if (projMatch) {
        project = projMatch[1];
        content = content.replace(projMatch[0], "").trim();
      }

      const apiUrl = (path: string) => typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin + (path.startsWith('/') ? path : '/' + path) : 'http://localhost:4000' + (path.startsWith('/') ? path : '/' + path);
      
      const response = await fetch(apiUrl('/api/obsidian/note'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          project: project,
          tags: detectedTags,
          activeScreen: activeTab
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(`Failed to save note: ${errData.error || response.statusText}`);
        return;
      }

      setNoteContent("");
      setQuickNoteModalOpen(false); // close instantly
      
      // Fetch only the notes to avoid lagging the UI, keeping it snappy
      try {
        const res = await fetch(apiUrl('/api/obsidian/notes'));
        const notes = await res.json();
        if (setObsidianNotes) {
           setObsidianNotes(Array.isArray(notes) ? notes : []);
        }
      } catch (err) {
        console.error("Failed to fetch obsidian notes:", err);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setQuickNoteModalOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {quickNoteModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setQuickNoteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-slate-900/90 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden glass-panel flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-slate-700/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200">Quick Note</h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                      Use <span className="text-violet-400 font-mono">@project</span> and <span className="text-emerald-400 font-mono">#tag</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 relative">
                <div className="absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap break-words text-sm font-mono leading-relaxed text-slate-200 z-0 overflow-hidden" aria-hidden="true">
                  {noteContent.split(/(@\w+|#\w+)/g).map((part, i) => {
                    if (part.startsWith('@')) return <span key={i} className="text-violet-400 font-bold">{part}</span>;
                    if (part.startsWith('#')) return <span key={i} className="text-emerald-400 font-bold">{part}</span>;
                    return <span key={i}>{part}</span>;
                  })}
                  {!noteContent && <span className="text-slate-600">Jot something down...</span>}
                </div>
                <textarea
                  ref={inputRef}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-40 bg-transparent text-transparent caret-slate-200 resize-none outline-none text-sm font-mono leading-relaxed relative z-10"
                />
              </div>

              <div className="px-5 py-3 bg-slate-900/50 border-t border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] text-slate-500">Cmd/Ctrl + Enter to save</span>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !noteContent.trim()}
                  className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : "Save to Obsidian"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
