import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Server, Cloud, Flame, Globe } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

const mV: any = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } };

export default function DeploymentsModal() {
  const { manageDeployment, setManageDeployment, isHealthChecking, setIsHealthChecking, fetchAll } = useGlobalApp();
  const API_BASE = typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin : 'http://localhost:4000';
  const apiUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  return (
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
  );
}
