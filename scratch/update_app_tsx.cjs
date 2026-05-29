const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/dashboard/src/App.tsx', 'utf8');

const regexEndSession = /<div className="mt-8 flex justify-center">[\s\S]*?<\/div>/;
const replacementEndSession = `<div className="mt-8 flex flex-col items-center justify-center gap-4">
                            {focusLive?.category === 'break' ? (
                              <button
                                onClick={() => fetch('http://localhost:4000/api/focus/command', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({command: 'resume_focus'}) })}
                                className="px-6 py-2 rounded-full bg-teal-500/20 border border-teal-500/30 text-[10px] font-bold tracking-[0.2em] uppercase text-teal-300 transition-all active:scale-95 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                              >
                                Resume Focus
                              </button>
                            ) : (
                              <button
                                onClick={() => fetch('http://localhost:4000/api/focus/command', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({command: 'start_break'}) })}
                                className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-white hover:bg-white/10 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                              >
                                Take Break
                              </button>
                            )}
                            
                            <button
                              onClick={() => fetch('http://localhost:4000/api/focus/command', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({command: 'end_session'}) })}
                              className="group flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-[0.2em] mt-2"
                            >
                              <Square className="w-3 h-3 transition-transform group-hover:scale-110" /> End Session
                            </button>
                          </div>`;

code = code.replace(regexEndSession, replacementEndSession);

const regexColors = /const ringColor = score >= 90 \? '#10b981' : score >= 70 \? '#f59e0b' : score >= 50 \? '#f97316' : '#ef4444';/;
const replacementColors = `const isBreak = focusLive?.category === 'break';
                const ringColor = isBreak ? '#14b8a6' : (score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : score >= 50 ? '#f97316' : '#ef4444');`;

code = code.replace(regexColors, replacementColors);

const regexStatus = /<p className="mt-6 text-\[10px\] font-bold uppercase tracking-\[0\.3em\] text-slate-500 z-10 transition-colors">DEEP WORK<\/p>/;
const replacementStatus = `<p className={\`mt-6 text-[10px] font-bold uppercase tracking-[0.3em] z-10 transition-colors \${isBreak ? 'text-teal-400' : 'text-slate-500'}\`}>{isBreak ? 'ON BREAK' : 'DEEP WORK'}</p>`;

code = code.replace(regexStatus, replacementStatus);

fs.writeFileSync('C:/dev-cli/dashboard/src/App.tsx', code);
console.log('Updated App.tsx');
