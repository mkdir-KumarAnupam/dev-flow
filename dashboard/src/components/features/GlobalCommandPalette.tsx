import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';
import { Code, Monitor, Play, List } from 'lucide-react';




const GlobalCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState("");
  const [useDevPrefix, setUseDevPrefix] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const devCommands = [
    'projects', 'focus', 'watch', 'build', 'lint', 'start', 'test', 'deploy',
    'init', 'serve', 'preview', 'format', 'update', 'clean', 'analyze', 'publish'
  ];
  const sysCommands = [
    'git status', 'git add .', 'git commit -m "update"', 'git push', 'git pull', 'git log', 'git branch',
    'bun run dev', 'bun install', 'bun run build', 'bun test',
    'npm start', 'npm run build', 'npm install', 'npm test',
    'dir', 'clear', 'exit', 'cd ..', 'mkdir new_folder', 'rm -rf node_modules'
  ];

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCommand(val);
    setActiveSuggestion(0);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const list = useDevPrefix ? devCommands : sysCommands;
    const matches = list.filter(c => c.toLowerCase().includes(val.toLowerCase()));
    setSuggestions(matches.slice(0, 5));
  };

  useEffect(() => {
    let ipcRenderer: any = null;
    try {
      const electron = (window as any)['r' + 'equire']('electron');
      ipcRenderer = electron?.ipcRenderer;
    } catch (e) {}

    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleCustomOpen = () => setIsOpen(true);

    if (ipcRenderer) {
      ipcRenderer.on('toggle-palette', handleToggle);
      ipcRenderer.on('summon-terminal', handleCustomOpen);
    }

    window.addEventListener('open-terminal', handleCustomOpen);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Ctrl+Backtick or Cmd+Backtick (VS Code style) to open terminal
      if ((e.metaKey || e.ctrlKey) && e.code === 'Backquote') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-terminal', handleCustomOpen);
      if (ipcRenderer) {
        ipcRenderer.removeListener('toggle-palette', handleToggle);
        ipcRenderer.removeListener('summon-terminal', handleCustomOpen);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen && terminalRef.current && !termInstance.current) {
      const term = new Terminal({
        allowTransparency: true,
        theme: {
          background: '#00000000',
          foreground: '#f8fafc',
          cursor: '#8b5cf6',
          selectionBackground: 'rgba(139, 92, 246, 0.4)',
          black: '#000000',
          red: '#f43f5e',
          green: '#10b981',
          yellow: '#f59e0b',
          blue: '#3b82f6',
          magenta: '#8b5cf6',
          cyan: '#06b6d4',
          white: '#ffffff',
          brightBlack: '#64748b',
          brightRed: '#fb7185',
          brightGreen: '#34d399',
          brightYellow: '#fbbf24',
          brightBlue: '#60a5fa',
          brightMagenta: '#a78bfa',
          brightCyan: '#22d3ee',
          brightWhite: '#f8fafc',
        },
        fontFamily: '"FiraCode Nerd Font", "Cascadia Code PL", "MesloLGS NF", "CaskaydiaCove Nerd Font", "Cascadia Code", "Cascadia Mono", Consolas, "Courier New", monospace',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 1.4,
        cursorBlink: true,
        allowProposedApi: true,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      setTimeout(() => {
        fitAddon.fit();
        const ipcRenderer = (window as any)['r' + 'equire']('electron')?.ipcRenderer;
        if (ipcRenderer) {
          ipcRenderer.send('terminal-resize', { cols: term.cols, rows: term.rows });
        }
      }, 50);

      term.writeln('\x1b[1;35mDevOS Terminal\x1b[0m \x1b[90m— Type a dev command and press Enter\x1b[0m\r\n');

      termInstance.current = term;

      let ipcRenderer: any = null;
      try {
        ipcRenderer = (window as any)['r' + 'equire']('electron')?.ipcRenderer;
      } catch (e) {}

      term.onData((data) => {
        if (ipcRenderer) {
          ipcRenderer.send('terminal-input', data);
        }
      });

      term.onResize(({ cols, rows }) => {
        if (isRunning && ipcRenderer) {
          ipcRenderer.send('terminal-resize', { cols, rows });
        }
      });

      const dataHandler = (e: any, data: string) => {
        if (termInstance.current) {
          termInstance.current.write(data);
          if (autoScroll) termInstance.current.scrollToBottom();
        }
        // Check for the new prompt icon (└──▶) to know when command finished
        if (data.includes('└──▶') || data.includes('')) {
          setIsRunning(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        }
        if (data.includes('[Process exited')) {
          setIsRunning(false);
        }
      };

      if (ipcRenderer) {
        ipcRenderer.on('terminal-data', dataHandler);
      }

      window.addEventListener('resize', () => fitAddon.fit());

      return () => {
        if (ipcRenderer) ipcRenderer.removeListener('terminal-data', dataHandler);
        term.dispose();
        termInstance.current = null;
      };
    }
  }, [isOpen, isRunning]);

  const executeCommand = async (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      setActiveSuggestion(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      return;
    }
    if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      setActiveSuggestion(prev => (prev > 0 ? prev - 1 : prev));
      return;
    }
    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setCommand(suggestions[activeSuggestion]);
      setSuggestions([]);
      return;
    }

    if (e.key === 'Enter' && command.trim() && !isRunning) {
      setIsRunning(true);
      setSuggestions([]);
      if (termInstance.current) termInstance.current.focus();
      try {
        const ipcRenderer = (window as any)['r' + 'equire']('electron')?.ipcRenderer;
        if (ipcRenderer) {
          const cols = termInstance.current ? termInstance.current.cols : 80;
          const rows = termInstance.current ? termInstance.current.rows : 30;

          let finalCommand = command.trim();
          if (useDevPrefix && !finalCommand.startsWith('dev ')) {
            finalCommand = `dev ${finalCommand}`;
          }

          ipcRenderer.send('run-terminal-cmd', { command: finalCommand, cols, rows });
        } else {
          if (termInstance.current) termInstance.current.write('\r\n\x1b[31mError: ipcRenderer not found.\x1b[0m\r\n');
          setIsRunning(false);
        }
      } catch(err) {
        if (termInstance.current) termInstance.current.write(`\r\n\x1b[31mError: ${err}\x1b[0m\r\n`);
        setIsRunning(false);
      }
      setCommand("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-5xl glass-modal rounded-2xl overflow-hidden flex flex-col relative isolate shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
          >
            {/* Dotted Grid Background */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none text-slate-100 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />

            {/* Top Bar (matches Editor) */}
            <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm z-10 relative">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsOpen(false)} className="text-[11px] font-bold text-slate-400 hover:text-slate-100 transition-colors uppercase tracking-wider ml-2">
                  &larr; Close
                </button>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-violet-500" />
                  <h2 className="text-xs font-bold text-slate-200">Terminal</h2>

                  {/* Fake language tabs matching Race Mode */}
                  <div className="flex glass-panel rounded-full p-1 ml-4 bg-black/20 border border-white/5">
                    <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all bg-[#0B0F19] shadow-sm text-violet-400 border border-white/5">
                      <Code className="w-3 h-3" /> CLI
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all text-slate-500 hover:text-slate-300 disabled:opacity-50" disabled>
                      <List className="w-3 h-3" /> LOGS
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1" />

              <div className="flex items-center">
                <button
                  onClick={() => { if (termInstance.current) termInstance.current.focus(); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold transition-colors bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 mr-3">
                  <Monitor className="w-3.5 h-3.5" />
                  Focus Terminal
                </button>
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold transition-colors shadow-lg border ${autoScroll ? 'bg-violet-600 hover:bg-violet-500 text-white border-violet-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-white/5'}`}>
                  {autoScroll ? <Play className="w-3.5 h-3.5 fill-current" /> : <List className="w-3.5 h-3.5" />}
                  Auto-Scroll
                </button>
              </div>
            </div>

            {/* Terminal Canvas */}
            <div className="relative z-10 h-[560px] pt-4 px-4 bg-transparent overflow-hidden flex flex-col isolate">
              <div className="w-full h-full flex-1" ref={terminalRef} />
            </div>

            {/* Command Input Area (Below Terminal) */}
            <div className="w-full flex justify-center pb-6 pt-2 z-50">
              <div className="relative group w-full max-w-2xl">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setUseDevPrefix(!useDevPrefix);
                      inputRef.current?.focus();
                    }}
                    title="Toggle 'dev' prefix"
                    className="flex items-center justify-center bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 rounded-full px-4 py-1.5 text-violet-400 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer select-none"
                  >
                    {useDevPrefix ? 'dev' : '$'}
                  </button>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  value={command}
                  onChange={handleCommandChange}
                  onKeyDown={executeCommand}
                  disabled={isRunning}
                  className="w-full glass-panel rounded-full pl-[95px] pr-6 py-3.5 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-slate-200 font-mono placeholder-slate-500 shadow-xl disabled:opacity-50"
                  placeholder={isRunning ? "Running..." : "Enter a command..."}
                />
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.15 }}
                      className="!absolute bottom-full left-4 right-4 mb-4 glass-modal rounded-2xl overflow-hidden z-[100]">
                      {suggestions.map((s, i) => (
                        <div key={s}
                          onClick={() => { setCommand(s); setSuggestions([]); inputRef.current?.focus(); }}
                          className={`px-4 py-3.5 text-[13px] cursor-pointer font-mono transition-colors flex items-center ${i === activeSuggestion ? 'bg-violet-600/40 text-white border-l-2 border-violet-500' : 'text-slate-400 hover:bg-white/5 border-l-2 border-transparent'}`}>
                          {useDevPrefix ? <span className="text-violet-300/50 mr-4 text-xs font-bold w-6 text-right">dev</span> : <span className="text-violet-300/50 mr-4 text-xs font-bold w-6 text-right">$</span>}
                          {s}
                          {i === activeSuggestion && <span className="ml-auto text-[10px] font-bold text-violet-300/70 tracking-widest">TAB</span>}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default GlobalCommandPalette;
