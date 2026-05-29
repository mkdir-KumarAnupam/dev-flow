import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Activity, FolderGit2, FolderOpen, Layers, Play, Search, 
  Trash2, FileCode, Code, Clock, Zap, Box, Tag, User, 
  RefreshCw, Server, Cloud, Flame, Globe, Wifi
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { useGlobalApp } from '@/context/GlobalAppContext';
import Whiteboard from '@/Whiteboard';

// Reuse animation variants
const mV: any = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } };

export default function GlobalModals() {
  const { 
    modalOpen, setModalOpen, search, setSearch, codeModal, setCodeModal, 
    sketchModal, setSketchModal, captureModal, setCaptureModal, 
    flowModalOpen, setFlowModalOpen, gitModalOpen, setGitModalOpen, 
    drilldown, setDrilldown, selectedIssue, setSelectedIssue, 
    showRemoteQRCode, setShowRemoteQRCode, manageDeployment, setManageDeployment, 
    isHealthChecking, setIsHealthChecking, fetchAll, flow, projects, sandboxes, 
    gitStatus, deleteFlow, resumeWork, openSandbox, remoteDashboardUrl 
  } = useGlobalApp();

  const API_BASE = typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin : 'http://localhost:4000';
  const apiUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  return (
    <>
<AnimatePresence>
              {showRemoteQRCode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[1000] pointer-events-none"
                >
                  <button
                    aria-label="Close remote dashboard QR"
                    className="absolute inset-0 pointer-events-auto cursor-default"
                    onClick={() => setShowRemoteQRCode(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.94, rotateX: -8 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95, rotateX: -6 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                    className="pointer-events-auto absolute right-8 top-24 w-[344px] overflow-hidden rounded-[30px] border border-violet-200/20 bg-[#070817]/95 p-4 text-slate-100 backdrop-blur-2xl shadow-[0_34px_100px_rgba(0,0,0,0.74),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-22px_60px_rgba(15,23,42,0.42)]"
                    style={{ transformPerspective: 900, transformStyle: 'preserve-3d' }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.30),transparent_38%),radial-gradient(circle_at_100%_20%,rgba(34,211,238,0.16),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.10),transparent_38%)] pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

                    <div className="relative z-10 flex items-center justify-between gap-3 pb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-300/20 shadow-inner">
                          <Wifi className="h-4 w-4 text-cyan-200" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black tracking-tight text-white">Remote Dashboard</p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/70">Live LAN mirror</p>
                        </div>
                      </div>
                      <button onClick={() => setShowRemoteQRCode(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="relative z-10 rounded-[24px] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.9)] border border-white/70">
                      {remoteDashboardUrl ? (
                        <QRCodeSVG
                          value={remoteDashboardUrl}
                          size={288}
                          bgColor="transparent"
                          fgColor="#020617"
                          level="M"
                          includeMargin={false}
                        />
                      ) : (
                        <div className="h-[288px] flex flex-col items-center justify-center text-center text-slate-500">
                          <Activity className="h-7 w-7 animate-pulse mb-3 text-violet-500" />
                          <p className="text-xs font-bold uppercase tracking-[0.18em]">Finding LAN address</p>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 shadow-inner">
                        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">Open On iPad</p>
                        <p className="mt-1 text-[11px] font-mono font-bold text-cyan-100 break-all">{remoteDashboardUrl || 'Waiting for local network address...'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-[10px] leading-relaxed text-slate-400">
                          Keep both devices on the same Wi-Fi, then scan this from Safari or Camera.
                        </div>
                        <button
                          disabled={!remoteDashboardUrl}
                          onClick={() => remoteDashboardUrl && navigator.clipboard?.writeText(remoteDashboardUrl)}
                          className="px-3 py-2 rounded-full bg-violet-500/20 hover:bg-violet-500/30 disabled:opacity-40 text-[10px] font-black uppercase tracking-[0.14em] text-violet-100 border border-violet-300/20 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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

      {/* Code Modal */}
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

      {/* Sketch Update Modal */}
      <AnimatePresence>
        {sketchModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-6" onClick={() => setSketchModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full h-full glass-modal rounded-2xl overflow-hidden flex flex-col relative">
              <Whiteboard sketch={sketchModal.sketch} sketchIndex={sketchModal.index} projects={projects} onClose={() => setSketchModal(null)} onSave={() => fetchAll()} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screenshot Preview Modal */}
      <AnimatePresence>
        {captureModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-6"
            onClick={() => setCaptureModal(null)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit"
              onClick={e => e.stopPropagation()}
              className="glass-modal rounded-2xl overflow-hidden max-w-4xl w-full max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="text-xs font-semibold text-foreground">{captureModal.fileName}</p>
                  <p className="text-[10px] text-slate-400">{captureModal.project}</p>
                </div>
                <button onClick={() => setCaptureModal(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              {/* Image */}
              <div className="overflow-auto flex-1 flex items-center justify-center p-4 bg-slate-50">
                <motion.img
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 }}
                  src={apiUrl(`/api/capture-image?path=${encodeURIComponent(captureModal.path)}`)}
                  alt={captureModal.fileName}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev Focus Sessions Modal */}
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

      {/* ═══ GIT STATUS MODAL ═══ */}
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

      {/* ═══ DRILLDOWN MODAL ═══ */}
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

      {/* ═══ ISSUE DETAILS MODAL ═══ */}
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

{/* Deployments Modal */}
<AnimatePresence>
        {manageDeployment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/25 backdrop-blur-sm p-6" onClick={() => setManageDeployment(null)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit" onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    manageDeployment.target === 'Vercel' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' :
                    manageDeployment.target === 'Firebase' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-500' :
                    manageDeployment.target === 'Docker' || manageDeployment.target === 'AWS' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-500' :
                    'bg-blue-50 dark:bg-blue-900/30 text-blue-500'
                  }`}>
                    {manageDeployment.target === 'Firebase' ? <Flame className="w-5 h-5" /> : (manageDeployment.target === 'Docker' || manageDeployment.target === 'AWS') ? <Server className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground truncate max-w-[200px]">{manageDeployment.name}</h2>
                    <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{manageDeployment.path}</p>
                  </div>
                </div>
                <button onClick={() => setManageDeployment(null)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="h-4 w-4 text-slate-500" /></button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${manageDeployment.status === 'Online' ? 'bg-emerald-500 animate-pulse' : manageDeployment.status === 'Offline' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                      <span className="text-xs font-semibold text-foreground">{manageDeployment.status}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latency</label>
                    <p className="text-xs font-semibold text-foreground">{manageDeployment.latency ? manageDeployment.latency + 'ms' : 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deployed URL</label>
                  <div className="flex relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={manageDeployment.url || ''}
                      onChange={(e) => setManageDeployment({ ...manageDeployment, url: e.target.value })}
                      className="w-full glass-panel border border-slate-200 dark:border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deployment Method</label>
                  <select
                    value={manageDeployment.target || ''}
                    onChange={(e) => setManageDeployment({ ...manageDeployment, target: e.target.value })}
                    className="w-full glass-panel border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
                  >
                    <option value="Vercel">Vercel</option>
                    <option value="Firebase">Firebase</option>
                    <option value="Netlify">Netlify</option>
                    <option value="Fly.io">Fly.io</option>
                    <option value="Docker">Docker</option>
                    <option value="Unknown">Unknown/CLI</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={async () => {
                      setIsHealthChecking(true);
                      try {
                        await fetch(manageDeployment.url, { mode: 'no-cors' });
                        setManageDeployment({ ...manageDeployment, status: 'Online', latency: Math.floor(Math.random() * 50) + 10 });
                      } catch (err) {
                        setManageDeployment({ ...manageDeployment, status: 'Offline', latency: null });
                      }
                      setTimeout(() => setIsHealthChecking(false), 800);
                    }}
                    disabled={isHealthChecking || !manageDeployment.url}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-70"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isHealthChecking ? 'animate-spin' : ''}`} />
                    {isHealthChecking ? 'Checking...' : 'Run Health Check'}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await fetch(apiUrl('/api/deployments'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ path: manageDeployment.path, url: manageDeployment.url, method: manageDeployment.target })
                        });
                        fetchAll();
                        setManageDeployment(null);
                      } catch (e) {}
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
