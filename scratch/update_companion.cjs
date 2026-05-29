const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/FocusCompanion/app/src/main/assets/companion.html', 'utf8');

const regexStyle = /<\/style>/;
const replacementStyle = `
    /* Landscape Support */
    @media (min-width: 600px) and (orientation: landscape) {
      #activeSessionView {
        flex-direction: row;
        justify-content: center;
        gap: 2rem;
      }
      .stats-panel {
        margin-top: 0 !important;
        max-width: 300px;
        flex-direction: column;
        gap: 1.5rem;
      }
      .stats-panel > div {
        border-right: none !important;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 1rem;
        width: 100%;
      }
      .stats-panel > div:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .controls-panel {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
    }
  </style>`;

code = code.replace(regexStyle, replacementStyle);

const regexHtml = /<!-- Desktop UI Parity: Stats Bar -->[\s\S]*?<!-- Desktop UI Parity: End Session Checkbox -->/;
const replacementHtml = `<!-- Desktop UI Parity: Stats Bar -->
      <div class="flex flex-col md:flex-row gap-6 w-full">
        <div class="stats-panel w-full mt-10 p-4 glass-panel rounded-2xl flex justify-between items-center text-center">
          <div class="flex-1 flex flex-col gap-1 border-r border-slate-700/50">
            <span class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Activity</span>
            <div class="flex items-center justify-center gap-1.5 mt-1">
              <div id="activityDot" class="w-2 h-2 rounded-full bg-slate-500"></div>
              <span id="activityText" class="text-xs font-bold text-slate-300">Idle</span>
            </div>
          </div>
          <div class="flex-1 flex flex-col gap-1 border-r border-slate-700/50">
            <span class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Flow Score</span>
            <span id="flowScoreText" class="text-lg font-black text-slate-300 mt-0.5">0</span>
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <span class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Streak</span>
            <span id="streakText" class="text-lg font-black text-slate-300 mt-0.5">0<span class="text-[10px] text-slate-500 ml-0.5">m</span></span>
          </div>
        </div>

        <div class="controls-panel mt-6 flex flex-col items-center justify-center gap-4">
          <button id="breakBtn" onclick="toggleBreak()" class="px-6 py-2 rounded-full glass-panel text-[10px] font-bold tracking-[0.2em] uppercase text-white transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/10">Take Break</button>
          
          <button onclick="endSession()" class="flex items-center gap-2 cursor-pointer transition-all active:scale-95 group">
            <div class="w-4 h-4 border-2 border-rose-500/50 rounded-[3px] group-hover:bg-rose-500/20 transition-colors flex items-center justify-center">
              <div class="w-2 h-2 bg-rose-500 rounded-sm opacity-0 group-active:opacity-100"></div>
            </div>
            <span class="text-[10px] font-bold tracking-[0.2em] uppercase text-rose-400 group-hover:text-rose-300">End Session</span>
          </button>
        </div>
      </div>`;

code = code.replace(regexHtml, replacementHtml);

const regexJs = /function updateClockUI\(\) \{/;
const replacementJs = `
    let currentCategory = "idle";
    
    function toggleBreak() {
      if (!isSessionActive) return;
      if (currentCategory === "break") {
        if (window.Android) window.Android.sendCommand("resume_focus");
      } else {
        if (window.Android) window.Android.sendCommand("start_break");
      }
    }

    function endSession() {
      if (!isSessionActive) return;
      if (window.Android) window.Android.sendCommand("end_session");
      // Optimistic UI update
      offlineOverlay.classList.remove('opacity-0', 'pointer-events-none');
      offlineOverlay.classList.add('opacity-100');
    }

    function updateClockUI() {`;

code = code.replace(regexJs, replacementJs);

const regexJs2 = /const category = data\.category \|\| 'coding';/;
const replacementJs2 = `const category = data.category || 'coding';
        currentCategory = category;
        
        const breakBtn = document.getElementById('breakBtn');
        
        if (category === 'break') {
          ambientGlow.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/20 rounded-full blur-[120px] transition-colors duration-1000 pointer-events-none";
          progressCircle.style.stroke = "#14b8a6"; 
          statusLabel.textContent = "ON BREAK";
          statusLabel.className = "mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-teal-300 z-10 transition-colors";
          activityDot.className = "w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]";
          activityText.textContent = "Break";
          breakBtn.textContent = "RESUME FOCUS";
          breakBtn.className = "px-6 py-2 rounded-full bg-teal-500/20 border border-teal-500/30 text-[10px] font-bold tracking-[0.2em] uppercase text-teal-300 transition-all active:scale-95 shadow-[0_0_15px_rgba(20,184,166,0.2)]";
        } else {
          breakBtn.textContent = "TAKE BREAK";
          breakBtn.className = "px-6 py-2 rounded-full glass-panel text-[10px] font-bold tracking-[0.2em] uppercase text-white transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/10";
`;

code = code.replace(regexJs2, replacementJs2);

const regexJs3 = /if \(category === 'coding'\) \{/;
const replacementJs3 = `} else if (category === 'coding') {`;

code = code.replace(regexJs3, replacementJs3);

fs.writeFileSync('C:/dev-cli/FocusCompanion/app/src/main/assets/companion.html', code);
console.log('Updated companion.html');
