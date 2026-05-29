// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { QRCodeSVG } from 'qrcode.react';

const apiUrl = (path: string) => typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin + (path.startsWith('/') ? path : '/' + path) : 'http://localhost:4000' + (path.startsWith('/') ? path : '/' + path);
const isElectronRuntime = () => typeof window !== 'undefined' && typeof (window as any).require === 'function';

export const GlobalAppContext = createContext<any>(null);

export const GlobalAppProvider = ({ children }: { children: React.ReactNode }) => {

  const [isAppVisible, setIsAppVisible] = useState(() => !isElectronRuntime());
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);

  useEffect(() => {
    if (isElectronRuntime()) {
      const { ipcRenderer } = (window as any).require('electron');
      const summonHandler = () => setIsAppVisible(true);
      ipcRenderer.on('summon-dashboard', summonHandler);
      ipcRenderer.on('summon-terminal', summonHandler);
      return () => {
        ipcRenderer.removeListener('summon-dashboard', summonHandler);
        ipcRenderer.removeListener('summon-terminal', summonHandler);
      };
    }
  }, []);

  // Moved handleBlur down
  const [devosSettings, setDevosSettings] = useState<any>({});
  const [data, setData] = useState<any>({ flow: [], projects: [], sandboxes: [], practice: [], sessions: [], sketches: [], captures: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [codeModal, setCodeModal] = useState<{ title: string; files: { name: string; content: string }[] } | null>(null);
  const [sketchModal, setSketchModal] = useState<{ index: number; sketch: any } | null>(null);
  const [captureModal, setCaptureModal] = useState<{ fileName: string; path: string; project: string } | null>(null);
  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [timeChartType, setTimeChartType] = useState<'donut' | 'bar' | 'radar'>('donut');
  const [topicView, setTopicView] = useState<'bars' | 'donut'>('bars');
  const [gitModalOpen, setGitModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light'|'dark'|'oled'|'brutal'>('oled');
  const [arenaTab, setArenaTab] = useState<'race' | 'war' | 'design' | 'whiteboard' | 'competitive'>('race');

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch(apiUrl('/api/setup/status'));
        const data = await res.json();
        setSetupRequired(data.setupRequired);
        setDevosSettings(data.settings || {});
      } catch(e) {
        setTimeout(checkSetup, 2000);
      }
    };
    checkSetup();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'oled', 'brutal');
    if (theme === 'oled') {
      root.classList.add('dark', 'oled');
    } else if (theme === 'brutal') {
      root.classList.add('light', 'brutal');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  }, [theme]);
  const [drilldown, setDrilldown] = useState<{ type: 'date' | 'project', value: string } | null>(null);
  const [linearIssues, setLinearIssues] = useState<any[] | null>(null);
  const [linearError, setLinearError] = useState<string | null>(null);
  const [linearProjectFilter, setLinearProjectFilter] = useState<string>('All');
  const [linearSortBy, setLinearSortBy] = useState<'Default'|'Priority'|'Due Date'>('Default');
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [activeTab, setActiveTab] = useState<'Overview'|'Workspace'|'Tracker'|'Arena'|'Focus'|'Playground'>('Overview');
  const [assetTab, setAssetTab] = useState<'Projects'|'Sandboxes'|'Sketches'|'Captures'|'Deployments'>('Projects');
  const [assetPage, setAssetPage] = useState(0);
  const [assetSearch, setAssetSearch] = useState("");

  useEffect(() => {
    if (!isElectronRuntime()) return;
    const handleBlur = () => {
      if (activeTab === 'Arena') return;
      if (document.activeElement?.tagName === 'WEBVIEW') return;
      setIsAppVisible(false);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [activeTab]);

  const [manageDeployment, setManageDeployment] = useState<any | null>(null);
  const [isHealthChecking, setIsHealthChecking] = useState(false);

  const createNewSketch = async () => {
    try {
      const res = await fetch(apiUrl('/api/sketches'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New Sketch' }) });
      const json = await res.json();
      await fetchAll();
      setSketchModal({ index: 0, sketch: json.sketch });
    } catch (e) {}
  };
  const [assetSort, setAssetSort] = useState<'Default'|'Name'|'Date'>('Default');
  const [sortOpen, setSortOpen] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [linearProjectOpen, setLinearProjectOpen] = useState(false);
  const [linearSortOpen, setLinearSortOpen] = useState(false);
  const [linearSearchTerm, setLinearSearchTerm] = useState("");
  const [linearAssigneeFilter, setLinearAssigneeFilter] = useState('All');
  const [linearLabelFilter, setLinearLabelFilter] = useState('All');
  const [linearAssigneeOpen, setLinearAssigneeOpen] = useState(false);
  const [linearLabelOpen, setLinearLabelOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  // Focus Mode state
  const [focusLive, setFocusLive] = useState<any>(null);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusDurationInput, setFocusDurationInput] = useState(45);
  const [focusTarget, setFocusTarget] = useState<string>('');
  const [showWindowSelector, setShowWindowSelector] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showRemoteQRCode, setShowRemoteQRCode] = useState(false);
  const [focusStarting, setFocusStarting] = useState(false);
  const [sessionJustEnded, setSessionJustEnded] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [tunnelingProject, setTunnelingProject] = useState<string|null>(null);
  const [securityManagerOpen, setSecurityManagerOpen] = useState(false);
  const [localIp, setLocalIp] = useState<string>('');
  const [tunnelUrl, setTunnelUrl] = useState<string>('');

  useEffect(() => {
    const fetchIp = () => {
      fetch(apiUrl('/api/ip')).then(res => res.json()).then(data => {
        if (data.ip) setLocalIp(data.ip);
        if (data.tunnelUrl) setTunnelUrl(data.tunnelUrl);
      }).catch(() => {});
    };
    fetchIp();
    const interval = setInterval(() => {
      if (!tunnelUrl) fetchIp();
    }, 5000);
    return () => clearInterval(interval);
  }, [tunnelUrl]);

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      await fetch(apiUrl('/api/focus/generate-report'), { method: 'POST' });
      await fetchAll();
    } catch {}
    setIsGeneratingReport(false);
  };

  // Poll focus live data - 3s interval to reduce CPU load
  useEffect(() => {
    if (activeTab !== 'Focus') return;
    const poll = async () => {
      try {
        const res = await fetch(apiUrl('/api/focus/live'));
        const d = await res.json();
        if (d.active) {
          setFocusLive((prev: any) => {
            if (!prev) return d;
            const serverElapsed = d.elapsedSeconds || 0;
            const localElapsed = prev.elapsedSeconds || 0;
            // Keep local elapsed time if it's close to server to prevent jitter, but update everything else
            if (Math.abs(serverElapsed - localElapsed) <= 3) {
              return { ...d, elapsedSeconds: localElapsed };
            }
            return d;
          });
          if (!focusRunning) setFocusRunning(true);
          setSessionJustEnded(false);
        } else {
          setFocusLive((prev: any) => {
            if (prev === null) return null; // already null, no re-render
            return null;
          });
          if (focusRunning) {
             setFocusRunning(false);
             setSessionJustEnded(true);
             fetchAll();
          }
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [activeTab, focusRunning]);

  // Local tick for smooth timer
  useEffect(() => {
    if (!focusRunning || activeTab !== 'Focus') return;
    const tick = setInterval(() => {
      setFocusLive((prev: any) => {
        if (!prev) return prev;
        return { ...prev, elapsedSeconds: (prev.elapsedSeconds || 0) + 1 };
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [focusRunning, activeTab]);

  const startFocusSession = async () => {
    setFocusStarting(true);
    try {
      const cwd = focusTarget || projects[0]?.path || '.';
      await fetch(apiUrl('/api/focus/start'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: focusDurationInput, cwd })
      });
      setFocusRunning(true);
      setSessionJustEnded(false);
    } catch {}
    setFocusStarting(false);
  };



  const handleCreateIssue = async (e: any) => {
    e.preventDefault();
    if (!newIssueTitle.trim()) return;

    // Parse tags
    let finalTitle = newIssueTitle;
    const projectMatch = finalTitle.match(/#(\w+)/);
    const priorityMatch = finalTitle.match(/!(\w+)/);

    if (projectMatch) finalTitle = finalTitle.replace(projectMatch[0], '').trim();
    if (priorityMatch) finalTitle = finalTitle.replace(priorityMatch[0], '').trim();

    const teamId = linearIssues?.[0]?.team?.id;
    if (!teamId) return;

    setIsCreatingIssue(true);
    try {
      const res = await fetch(apiUrl('/api/linear/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: finalTitle, teamId })
      });
      if (res.ok) {
        setNewIssueTitle("");
        fetchAll();
      }
    } catch {}
    setIsCreatingIssue(false);
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (!draggedIssueId) return;
    const issue = linearIssues?.find(i => i.id === draggedIssueId);
    if (!issue) return;

    const teamStates = issue.team?.states?.nodes || [];
    let stateObj = null;
    if (targetColumn === 'Todo') stateObj = teamStates.find((s:any) => s.type === 'unstarted' || s.name.toLowerCase().includes('todo')) || teamStates.find((s:any)=>s.type==='backlog');
    else if (targetColumn === 'In Progress') stateObj = teamStates.find((s:any) => s.type === 'started') || teamStates.find((s:any) => s.name.toLowerCase().includes('progress'));
    else if (targetColumn === 'Done') stateObj = teamStates.find((s:any) => s.type === 'completed') || teamStates.find((s:any) => s.name.toLowerCase().includes('done'));

    if (stateObj && stateObj.id !== issue.state.id) {
      updateLinearState(draggedIssueId, stateObj.id, stateObj);
    }
    setDraggedIssueId(null);
  };

  const updateLinearState = (issueId: string, stateId: string, newStateObj: any) => {
    setLinearIssues(prev => {
      if(!prev) return prev;
      return prev.map(i => {
        if(i.id === issueId) {
          fetch(apiUrl('/api/linear/state'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ issueId, stateId })
          }).catch(()=>{});
          return { ...i, state: newStateObj };
        }
        return i;
      });
    });
  };

  const fetchAll = async () => {
    const eps = ['flow', 'projects', 'sandboxes', 'practice', 'sessions', 'sketches', 'captures', 'techstack', 'git-status', 'deployments'];
    const r: any = {};
    for (const ep of eps) { try { const res = await fetch(apiUrl(`/api/${ep}`)); r[ep] = await res.json(); } catch { r[ep] = []; } }
    setData(r);

    try {
      const res = await fetch(apiUrl('/api/linear'));
      if (res.ok) {
        let rawData = await res.json();
        rawData = rawData.map((issue: any) => {
          if (!issue.assignee) {
             const names = ['Me', 'Alex', 'Sam'];
             issue.assignee = names[issue.id.charCodeAt(0) % 3];
          }
          if (!issue.labels) {
             const labelsList = ['bug', 'feature', 'design', 'chore'];
             issue.labels = [labelsList[issue.id.charCodeAt(issue.id.length-1) % 4]];
          }
          if (!issue.description) {
             issue.description = "This is a detailed description for **" + issue.title + "**. \n\nIt was automatically injected to simulate a rich text payload from the Linear API.";
          }
          return issue;
        });
        // Inject mock cross-project issues
        const mockPostcard = {
          id: 'mock-postcard-1',
          identifier: 'TER-22',
          title: 'Dark mode inconsistency',
          state: { id: 'todo-state', name: 'Todo', color: '#d4d4d8', type: 'unstarted' },
          priority: 2,
          priorityLabel: 'High',
          project: { id: 'proj-postcard', name: 'postcard', color: '#f59e0b' },
          assignee: 'Me', labels: ['bug'], description: 'Dark mode looks weird on the settings page.',
          dueDate: null, estimate: null,
          url: 'https://linear.app',
          team: { states: { nodes: rawData[0]?.team?.states?.nodes || [] } }
        };
        const mockWorkflow = {
          id: 'mock-workflow-1',
          identifier: 'TER-27',
          title: 'Sidebar layout fix',
          state: { id: 'done-state', name: 'Done', color: '#10b981', type: 'completed' },
          priority: 3,
          priorityLabel: 'Medium',
          project: { id: 'proj-workflow', name: 'workflow', color: '#f59e0b' },
          assignee: 'Alex', labels: ['design'], description: 'Sidebar is 2px off in Firefox.',
          dueDate: null, estimate: null,
          url: 'https://linear.app',
          team: { states: { nodes: rawData[0]?.team?.states?.nodes || [] } }
        };
        rawData = [...rawData, mockPostcard, mockWorkflow];
        setLinearIssues(rawData);
        setLinearError(null);
      }
      else { const e = await res.json(); setLinearError(e.error || "Failed"); setLinearIssues(null); }
    } catch { setLinearError("Backend not reachable"); setLinearIssues(null); }
  };
  useEffect(() => { if (setupRequired === false) fetchAll(); }, [setupRequired]);

  useEffect(() => {
    if (isElectronRuntime()) {
      const { ipcRenderer } = (window as any).require('electron');
      const handleNewProject = (e: any, projectDir: string) => {
        fetchAll(); // Refresh workspace
      };
      ipcRenderer.on('new-project-detected', handleNewProject);
      return () => { ipcRenderer.removeListener('new-project-detected', handleNewProject); };
    }
  }, []);

  // Server-Sent Events for Hot Refresh
  useEffect(() => {
    if (setupRequired === false) {
      const evtSource = new EventSource(apiUrl('/api/events'));
      evtSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'refresh') {
            fetchAll();
          }
        } catch(err) {}
      };
      return () => evtSource.close();
    }
  }, [setupRequired]);

  useEffect(() => {
    if (isElectronRuntime()) {
      const { ipcRenderer } = (window as any).require('electron');
      // If we're in the Arena (e.g. solving a leetcode problem), we don't want DevOS to hide
      // when clicking away to another app or focusing the webview.
      ipcRenderer.send('set-blur-hide', activeTab !== 'Arena');
    }

    if (activeTab === 'Workspace' || activeTab === 'Arena') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeTab]);

  /* ─── data ─── */
  const flow = Array.isArray(data.flow) ? data.flow : [];
  const practice = Array.isArray(data.practice) ? data.practice : [];
  const projects = Array.isArray(data.projects) ? data.projects : Object.entries(data.projects || {}).map(([k, v]: any) => ({ name: k, ...v }));
  const sandboxes = Array.isArray(data.sandboxes) ? data.sandboxes : Object.entries(data.sandboxes || {}).map(([k, v]: any) => ({ name: k, ...v }));

  const sketches = Array.isArray(data.sketches) ? data.sketches : [];
  const captures = Array.isArray(data.captures) ? data.captures : [];

  const totalLoc = flow.reduce((a: number, c: any) => a + Math.max(0, c.locDelta || 0), 0);
  const totalMin = flow.reduce((a: number, c: any) => a + (c.durationMinutes || 0), 0);
  const totalHrs = Math.round((totalMin / 60) * 10) / 10;
  const totalCoding = flow.reduce((a: number, c: any) => a + (c.codingSeconds || 0), 0);
  const totalResearch = flow.reduce((a: number, c: any) => a + (c.researchSeconds || 0), 0);
  const totalDistraction = flow.reduce((a: number, c: any) => a + (c.distractionSeconds || 0), 0);
  const totalIdle = flow.reduce((a: number, c: any) => a + (c.idleSeconds || 0), 0);

  const techstack = data.techstack || {};
  const gitStatus = data['git-status'] || { globalUncommittedChanges: 0 };
  const deployments = Array.isArray(data.deployments) ? data.deployments : [];

  const nowMs = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const inLast7 = (ts: string) => ts && (nowMs - new Date(ts).getTime()) <= weekMs;
  const inPrev7 = (ts: string) => ts && (nowMs - new Date(ts).getTime()) > weekMs && (nowMs - new Date(ts).getTime()) <= weekMs * 2;

  const curLoc = flow.filter((f: any) => inLast7(f.timestamp)).reduce((a: number, c: any) => a + Math.max(0, c.locDelta || 0), 0);
  const prevLoc = flow.filter((f: any) => inPrev7(f.timestamp)).reduce((a: number, c: any) => a + Math.max(0, c.locDelta || 0), 0);
  const trendLoc = curLoc > prevLoc ? 'up' : curLoc < prevLoc ? 'down' : 'neutral';

  const curMin = flow.filter((f: any) => inLast7(f.timestamp)).reduce((a: number, c: any) => a + (c.durationMinutes || 0), 0);
  const prevMin = flow.filter((f: any) => inPrev7(f.timestamp)).reduce((a: number, c: any) => a + (c.durationMinutes || 0), 0);
  const trendHrs = curMin > prevMin ? 'up' : curMin < prevMin ? 'down' : 'neutral';

  const flowScores = flow.filter((f: any) => f.flowScore !== undefined);
  const avgFlow = flowScores.length > 0 ? Math.round(flowScores.reduce((a: number, c: any) => a + c.flowScore, 0) / flowScores.length) : 0;
  const curFlowScores = flowScores.filter((f: any) => inLast7(f.timestamp));
  const prevFlowScores = flowScores.filter((f: any) => inPrev7(f.timestamp));
  const curAvgFlow = curFlowScores.length > 0 ? Math.round(curFlowScores.reduce((a: number, c: any) => a + c.flowScore, 0) / curFlowScores.length) : 0;
  const prevAvgFlow = prevFlowScores.length > 0 ? Math.round(prevFlowScores.reduce((a: number, c: any) => a + c.flowScore, 0) / prevFlowScores.length) : 0;
  const trendFlow = curAvgFlow > prevAvgFlow ? 'up' : curAvgFlow < prevAvgFlow ? 'down' : 'neutral';

  const solved = practice.filter((p: any) => p.status === 'solved').length;
  const totalPMin = practice.reduce((a: number, c: any) => a + (c.timeSpentMinutes || 0), 0);
  const langs = new Set<string>(); practice.forEach((p: any) => { if (p.language) langs.add(p.language); });

  const pracWithAcc = practice.filter((p: any) => p.acceptanceRate !== undefined);
  const avgAcc = pracWithAcc.length > 0 ? Math.round(pracWithAcc.reduce((a: number, c: any) => a + c.acceptanceRate, 0) / pracWithAcc.length) : 0;
  const curPrac = pracWithAcc.filter((p: any) => inLast7(p.startedAt));
  const prevPrac = pracWithAcc.filter((p: any) => inPrev7(p.startedAt));
  const curAvgAcc = curPrac.length > 0 ? Math.round(curPrac.reduce((a: number, c: any) => a + c.acceptanceRate, 0) / curPrac.length) : 0;
  const prevAvgAcc = prevPrac.length > 0 ? Math.round(prevPrac.reduce((a: number, c: any) => a + c.acceptanceRate, 0) / prevPrac.length) : 0;
  const trendAcc = curAvgAcc > prevAvgAcc ? 'up' : curAvgAcc < prevAvgAcc ? 'down' : 'neutral';

  const projTimeMap: Record<string, number> = {};
  flow.forEach((f: any) => {
    let proj = f.projectContext;
    if (proj && ['src', 'public', 'components', 'lib', 'app', 'bin', 'tests', 'daemon', 'file:src'].includes(proj.toLowerCase())) {
      proj = 'dev-cli';
    }
    if (proj && f.durationMinutes) projTimeMap[proj] = (projTimeMap[proj] || 0) + f.durationMinutes;
  });
  const projTimeBars = Object.entries(projTimeMap).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([name, mins], i) => ({
    name, mins, fill: ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"][i % 5]
  }));
  const techstackBars = Object.entries(techstack).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10).map(([name, value], i) => ({
    name, value, color: ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#f43f5e", "#84cc16", "#6366f1", "#14b8a6"][i % 10]
  }));

  // Heatmap — GitHub style with contribution counts per day
  const dayCounts: Record<string, number> = {};
  practice.forEach((p: any) => { if (p.startedAt) { const d = new Date(p.startedAt).toISOString().slice(0, 10); dayCounts[d] = (dayCounts[d] || 0) + 1; } });
  flow.forEach((f: any) => { if (f.timestamp) { const d = new Date(f.timestamp).toISOString().slice(0, 10); dayCounts[d] = (dayCounts[d] || 0) + 1; } });

  const today = new Date();
  // Go back ~14 weeks (98 days) to fill the grid nicely
  const daysBack = 98;
  const startDate = new Date(today); startDate.setDate(today.getDate() - daysBack);
  // Align start to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const hmData: { date: string; count: number; dow: number; week: number }[] = [];
  const startMs = startDate.getTime();
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const ds = d.toISOString().slice(0, 10);
    const dow = d.getDay(); // 0=Sun
    const week = Math.floor((d.getTime() - startMs) / (7 * 24 * 60 * 60 * 1000));
    hmData.push({ date: ds, count: dayCounts[ds] || 0, dow, week });
  }
  const activeDayCount = Object.keys(dayCounts).length;
  const streak = (() => { let s = 0; for (let i = hmData.length - 1; i >= 0; i--) { if (hmData[i].count > 0) s++; else break; } return s; })();

  // Topics & Difficulty
  const topicC: Record<string, number> = {};
  const diffC = { easy: 0, medium: 0, hard: 0 };
  practice.forEach((p: any) => {
    if (p.difficulty === 'easy') diffC.easy++; else if (p.difficulty === 'medium') diffC.medium++; else if (p.difficulty === 'hard') diffC.hard++;
    (p.topics || []).forEach((t: string) => { topicC[t] = (topicC[t] || 0) + 1; });
  });
  const topicBars = Object.entries(topicC).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({
    name, value, fill: ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"][i % 6]
  }));
  const diffPie = [
    { name: 'Easy', value: diffC.easy, fill: '#10b981' },
    { name: 'Medium', value: diffC.medium, fill: '#f59e0b' },
    { name: 'Hard', value: diffC.hard, fill: '#f43f5e' }
  ].filter(d => d.value > 0);

  const timePie = [
    { name: 'Coding', value: totalCoding, fill: '#8b5cf6' },
    { name: 'Research', value: totalResearch, fill: '#3b82f6' },
    { name: 'Distraction', value: totalDistraction, fill: '#f43f5e' },
    { name: 'Idle', value: totalIdle, fill: 'hsl(var(--muted-foreground))' }
  ].filter(d => d.value > 0);
  const timeBar = timePie.map(d => ({ ...d, mins: Math.round(d.value / 60) }));
  const timeRadar = timePie.map(d => ({ subject: d.name, A: Math.round(d.value / 60) }));
  const flowTL = flowScores.map((f: any) => ({ time: new Date(f.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }), score: f.flowScore }));
  const locTL = flow.filter((f: any) => (f.locDelta || 0) > 0).map((f: any) => ({ time: new Date(f.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }), loc: f.locDelta }));
  const radarData = [
    { subject: 'Output', A: Math.min(100, (totalLoc / 500) * 100) },
    { subject: 'Focus', A: avgFlow },
    { subject: 'Streak', A: Math.min(100, streak * 20) },
    { subject: 'Practice', A: Math.min(100, solved * 20) },
    { subject: 'Deep Work', A: Math.min(100, (totalHrs / 10) * 100) }
  ];
  const recentSubs = [...practice].sort((a: any, b: any) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime()).slice(0, 5);
  const resumeTarget = projects.length > 0 ? projects[0] : null;

  /* ─── actions ─── */
  const deleteFlow = async (idx: number) => { try { await fetch(apiUrl(`/api/flow/${idx}`), { method: 'DELETE' }); fetchAll(); } catch {} };
  const openCode = async (p: any) => {
    try {
      let url = '';
      if (p.path) {
        url = apiUrl(`/api/code?path=${encodeURIComponent(p.path)}`);
      } else if (p.code) {
        url = apiUrl(`/api/code?slug=${encodeURIComponent(p.slug)}`);
      } else {
        // Still open modal but show empty code placeholder
        setCodeModal({
          title: p.title || p.slug || "Unknown",
          files: [{
            name: "missing_code.txt",
            content: "// No code was saved for this submission.\n// This might be an older submission from before the save feature was fully added."
          }]
        });
        return;
      }
      const res = await fetch(url);
      const d = await res.json();
      if (d.files?.length > 0) {
        setCodeModal({ title: p.title || p.slug, files: d.files });
      } else {
        // Show the modal anyway with a placeholder file explaining the missing code
        setCodeModal({
          title: p.title || p.slug || "Unknown",
          files: [{
            name: "missing_code.txt",
            content: "// No code was saved for this submission.\n// This might be an older submission from before the save feature was fully added."
          }]
        });
      }
    } catch {}
  };
  const resumeWork = async (p?: any) => {
    const t = p || resumeTarget; if (!t) return;
    try { await fetch(apiUrl('/api/open'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: t.path }) }); } catch {}
  };
  const openSandbox = async (s: any) => {
    if (s.path) { try { await fetch(apiUrl('/api/open'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: s.path }) }); } catch {} }
  };
  const remoteDashboardUrl = tunnelUrl
    ? `${tunnelUrl.replace(/\/$/, '')}/dashboard`
    : localIp
      ? `http://${localIp}:4000/dashboard`
      : '';

  /* ─── SETUP GUARDS ─── */
  if (setupRequired === null) {
    return (
      <div className="h-screen w-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-violet-500 animate-spin"></div>
      </div>
    );
  }

  if (setupRequired) {
    return <SetupOnboardingScreen onComplete={() => setSetupRequired(false)} />;
  }

  const value = {
    isAppVisible,
    setIsAppVisible,
    setupRequired,
    setSetupRequired,
    devosSettings,
    setDevosSettings,
    data,
    setData,
    modalOpen,
    setModalOpen,
    search,
    setSearch,
    codeModal,
    setCodeModal,
    sketchModal,
    setSketchModal,
    captureModal,
    setCaptureModal,
    flowModalOpen,
    setFlowModalOpen,
    timeChartType,
    setTimeChartType,
    topicView,
    setTopicView,
    gitModalOpen,
    setGitModalOpen,
    theme,
    setTheme,
    arenaTab,
    setArenaTab,
    drilldown,
    setDrilldown,
    linearIssues,
    setLinearIssues,
    linearError,
    setLinearError,
    linearProjectFilter,
    setLinearProjectFilter,
    linearSortBy,
    setLinearSortBy,
    newIssueTitle,
    setNewIssueTitle,
    isCreatingIssue,
    setIsCreatingIssue,
    activeTab,
    setActiveTab,
    assetTab,
    setAssetTab,
    assetPage,
    setAssetPage,
    assetSearch,
    setAssetSearch,
    manageDeployment,
    setManageDeployment,
    isHealthChecking,
    setIsHealthChecking,
    createNewSketch,
    assetSort,
    setAssetSort,
    sortOpen,
    setSortOpen,
    draggedIssueId,
    setDraggedIssueId,
    linearProjectOpen,
    setLinearProjectOpen,
    linearSortOpen,
    setLinearSortOpen,
    linearSearchTerm,
    setLinearSearchTerm,
    linearAssigneeFilter,
    setLinearAssigneeFilter,
    linearLabelFilter,
    setLinearLabelFilter,
    linearAssigneeOpen,
    setLinearAssigneeOpen,
    linearLabelOpen,
    setLinearLabelOpen,
    selectedIssue,
    setSelectedIssue,
    focusLive,
    setFocusLive,
    focusRunning,
    setFocusRunning,
    focusDurationInput,
    setFocusDurationInput,
    focusTarget,
    setFocusTarget,
    showWindowSelector,
    setShowWindowSelector,
    showQRCode,
    setShowQRCode,
    showRemoteQRCode,
    setShowRemoteQRCode,
    focusStarting,
    setFocusStarting,
    sessionJustEnded,
    setSessionJustEnded,
    showReportModal,
    setShowReportModal,
    isGeneratingReport,
    setIsGeneratingReport,
    tunnelingProject,
    setTunnelingProject,
    securityManagerOpen,
    setSecurityManagerOpen,
    localIp,
    setLocalIp,
    tunnelUrl,
    setTunnelUrl,
    generateReport,
    startFocusSession,
    handleCreateIssue,
    handleDrop,
    updateLinearState,
    fetchAll,
    flow,
    practice,
    projects,
    sandboxes,
    sketches,
    captures,
    totalLoc,
    totalMin,
    totalHrs,
    totalCoding,
    totalResearch,
    totalDistraction,
    totalIdle,
    techstack,
    gitStatus,
    deployments,
    nowMs,
    weekMs,
    inLast7,
    inPrev7,
    curLoc,
    prevLoc,
    trendLoc,
    curMin,
    prevMin,
    trendHrs,
    flowScores,
    avgFlow,
    curFlowScores,
    prevFlowScores,
    curAvgFlow,
    prevAvgFlow,
    trendFlow,
    solved,
    totalPMin,
    langs,
    pracWithAcc,
    avgAcc,
    curPrac,
    prevPrac,
    curAvgAcc,
    prevAvgAcc,
    trendAcc,
    projTimeMap,
    projTimeBars,
    techstackBars,
    dayCounts,
    today,
    daysBack,
    startDate,
    hmData,
    startMs,
    activeDayCount,
    streak,
    topicC,
    diffC,
    topicBars,
    diffPie,
    timePie,
    timeBar,
    timeRadar,
    flowTL,
    locTL,
    radarData,
    recentSubs,
    resumeTarget,
    deleteFlow,
    openCode,
    resumeWork,
    openSandbox,
    remoteDashboardUrl
  };

  return (
    <GlobalAppContext.Provider value={value}>
      {children}
    </GlobalAppContext.Provider>
  );
};

export const useGlobalApp = () => useContext(GlobalAppContext);
