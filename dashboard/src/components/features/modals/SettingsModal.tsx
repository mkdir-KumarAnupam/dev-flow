import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, User, RefreshCw, Save, HardDrive, Key } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

const overlayV: any = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } };
const modalV: any = { 
  hidden: { opacity: 0, scale: 0.95, y: 10 }, 
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, 
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } 
};

export default function SettingsModal() {
  const { settingsModalOpen, setSettingsModalOpen, devosSettings, setDevosSettings, fetchAll } = useGlobalApp();
  
  const [formData, setFormData] = useState({
    userName: '',
    workspacePath: '',
    obsidianVaultPath: '',
    linearApiKey: '',
    firebaseDatabaseUrl: '',
    firebaseServiceAccountPath: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (settingsModalOpen && devosSettings) {
      setFormData({
        userName: devosSettings.userName || '',
        workspacePath: devosSettings.workspacePath || '',
        obsidianVaultPath: devosSettings.obsidianVaultPath || '',
        linearApiKey: devosSettings.linearApiKey || '',
        firebaseDatabaseUrl: devosSettings.firebaseDatabaseUrl || '',
        firebaseServiceAccountPath: devosSettings.firebaseServiceAccountPath || ''
      });
    }
  }, [settingsModalOpen, devosSettings]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const apiUrl = (path: string) => typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin + (path.startsWith('/') ? path : '/' + path) : 'http://localhost:4000' + (path.startsWith('/') ? path : '/' + path);
    
    try {
      const response = await fetch(apiUrl('/api/settings/update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success && data.settings && setDevosSettings) {
        setDevosSettings(data.settings);
      }
      setSettingsModalOpen(false);
      fetchAll(); // refresh data with new settings
    } catch (e) {
      console.error(e);
      alert("Failed to save settings");
    }
    setIsSaving(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAll();
    setIsRefreshing(false);
  };

  return (
    <AnimatePresence>
      {settingsModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-auto p-4">
          <motion.div variants={overlayV} initial="hidden" animate="show" exit="exit" onClick={() => setSettingsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" />
          
          <motion.div variants={modalV} initial="hidden" animate="show" exit="exit" className="relative w-full max-w-2xl glass-panel border border-slate-200/60 dark:border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-500 rounded-xl">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground leading-none">DevOS Settings</h3>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">System Configuration</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  title="Force refresh all data from backends"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh System
                </button>
                <button onClick={() => setSettingsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white/50 dark:bg-slate-950/50">
              <div className="space-y-6">
                
                {/* General Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <User className="w-3.5 h-3.5" /> General
                  </h4>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Developer Name</label>
                      <input 
                        type="text" 
                        value={formData.userName}
                        onChange={(e) => handleChange('userName', e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Paths Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <HardDrive className="w-3.5 h-3.5" /> File Paths
                  </h4>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Main Workspace Path</label>
                      <input 
                        type="text" 
                        value={formData.workspacePath}
                        onChange={(e) => handleChange('workspacePath', e.target.value)}
                        placeholder="C:\path\to\your\dev\folder"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Obsidian Vault Path</label>
                      <input 
                        type="text" 
                        value={formData.obsidianVaultPath}
                        onChange={(e) => handleChange('obsidianVaultPath', e.target.value)}
                        placeholder="C:\path\to\Obsidian\Vault"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all text-foreground"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">DevOS will save Quick Notes into a 'DevOS' subfolder here.</p>
                    </div>
                  </div>
                </div>

                {/* Integrations Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Key className="w-3.5 h-3.5" /> API Keys & Integrations
                  </h4>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Linear API Key</label>
                      <input 
                        type="password" 
                        value={formData.linearApiKey}
                        onChange={(e) => handleChange('linearApiKey', e.target.value)}
                        placeholder="lin_api_..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all text-foreground"
                      />
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Firebase Database URL</label>
                      <input 
                        type="text" 
                        value={formData.firebaseDatabaseUrl}
                        onChange={(e) => handleChange('firebaseDatabaseUrl', e.target.value)}
                        placeholder="https://your-project.firebaseio.com"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Firebase Service Account JSON Path</label>
                      <input 
                        type="text" 
                        value={formData.firebaseServiceAccountPath}
                        onChange={(e) => handleChange('firebaseServiceAccountPath', e.target.value)}
                        placeholder="C:\path\to\serviceAccountKey.json"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all text-foreground"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
