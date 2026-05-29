import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Wifi, Server, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useGlobalApp } from '@/context/GlobalAppContext';

const mV: any = { 
  hidden: { opacity: 0, scale: 0.95, y: 10 }, 
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, 
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } 
};

export default function TunnelQRCodeModal() {
  const { tunnelingProject, setTunnelingProject } = useGlobalApp();
  const [tunnelUrl, setTunnelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tunnelingProject) {
      setTunnelUrl(null);
      setError(null);
      let isMounted = true;
      (async () => {
        try {
          const res = await (window as any).require('electron').ipcRenderer.invoke('start-project-tunnel', tunnelingProject);
          if (res.error) {
            if (isMounted) setError(res.error);
          } else {
            if (isMounted) setTunnelUrl(res.url);
          }
        } catch (e: any) {
          if (isMounted) setError(e.message || "Failed to establish tunnel");
        }
      })();
      return () => { isMounted = false; };
    }
  }, [tunnelingProject]);

  return (
    <AnimatePresence>
      {tunnelingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTunnelingProject(null)} className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" />
          <motion.div variants={mV} initial="hidden" animate="show" exit="exit" className="relative w-full max-w-sm glass-panel border border-slate-200/60 dark:border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-xl">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground leading-none">Local Tunnel</h3>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Project Exposed</p>
                </div>
              </div>
              <button onClick={() => setTunnelingProject(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center justify-center text-center">
              {!tunnelUrl && !error ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative mb-6">
                     <div className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-emerald-500" />
                        <Server className="w-6 h-6 text-slate-400" />
                     </div>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Starting Dev Server...</h4>
                  <p className="text-[10px] text-slate-500 mt-2 max-w-[200px]">Spawning process and waiting for port availability to establish the secure tunnel.</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-4">
                     <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">Tunnel Failed</h4>
                  <p className="text-xs text-slate-500 mt-2 max-w-[250px] break-words">{error}</p>
                </div>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 inline-block mb-6">
                    <QRCodeSVG value={tunnelUrl as string} size={180} level="H" includeMargin={false} fgColor="#0f172a" />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-xs mx-auto group">
                    <Wifi className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate select-all">{tunnelUrl}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 max-w-[260px]">
                    Scan this QR code with your mobile device or share the link to preview the project live.
                  </p>
                </>
              )}
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-4 flex items-center justify-center">
               <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {tunnelUrl ? "Tunnel Active" : error ? "Tunnel Inactive" : "Establishing Tunnel"}
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
