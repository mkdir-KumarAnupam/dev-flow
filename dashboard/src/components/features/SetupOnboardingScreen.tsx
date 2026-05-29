import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';
const apiUrl = (path: string) => typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin + (path.startsWith('/') ? path : '/' + path) : 'http://localhost:4000' + (path.startsWith('/') ? path : '/' + path);




/* ─── GitHub-style Heatmap ─── */

const SetupOnboardingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [firebaseDatabaseUrl, setFirebaseDatabaseUrl] = useState('');
  const [firebaseServiceAccountPath, setFirebaseServiceAccountPath] = useState('');
  const [linearApiKey, setLinearApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickFile = async () => {
    try {
      const res = await fetch(apiUrl('/api/setup/pick-file'), { method: 'POST' });
      const data = await res.json();
      if (data.path) {
        setFirebaseServiceAccountPath(data.path);
      }
    } catch (e) {
      setError('Failed to pick file');
    }
  };

  const handleNext = () => {
    if (!userName || !firebaseDatabaseUrl || !firebaseServiceAccountPath) {
      setError('Please fill in the core profile fields first.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/setup/complete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, firebaseDatabaseUrl, firebaseServiceAccountPath, linearApiKey, geminiApiKey })
      });
      const data = await res.json();
      if (data.success) {
        onComplete();
      } else {
        setError(data.error || 'Failed to complete setup');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#030305] flex items-center justify-center p-6 text-slate-200 font-sans relative overflow-hidden">
      {/* Ambient Orbs for 3D Glassmorphism */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] will-change-transform transform-gpu pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] will-change-transform transform-gpu pointer-events-none" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="max-w-lg w-full bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 shadow-[0_0_50px_rgba(139,92,246,0.15)] relative z-10">

        <div className="flex flex-col items-center justify-center mb-8">
          <motion.div whileHover={{ scale: 1.05 }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 shadow-inner mb-4">
            <Rocket className="w-8 h-8 text-violet-300 drop-shadow-md" />
          </motion.div>
          <h1 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">DevOS Setup</h1>
          <p className="text-xs text-slate-400 text-center mt-2 uppercase tracking-[0.2em] font-bold">
            {step === 1 ? 'Step 1: Core Profile' : 'Step 2: Integrations'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Your Name</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-white placeholder-slate-600 shadow-inner" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Firebase DB URL</label>
                <input type="text" value={firebaseDatabaseUrl} onChange={(e) => setFirebaseDatabaseUrl(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-white placeholder-slate-600 shadow-inner" placeholder="https://your-project.firebasedatabase.app" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Service Account JSON</label>
                <div className="flex gap-2">
                  <input type="text" readOnly value={firebaseServiceAccountPath} className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 shadow-inner" placeholder="No file selected..." />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePickFile} className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-xs font-bold uppercase tracking-wider transition-colors text-slate-200">Browse</motion.button>
                </div>
              </div>
              {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center font-medium">{error}</div>}
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleNext} className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                Next: Integrations &rarr;
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Linear API Key <span className="text-slate-600 normal-case tracking-normal font-normal">(Optional)</span></label>
                <input type="password" value={linearApiKey} onChange={(e) => setLinearApiKey(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-white placeholder-slate-600 shadow-inner" placeholder="lin_api_..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Gemini API Key <span className="text-slate-600 normal-case tracking-normal font-normal">(Optional)</span></label>
                <input type="password" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-white placeholder-slate-600 shadow-inner" placeholder="AIza..." />
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-xs font-bold uppercase tracking-wider transition-colors text-slate-200">
                  &larr; Back
                </motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleComplete} disabled={loading} className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50">
                  {loading ? 'Initializing...' : 'Launch DevOS'}
                </motion.button>
              </div>
              {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center font-medium">{error}</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
export default SetupOnboardingScreen;
