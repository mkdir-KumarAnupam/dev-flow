import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Key, Eye, EyeOff, Plus, Trash2, Save, ShieldCheck } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

const overlayV: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalV: any = { 
  hidden: { opacity: 0, scale: 0.95, y: 20, rotateX: 10 }, 
  show: { opacity: 1, scale: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.6 } }, 
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } } 
};

const listV: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const itemV: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } }
};

interface SecurityKey {
  id: string;
  name: string;
  value: string;
  environment: 'Global' | 'Development' | 'Production';
  assignedProjects: string[];
}

export default function SecurityManagerModal() {
  const { securityManagerOpen, setSecurityManagerOpen } = useGlobalApp();
  const [keys, setKeys] = useState<SecurityKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New Key Form State
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newEnv, setNewEnv] = useState<'Global' | 'Development' | 'Production'>('Development');

  useEffect(() => {
    if (securityManagerOpen) {
      loadKeys();
    }
  }, [securityManagerOpen]);

  const loadKeys = async () => {
    try {
      const storedKeys = await (window as any).require('electron').ipcRenderer.invoke('get-security-keys');
      setKeys(storedKeys || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveKeys = async (newKeys: SecurityKey[]) => {
    try {
      await (window as any).require('electron').ipcRenderer.invoke('save-security-keys', newKeys);
      setKeys(newKeys);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = () => {
    if (!newName || !newValue) return;
    const newKey: SecurityKey = {
      id: Date.now().toString(),
      name: newName.trim(),
      value: newValue.trim(),
      environment: newEnv,
      assignedProjects: [] // Default available to all
    };
    saveKeys([...keys, newKey]);
    setIsAdding(false);
    setNewName('');
    setNewValue('');
  };

  const handleDelete = (id: string) => {
    saveKeys(keys.filter(k => k.id !== id));
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AnimatePresence>
      {securityManagerOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-auto p-4 perspective-1000">
          <motion.div variants={overlayV} initial="hidden" animate="show" exit="exit" onClick={() => setSecurityManagerOpen(false)} className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xl" />
          
          <motion.div variants={modalV} initial="hidden" animate="show" exit="exit" className="relative w-full max-w-3xl flex flex-col h-[75vh] max-h-[700px] overflow-hidden rounded-[2rem] bg-white/40 dark:bg-[#0f111a]/60 backdrop-blur-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-white/20 dark:border-white/10">
            
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-white/10 dark:bg-white/5 text-foreground rounded-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 dark:border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                  <ShieldCheck className="h-6 w-6 relative z-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight drop-shadow-sm">Security Vault</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Hardware-accelerated OS-level encrypted store</p>
                </div>
              </div>
              <button onClick={() => setSecurityManagerOpen(false)} className="p-2.5 bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-slate-500 hover:text-foreground transition-all duration-300 border border-transparent hover:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="flex justify-between items-end mb-6">
                <h4 className="text-sm font-bold text-foreground/80 flex items-center gap-2 uppercase tracking-wider">
                  <Key className="w-4 h-4 opacity-50" />
                  Stored Secrets
                </h4>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAdding(!isAdding)}
                  className="flex items-center gap-2 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/20 dark:border-white/5 transition-all duration-300"
                >
                  {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isAdding ? "Cancel" : "Add Secret"}
                </motion.button>
              </div>

              <AnimatePresence>
                {isAdding && (
                  <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} className="mb-6 overflow-hidden">
                    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-[1.5rem] p-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_10px_30px_-10px_rgba(0,0,0,0.2)]">
                      <div className="grid grid-cols-2 gap-5 mb-5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Key Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. OPENAI_API_KEY" 
                            value={newName} 
                            onChange={e => setNewName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                            className="w-full bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 ring-white/30 dark:ring-white/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] placeholder:text-slate-400/50"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Environment Scope</label>
                          <select 
                            value={newEnv} 
                            onChange={e => setNewEnv(e.target.value as any)}
                            className="w-full bg-white/50 dark:bg-[#151822] border border-white/40 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ring-white/30 dark:ring-white/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] appearance-none"
                          >
                            <option value="Global">Global (All Projects)</option>
                            <option value="Development">Development (Dev Servers)</option>
                            <option value="Production">Production (Deployments)</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Secret Value</label>
                        <input 
                          type="password" 
                          placeholder="sk-..." 
                          value={newValue} 
                          onChange={e => setNewValue(e.target.value)}
                          className="w-full bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 ring-white/30 dark:ring-white/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] placeholder:text-slate-400/50"
                        />
                      </div>
                      <div className="flex justify-end">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleAdd} 
                          disabled={!newName || !newValue} 
                          className="bg-foreground hover:bg-foreground/90 disabled:opacity-30 text-background font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
                        >
                          <Save className="w-4 h-4" /> Save Secret
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loading ? (
                <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-foreground opacity-50" /></div>
              ) : keys.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 flex flex-col items-center justify-center text-center bg-white/10 dark:bg-white/5 rounded-[2rem] border border-dashed border-white/20 dark:border-white/10 backdrop-blur-sm">
                  <div className="w-16 h-16 bg-white/10 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-5 text-foreground/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <Lock className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-bold text-foreground">Vault is empty</p>
                  <p className="text-sm text-foreground/50 mt-2 max-w-xs leading-relaxed">Add API keys and secrets here to inject them automatically into your dev servers securely.</p>
                </motion.div>
              ) : (
                <motion.div variants={listV} initial="hidden" animate="show" className="space-y-4">
                  {keys.map(k => (
                    <motion.div variants={itemV} key={k.id} layout className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/30 dark:hover:bg-white/5 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]">
                      <div className="min-w-0 flex-1 mr-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-extrabold text-foreground font-mono truncate tracking-tight">{k.name}</span>
                          <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest bg-black/5 dark:bg-white/10 text-foreground/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                            {k.environment}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-foreground/50 bg-black/5 dark:bg-black/40 px-3 py-1.5 rounded-lg shadow-inner">
                            {visibleKeys[k.id] ? k.value : '••••••••••••••••••••••••'}
                          </span>
                          <button onClick={() => toggleVisibility(k.id)} className="p-1.5 rounded-lg text-foreground/30 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-all">
                            {visibleKeys[k.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(k.id)} className="p-3 text-foreground/30 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-black/5 dark:bg-black/30 border-t border-white/10 dark:border-white/5 p-5 flex justify-between items-center backdrop-blur-lg">
              <div className="flex items-center gap-2.5 text-foreground/40 text-xs font-medium">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500/50"></span>
                </div>
                Secured by OS-level encryption (safeStorage)
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
