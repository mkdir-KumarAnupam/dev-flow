import { useState, useEffect, Component } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import "@excalidraw/excalidraw/index.css";
import { Excalidraw } from '@excalidraw/excalidraw';

class ErrorBoundary extends Component<{children: any}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 text-red-500 font-mono text-sm whitespace-pre-wrap flex-1 bg-black overflow-auto">
        Error loading Excalidraw:<br/><br/>
        {this.state.error?.toString()}<br/><br/>
        {this.state.error?.stack}
      </div>;
    }
    return this.props.children;
  }
}

export default function Whiteboard({ 
  sketch, 
  sketchIndex, 
  projects = [],
  onClose, 
  onSave 
}: { 
  sketch: any; 
  sketchIndex: number; 
  projects?: any[];
  onClose: () => void; 
  onSave: () => void;
}) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(sketch?.title || "New Sketch");
  const [project, setProject] = useState(sketch?.project || "");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const safeAppState = sketch?.appState ? { ...sketch.appState } : {};
  if (safeAppState) {
    delete safeAppState.collaborators;
  }
  safeAppState.viewBackgroundColor = "transparent";

  useEffect(() => {
    if (excalidrawAPI && sketch?.elements) {
      excalidrawAPI.updateScene({
        elements: sketch.elements,
        appState: safeAppState,
      });
    }
  }, [excalidrawAPI, sketch]);

  const confirmSave = async () => {
    if (!excalidrawAPI) return;
    setIsSaving(true);
    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      await fetch(`http://localhost:4000/api/sketches/${sketchIndex}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements, appState, files, title, project })
      });
      onSave(); // Trigger data refresh in App.tsx
      setShowSaveModal(false);
    } catch (e) {
      console.error("Failed to save sketch", e);
    }
    setIsSaving(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 glass-panel flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
          </div>
          <span className="text-slate-200 font-semibold text-sm">
            {title} {project ? <span className="text-xs text-slate-500 font-normal ml-2 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{project}</span> : null}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSaveModal(true)} 
            disabled={isSaving}
            title="Save Sketch"
            className="p-1.5 glass-panel hover:bg-white/10 text-violet-500 dark:text-violet-400 rounded-md transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </button>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSaveModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-modal shadow-2xl rounded-xl p-6 w-full max-w-sm flex flex-col space-y-4">
            <h2 className="text-lg font-semibold text-white">Save Sketch</h2>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-400 font-medium">Sketch Name</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="glass-panel border border-white/10 text-slate-200 text-sm rounded-md px-3 py-2 outline-none focus:border-violet-500/50"
                placeholder="Sketch Title..."
                autoFocus
              />
            </div>
            <div className="flex flex-col space-y-1 relative">
              <label className="text-xs text-slate-400 font-medium">Assign to Project</label>
              <button
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className="glass-panel text-left border border-white/10 text-slate-300 text-sm rounded-md px-3 py-2 outline-none focus:border-violet-500/50 flex items-center justify-between transition-all"
              >
                {project || "Workspace (No Project)"}
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              
              {projectDropdownOpen && (
                <div className="absolute top-full mt-1 left-0 w-full glass-modal border border-white/10 rounded-md shadow-xl overflow-hidden z-50 flex flex-col py-1">
                  <button 
                    onClick={() => { setProject(""); setProjectDropdownOpen(false); }}
                    className={`text-left px-3 py-2 text-sm transition-colors hover:bg-white/10 ${!project ? 'text-violet-400' : 'text-slate-300'}`}
                  >
                    Workspace (No Project)
                  </button>
                  {projects?.map((p: any) => (
                    <button 
                      key={p.name}
                      onClick={() => { setProject(p.name); setProjectDropdownOpen(false); }}
                      className={`text-left px-3 py-2 text-sm transition-colors hover:bg-white/10 ${project === p.name ? 'text-violet-400' : 'text-slate-300'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors">Cancel</button>
              <button onClick={confirmSave} className="px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-md transition-colors flex items-center gap-2">
                {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excalidraw Canvas */}
      <div className="flex-1 relative">
        <ErrorBoundary>
          <Excalidraw 
            excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
            theme="dark"
            UIOptions={{
              canvasActions: {
                changeViewBackgroundColor: false,
              }
            }}
            initialData={{
              elements: sketch?.elements?.length ? sketch.elements : undefined,
              appState: safeAppState,
            }}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
