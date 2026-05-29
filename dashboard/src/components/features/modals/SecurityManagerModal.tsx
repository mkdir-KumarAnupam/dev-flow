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
  hidden: { opacity: 0, scale: 0.95, y: 10 }, 
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, 
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } 
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
      assignedProjects: []
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-auto p-4">
          <motion.div variants={overlayV} initial="hidden" animate="show" exit="exit" onClick={() => setSecurityManagerOpen(false)} className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" />
          
          <motion.div variants={modalV} initial="hidden" animate="show" exit="exit" className="relative w-full max-w-2xl glass-panel border border-slate-200/60 dark:border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-xl">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground leading-none">Security Vault</h3>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Hardware Encrypted Store</p>
                </div>
              </div>
              <button onClick={() => setSecurityManagerOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white/50 dark:bg-slate-950/50">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-3.5 h-3.5" /> Stored Secrets
                </h4>
                <button 
                  onClick={() => setIsAdding(!isAdding)}
                  className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 transition-colors text-foreground"
                >
                  {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {isAdding ? "Cancel" : "Add Secret"}
                </button>
              </div>

              <AnimatePresence>
                {isAdding && (
                  <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Key Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. OPENAI_API_KEY" 
                            value={newName} 
                            onChange={e => setNewName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Environment Scope</label>
                          <select 
                            value={newEnv} 
                            onChange={e => setNewEnv(e.target.value as any)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-foreground"
                          >
                            <option value="Global">Global (All Projects)</option>
                            <option value="Development">Development (Dev Servers)</option>
                            <option value="Production">Production (Deployments)</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Secret Value</label>
                        <input 
                          type="password" 
                          placeholder="sk-..." 
                          value={newValue} 
                          onChange={e => setNewValue(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-foreground"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={handleAdd} 
                          disabled={!newName || !newValue} 
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Secret
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loading ? (
                <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
              ) : keys.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-slate-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Vault is empty</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Add API keys and secrets here to inject them automatically into your dev servers securely.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {keys.map(k => (
                    <motion.div key={k.id} layout className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between group shadow-sm hover:border-indigo-500/50 transition-colors">
                      <div className="min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-foreground font-mono truncate">{k.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">
                            {k.environment}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded truncate max-w-[200px]">
                            {visibleKeys[k.id] ? k.value : '••••••••••••••••••••••••'}
                          </span>
                          <button onClick={() => toggleVisibility(k.id)} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors">
                            {visibleKeys[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0">
                        <button onClick={() => handleDelete(k.id)} className="p-2 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-3.5 flex items-center justify-center">
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Secured by OS-level encryption
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
