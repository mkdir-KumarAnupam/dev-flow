import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Play, Terminal, Box, Blocks, Loader2 } from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';



loader.config({ monaco });

export default function Playground() {
  const [activeTab, setActiveTab] = useState<'Sandpack' | 'Mini-IDE'>('Mini-IDE');
  const [editorTheme, setEditorTheme] = useState('glassThemeDark');
  
  const [ideCode, setIdeCode] = useState('// Write your scripts or JSON here\n\nconst greet = () => {\n  console.log("Hello from Mini-IDE!");\n};\n\ngreet();');
  const [ideLanguage, setIdeLanguage] = useState<'javascript' | 'json' | 'typescript' | 'java' | 'cpp'>('javascript');
  const [ideOutput, setIdeOutput] = useState('');
  const [ideRunning, setIdeRunning] = useState(false);

  const [reactCode, setReactCode] = useState(`export default function App() {\n  return (\n    <div className="p-8 max-w-sm mx-auto bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl mt-10">\n      <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-2">Hello, Tailwind!</h1>\n      <p className="text-sm text-slate-300 font-medium">Start building gorgeous UIs directly in the dashboard using Tailwind CSS.</p>\n    </div>\n  );\n}`);

  const getReactPreviewHtml = (code: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    window.exports = {};
    window.module = { exports: window.exports };
    window.require = function(name) {
      if (name === 'react') return window.React;
      if (name === 'react-dom') return window.ReactDOM;
      return null;
    };
  </script>
</head>
<body class="bg-slate-900 text-white p-4 m-0 font-sans">
  <div id="root"></div>
  <script>
    const userCode = ${JSON.stringify(code)};
    try {
      const compiled = Babel.transform(userCode, { presets: ['env', 'react'] }).code;
      eval(compiled);
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      const AppComponent = window.exports.default || window.App || function() { 
        return React.createElement('div', { className: 'text-yellow-500 font-mono text-sm p-4' }, 'Please export a default React component (e.g., export default function App() { ... })'); 
      };
      
      root.render(React.createElement(AppComponent));
    } catch(err) {
      document.getElementById('root').innerHTML = '<div class="text-red-500 font-mono text-sm whitespace-pre-wrap p-4">Compilation Error:\\n' + err.toString() + '</div>';
    }
  </script>
</body>
</html>
`;

  const handleLanguageChange = (l: 'javascript' | 'json' | 'typescript' | 'java' | 'cpp') => {
    setIdeLanguage(l);
    if (l === 'javascript') setIdeCode('// Write your scripts or JSON here\n\nconst greet = () => {\n  console.log("Hello from Javascript!");\n};\n\ngreet();');
    else if (l === 'typescript') setIdeCode('// Write your scripts or JSON here\n\nconst greet = (name: string) => {\n  console.log(`Hello ${name}!`);\n};\n\ngreet("TypeScript");');
    else if (l === 'json') setIdeCode('{\n  "message": "Hello JSON",\n  "status": "success"\n}');
    else if (l === 'java') setIdeCode('class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java!");\n  }\n}');
    else if (l === 'cpp') setIdeCode('#include <iostream>\n\nint main() {\n  std::cout << "Hello from C++!" << std::endl;\n  return 0;\n}');
  };

  useEffect(() => {
    setEditorTheme(document.documentElement.classList.contains('dark') ? 'glassThemeDark' : 'glassThemeLight');
    const observer = new MutationObserver(() => {
      setEditorTheme(document.documentElement.classList.contains('dark') ? 'glassThemeDark' : 'glassThemeLight');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleEditorWillMount = (m: any) => {
    m.editor.defineTheme('glassThemeDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000',
        'editor.lineHighlightBackground': '#ffffff10',
      }
    });
    m.editor.defineTheme('glassThemeLight', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000',
        'editor.lineHighlightBackground': '#00000010',
      }
    });
    
    // Enable JSX parsing
    m.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: m.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: m.languages.typescript.ModuleResolutionKind.NodeJs,
      module: m.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: m.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
    });
    m.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });
  };

  const handleRunScript = async () => {
    if (ideLanguage === 'json') return;
    setIdeRunning(true);
    setIdeOutput('Compiling and running on cloud engine...');
    
    try {
      const compilers = {
        'javascript': 'nodejs-20.17.0',
        'typescript': 'typescript-5.6.2',
        'java': 'openjdk-jdk-22+36',
        'cpp': 'gcc-head'
      };
      const compiler = compilers[ideLanguage as keyof typeof compilers];
      
      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: compiler,
          code: ideCode,
          save: false
        })
      });

      const data = await response.json();
      if (data.status === '0') {
        setIdeOutput(data.program_output || data.compiler_output || 'Execution finished successfully (no output).');
      } else {
        setIdeOutput(`Error:\n${data.compiler_error || data.program_error || 'Execution failed'}`);
      }
    } catch (e: any) {
      setIdeOutput(`Network Error: ${e.message}\nFailed to connect to execution engine.`);
    }
    setIdeRunning(false);
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 relative isolate overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none text-violet-600 dark:text-violet-400 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      {/* Header & Tabs */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel backdrop-blur-xl p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner">
            <Blocks className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Playgrounds</h1>
            <p className="text-xs text-muted-foreground font-medium">Experiment with components and scripts</p>
          </div>
        </div>

        <div className="flex p-1.5 glass-panel bg-background/50 rounded-2xl">
          <button
            onClick={() => setActiveTab('Sandpack')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'Sandpack' ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-foreground'
            }`}
          >
            <Box className="w-4 h-4" /> Component Playground
          </button>
          <button
            onClick={() => setActiveTab('Mini-IDE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'Mini-IDE' ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-foreground'
            }`}
          >
            <Code2 className="w-4 h-4" /> Mini-IDE
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 overflow-hidden glass-panel backdrop-blur-xl rounded-3xl flex flex-col shadow-xl border border-white/20 dark:border-slate-800/80">
        <AnimatePresence mode="wait">
          {activeTab === 'Sandpack' ? (
            <motion.div
              key="sandpack"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col overflow-hidden"
            >
              <style dangerouslySetInnerHTML={{__html: `
                .cm-gutters {
                  display: none !important;
                }
                .cm-content {
                  padding-left: 16px !important;
                  white-space: pre-wrap !important;
                  word-break: break-word !important;
                }
              `}} />
              <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.08] pointer-events-none text-slate-900 dark:text-slate-100 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
              
              <div className="h-full w-full relative z-10 flex flex-col">
                  {/* IDE Toolbar Equivalent */}
                  <div className="flex items-center justify-between p-3 border-b border-border/50 bg-background/50 backdrop-blur-sm z-10 relative">
                    <div className="flex items-center gap-2">
                      <div className="flex glass-panel rounded-lg p-0.5 ml-2">
                        <button className="px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all bg-background shadow-sm text-violet-500">
                          APP.JSX
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* IDE Editor & Output Split Equivalent */}
                  <div className="flex-1 flex flex-col lg:flex-row min-h-[500px] lg:min-h-0 relative z-10 bg-transparent">
                    <div className="flex-[2] relative bg-transparent py-4 border-b lg:border-b-0 lg:border-r border-border/50 min-h-[300px] lg:min-h-0">
                      <Editor
                        height="100%"
                        language="javascript"
                        path="App.jsx"
                        theme={editorTheme}
                        value={reactCode}
                        onChange={(val) => setReactCode(val || '')}
                        beforeMount={handleEditorWillMount}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                          fontLigatures: true,
                          padding: { top: 16 },
                          scrollBeyondLastLine: false,
                          smoothScrolling: true,
                          cursorBlinking: "smooth",
                          cursorSmoothCaretAnimation: "on",
                          formatOnPaste: true,
                          wordWrap: "on",
                        }}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden relative h-full flex flex-col bg-black/20">
                      <iframe 
                        className="w-full h-full border-none"
                        srcDoc={getReactPreviewHtml(reactCode)}
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mini-ide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.08] pointer-events-none text-slate-900 dark:text-slate-100 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
              {/* IDE Toolbar */}
              <div className="flex items-center justify-between p-3 border-b border-border/50 bg-background/50 backdrop-blur-sm z-10 relative">
                <div className="flex items-center gap-2">
                  <div className="flex glass-panel rounded-lg p-0.5 ml-2">
                    {(['javascript', 'json', 'typescript', 'java', 'cpp'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => handleLanguageChange(l as any)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                          ideLanguage === l ? 'bg-background shadow-sm text-violet-500' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={handleRunScript}
                  disabled={ideRunning || ideLanguage === 'json'}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {ideRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Run Script
                </button>
              </div>

              {/* IDE Editor & Output Split */}
              <div className="flex-1 flex flex-col lg:flex-row min-h-[500px] lg:min-h-0 relative z-10 bg-transparent">
                <div className="flex-1 relative bg-transparent py-4 border-b lg:border-b-0 lg:border-r border-border/50 min-h-[300px] lg:min-h-0">
                  <Editor
                    beforeMount={handleEditorWillMount}
                    height="100%"
                    language={ideLanguage}
                    value={ideCode}
                    onChange={(v) => setIdeCode(v || '')}
                    theme={editorTheme}
                    options={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace", fontLigatures: true, minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, smoothScrolling: true }}
                  />
                </div>
                <div className="w-full lg:w-96 flex-none flex flex-col bg-slate-900/10 dark:bg-black/20 min-h-[200px] lg:min-h-0 backdrop-blur-sm">
                  <div className="p-2 border-b border-border/50 flex items-center gap-2 bg-background/20">
                    <Terminal className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Console Output</span>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto custom-scrollbar text-sm font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {ideOutput || <span className="text-slate-400 opacity-50">No output yet...</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
