import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Key, Eye, EyeOff, Plus, Trash2, Save, ShieldCheck } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

const mV: any = { 
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
      assignedProjects: [] // Default available to all, can be expanded later
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSecurityManagerOpen(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md" />
          <motion.div variants={mV} initial="hidden" animate="show" exit="exit" className="relative w-full max-w-2xl glass-panel border border-slate-200/60 dark:border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[80vh] max-h-[700px]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-xl shadow-inner border border-amber-100 dark:border-amber-900/50">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">Security Vault</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Manage encrypted API keys and environment variables</p>
                </div>
              </div>
              <button onClick={() => setSecurityManagerOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-transparent">
              <div className="flex justify-between items-end mb-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  Stored Secrets
                </h4>
                <button 
                  onClick={() => setIsAdding(!isAdding)}
                  className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {isAdding ? "Cancel" : "Add Secret"}
                </button>
              </div>

              {isAdding && (
                <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 16 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Key Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. OPENAI_API_KEY" 
                        value={newName} 
                        onChange={e => setNewName(e.target.value.toUpperCase().replace(/\\s+/g, '_'))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Environment</label>
                      <select 
                        value={newEnv} 
                        onChange={e => setNewEnv(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                      >
                        <option value="Global">Global</option>
                        <option value="Development">Development</option>
                        <option value="Production">Production</option>
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
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleAdd} disabled={!newName || !newValue} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" /> Save Secret
                    </button>
                  </div>
                </motion.div>
              )}

              {loading ? (
                <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>
              ) : keys.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Vault is empty</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[250px]">Add API keys and secrets here to inject them automatically into your development environments.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {keys.map(k => (
                    <div key={k.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between group hover:border-amber-300 dark:hover:border-amber-700/50 transition-colors">
                      <div className="min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-foreground font-mono truncate">{k.name}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                            k.environment === 'Production' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                            k.environment === 'Development' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {k.environment}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">
                            {visibleKeys[k.id] ? k.value : '••••••••••••••••••••••••'}
                          </span>
                          <button onClick={() => toggleVisibility(k.id)} className="p-1 text-slate-400 hover:text-amber-500 transition-colors">
                            {visibleKeys[k.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDelete(k.id)} className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                <Lock className="w-3 h-3" />
                Secured by OS-level encryption (safeStorage)
              </div>
              {/* <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Upload className="w-3 h-3" /> Import
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Download className="w-3 h-3" /> Export
                </button>
              </div> */}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
