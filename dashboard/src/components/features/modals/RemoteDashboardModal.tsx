import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Wifi } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useGlobalApp } from '@/context/GlobalAppContext';

export default function RemoteDashboardModal() {
  const { showRemoteQRCode, setShowRemoteQRCode, remoteDashboardUrl } = useGlobalApp();

  return (
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
  );
}
