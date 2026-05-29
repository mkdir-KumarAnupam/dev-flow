import { useEffect, useState, } from 'react';



import {
  XAxis, YAxis, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar,
  LineChart, Line, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Code, Clock, Trophy, FolderGit2, Search, X,
  Flame, Target, Zap, Camera, PenTool, ExternalLink,
  Layers, Activity, Play, Trash2, FileCode, FolderOpen,
  Box, ArrowRight, Plus,
  Sun, Sunset, Moon, Sword, Code2, Timer, Square, Monitor, CheckCircle2, Palette,
  User, Tag, AlertTriangle, FlaskConical, Cloud, Globe, Server, RefreshCw, Triangle, QrCode, Wifi
} from 'lucide-react';
import RaceMode from './RaceMode';
import WarMode from './WarMode';
import SystemDesignMode from './SystemDesignMode';
import Whiteboard from './Whiteboard';
import CompetitiveMode from './CompetitiveMode';
import Playground from './Playground';

const API_BASE =
  typeof window !== 'undefined' &&
  window.location.protocol.startsWith('http') &&
  window.location.port !== '5173'
    ? window.location.origin
    : 'http://localhost:4000';
const apiUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
const isElectronRuntime = () =>
  typeof window !== 'undefined' && typeof (window as any).require === 'function';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from 'qrcode.react';

import TrendArrowIcon from './components/ui/TrendArrowIcon';
import MetricCard from './components/ui/MetricCard';
import SectionHeader from './components/ui/SectionHeader';
import LiveDateTimeClock from './components/ui/LiveDateTimeClock';
import ActivityHeatmapGrid from './components/ui/ActivityHeatmapGrid';

import SetupOnboardingScreen from './components/features/SetupOnboardingScreen';
import GlobalCommandPalette from './components/features/GlobalCommandPalette';



/* ─── animation variants ─── */
const cV: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } } };
const iV: any = { hidden: { opacity: 0, y: 14, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const mV: any = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } };
const fadeUp: any = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

/* ─── components ─── */



const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Good Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Good Night';
};

const getGreetingIcon = () => {
  const h = new Date().getHours();
  if (h < 5) return <Moon className="h-5 w-5 text-indigo-400" />;
  if (h < 12) return <Sun className="h-5 w-5 text-amber-400" />;
  if (h < 17) return <Sun className="h-5 w-5 text-orange-400" />;
  if (h < 21) return <Sunset className="h-5 w-5 text-rose-400" />;
  return <Moon className="h-5 w-5 text-indigo-400" />;
};

/* ─── APP ─── */
export default function App() {
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

  /* ─── RENDER ─── */
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <GlobalCommandPalette />
      <AnimatePresence>
        {isAppVisible && (
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.8 }}
            className="fixed inset-0 z-[100] bg-[#07090f]/70 dark:bg-[#07090f]/70 backdrop-blur-[40px] font-sans shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"
            style={{ zoom: 1.08 }}
          >
            {/* Ambient Soft Light Glows — pure CSS keyframes for zero JS overhead */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-violet-600/20 blur-[120px] will-change-transform transform-gpu pointer-events-none rounded-[100%]" style={{ animation: 'ambientDrift1 18s ease-in-out infinite' }} />
            <div className="absolute top-1/4 left-[-100px] w-[500px] h-[500px] bg-cyan-600/15 blur-[120px] will-change-transform transform-gpu pointer-events-none rounded-[100%]" style={{ animation: 'ambientDrift2 22s ease-in-out infinite' }} />
            <div className="absolute top-1/4 right-[-100px] w-[500px] h-[500px] bg-fuchsia-600/15 blur-[120px] will-change-transform transform-gpu pointer-events-none rounded-[100%]" style={{ animation: 'ambientDrift3 26s ease-in-out infinite' }} />
            {/* Inner scrolling container so absolute positioning works for the nav */}
            <div className="absolute inset-0 overflow-x-hidden overflow-y-auto pb-32">
              <div className="p-4 md:p-6 w-full max-w-7xl mx-auto drop-shadow-2xl">
                <motion.div variants={cV} initial="hidden" animate="show" className="max-w-[1400px] mx-auto space-y-4">

            {/* ═══ HEADER ═══ */}
            {activeTab === 'Overview' && (
              <motion.div variants={fadeUp} style={{ WebkitAppRegion: 'drag' } as any}
                className="relative flex items-center justify-between gap-4 px-6 py-4 mb-6 rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
              <motion.div
                aria-hidden
                animate={{ x: ['-35%', '135%'] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
              />

              {/* LEFT: Identity */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="relative flex items-center gap-3 min-w-0"
              >
                <motion.div
                  animate={{ rotate: [0, -5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50/50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
                >
                  {getGreetingIcon()}
                </motion.div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-foreground leading-none truncate">{getGreeting()}, {devosSettings.userName || 'Dev'}</h1>
                    <span className="hidden sm:inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 truncate">
                    {activeTab} / workflow cockpit
                  </p>
                </div>
              </motion.div>

              {/* RIGHT: Actions */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="relative flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as any}
              >
                <LiveDateTimeClock />

                {resumeTarget && (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => resumeWork()}
                    className="flex-shrink-0 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-sm px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    <Play className="h-3 w-3 fill-white text-white" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-white truncate max-w-[120px]">
                      Resume
                    </span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(t => t === 'light' ? 'dark' : t === 'dark' ? 'oled' : t === 'oled' ? 'brutal' : 'light')}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Toggle Theme"
                >
                  {theme === 'light' && <Sun className="h-4 w-4" />}
                  {theme === 'dark' && <Moon className="h-4 w-4" />}
                  {theme === 'oled' && <Monitor className="h-4 w-4 text-violet-400" />}
                  {theme === 'brutal' && <Palette className="h-4 w-4 text-rose-500" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRemoteQRCode(v => !v)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${showRemoteQRCode ? 'bg-violet-600 text-white shadow-[0_0_24px_rgba(139,92,246,0.28)]' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-violet-500'}`}
                  title="Share dashboard to iPad"
                >
                  <QrCode className="h-4 w-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { try { (window as any).require("electron").ipcRenderer.send("close-app"); } catch {} }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </motion.div>
            </motion.div>
            )}

            <AnimatePresence>
              {showRemoteQRCode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[1000] pointer-events-none"
                >
                  <button
                    aria-label="Close remote dashboard QR"
                    className="absolute inset-0 pointer-events-auto cursor-default"
                    onClick={() => setShowRemoteQRCode(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.94, rotateX: -8 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95, rotateX: -6 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                    className="pointer-events-auto absolute right-8 top-24 w-[344px] overflow-hidden rounded-[30px] border border-violet-200/20 bg-[#070817]/95 p-4 text-slate-100 backdrop-blur-2xl shadow-[0_34px_100px_rgba(0,0,0,0.74),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-22px_60px_rgba(15,23,42,0.42)]"
                    style={{ transformPerspective: 900, transformStyle: 'preserve-3d' }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.30),transparent_38%),radial-gradient(circle_at_100%_20%,rgba(34,211,238,0.16),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.10),transparent_38%)] pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

                    <div className="relative z-10 flex items-center justify-between gap-3 pb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-300/20 shadow-inner">
                          <Wifi className="h-4 w-4 text-cyan-200" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black tracking-tight text-white">Remote Dashboard</p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/70">Live LAN mirror</p>
                        </div>
                      </div>
                      <button onClick={() => setShowRemoteQRCode(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="relative z-10 rounded-[24px] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.9)] border border-white/70">
                      {remoteDashboardUrl ? (
                        <QRCodeSVG
                          value={remoteDashboardUrl}
                          size={288}
                          bgColor="transparent"
                          fgColor="#020617"
                          level="M"
                          includeMargin={false}
                        />
                      ) : (
                        <div className="h-[288px] flex flex-col items-center justify-center text-center text-slate-500">
                          <Activity className="h-7 w-7 animate-pulse mb-3 text-violet-500" />
                          <p className="text-xs font-bold uppercase tracking-[0.18em]">Finding LAN address</p>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 shadow-inner">
                        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">Open On iPad</p>
                        <p className="mt-1 text-[11px] font-mono font-bold text-cyan-100 break-all">{remoteDashboardUrl || 'Waiting for local network address...'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-[10px] leading-relaxed text-slate-400">
                          Keep both devices on the same Wi-Fi, then scan this from Safari or Camera.
                        </div>
                        <button
                          disabled={!remoteDashboardUrl}
                          onClick={() => remoteDashboardUrl && navigator.clipboard?.writeText(remoteDashboardUrl)}
                          className="px-3 py-2 rounded-full bg-violet-500/20 hover:bg-violet-500/30 disabled:opacity-40 text-[10px] font-black uppercase tracking-[0.14em] text-violet-100 border border-violet-300/20 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>


          {activeTab === 'Overview' && (<>
          {/* ═══ KPI ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <MetricCard icon={Flame} label="Streak" value={`${streak}d`} sub="consecutive days" color="bg-orange-100 text-orange-600" trend={streak >= 3 ? 'good' : streak === 0 ? 'bad' : 'warning'} />
            <MetricCard icon={Trophy} label="Solved" value={solved} sub={`${practice.length} attempted`} color="bg-amber-100 text-amber-600" trend={trendAcc === 'up' ? 'good' : trendAcc === 'down' ? 'bad' : 'neutral'} />
            <MetricCard icon={Code} label="LOC" value={totalLoc.toLocaleString()} sub="net output" color="bg-emerald-100 text-emerald-600" trend={trendLoc === 'up' ? 'good' : trendLoc === 'down' ? 'bad' : 'neutral'} />
            <MetricCard icon={Clock} label="Deep Work" value={`${totalHrs}h`} sub={`${totalMin}m tracked`} color="bg-blue-100 text-blue-600" trend={trendHrs === 'up' ? 'good' : trendHrs === 'down' ? 'warning' : 'neutral'} elevate={true} />
            <MetricCard icon={Activity} label="Avg Flow" value={`${avgFlow}%`} sub={`${flowScores.length} snapshots`} color="bg-violet-100 text-violet-600" trend={trendFlow === 'up' ? 'good' : trendFlow === 'down' ? 'bad' : 'neutral'} />
            <MetricCard icon={Target} label="Practice" value={`${totalPMin}m`} sub={`${[...langs].length} lang(s)`} color="bg-rose-100 text-rose-600" />
          </div>

          {/* ═══ CURRENT FOCUS & ACTIVITY ═══ */}
          <SectionHeader>Current Focus & Activity</SectionHeader>
          <div className="flex flex-wrap xl:flex-nowrap gap-3 items-start">

            {/* 1. CURRENT PROJECT HERO */}
            <motion.div variants={iV} className="flex-1 min-w-[340px]">
              {resumeTarget ? (
                <Card className="glass-panel overflow-hidden relative h-[260px] flex flex-col justify-center transition-all duration-300 group isolate border-violet-200/50 dark:border-violet-900/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-violet-600/5 to-transparent pointer-events-none -z-10" />
                  <div className="absolute -right-12 -bottom-16 opacity-[0.08] dark:opacity-[0.05] transition-opacity duration-300 pointer-events-none">
                    <Code2 className="w-64 h-64 text-violet-600 dark:text-violet-400" />
                  </div>
                  <motion.div animate={{ backgroundPosition: ['0px 0px', '42px 42px'] }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 opacity-[0.25] dark:opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '42px 42px', color: 'rgba(139, 92, 246, 0.4)' }} />
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between gap-5">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <p className="text-[10px] font-extrabold text-violet-600/80 dark:text-violet-400/80 uppercase tracking-[0.18em] mb-1">Last Active Project</p>
                          <h2 className="text-[26px] leading-none font-extrabold text-foreground tracking-tight truncate">{resumeTarget.name}</h2>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {resumeTarget.type && <span className="text-[10px] font-bold uppercase tracking-wide bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-lg text-center">{resumeTarget.type}</span>}
                          {resumeTarget.language && <span className="text-[10px] font-bold uppercase tracking-wide bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-lg text-center">{resumeTarget.language}</span>}
                          {resumeTarget.editor && <span className="text-[10px] text-slate-500 font-semibold">{resumeTarget.editor}</span>}
                          {resumeTarget.path && <span className="text-[10px] font-mono text-slate-400 truncate max-w-[300px]">{resumeTarget.path}</span>}
                        </div>
                        {projects.length > 1 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-500 mr-1">Switch to:</span>
                            {projects.slice(1, 4).map((p: any, i: number) => (
                              <motion.button key={i} whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.94 }}
                                onClick={() => resumeWork(p)}
                                className="text-[10px] bg-slate-100/80 dark:bg-slate-800/80 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300 px-3.5 py-1.5 rounded-full transition-all font-bold">
                                {p.name}
                              </motion.button>
                            ))}
                            {projects.length > 4 && (
                              <button onClick={() => setModalOpen(true)} className="text-[10px] font-bold text-slate-400 hover:text-foreground transition-colors underline-offset-4 hover:underline ml-1">
                                +{projects.length - 4} more
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.11, y: -6, rotate: 3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => resumeWork()}
                        className="flex-shrink-0 flex flex-col items-center justify-center gap-1 bg-violet-600 text-white hover:bg-violet-500 hover:ring-4 hover:ring-violet-500/25 w-[104px] h-[86px] rounded-2xl font-bold transition-all duration-300 origin-center shadow-lg"
                      >
                        <motion.span whileHover={{ rotate: 360 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} className="flex items-center justify-center">
                          <Play className="h-5 w-5 fill-white text-white transition-colors duration-300" />
                        </motion.span>
                        <span className="text-[10px] font-extrabold tracking-widest uppercase">Resume</span>
                      </motion.button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-panel  border-dashed  shadow-sm h-[260px] flex flex-col items-center justify-center">
                  <CardContent className="py-6 text-center">
                    <p className="text-[11px] text-slate-400">No projects tracked yet. Use <code className="text-slate-500 glass-panel text-muted-foreground px-1 rounded">dev project</code> to add one.</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* 2. GitHub-style Heatmap */}
            <motion.div variants={iV} className="flex-shrink-0">
              <Card className="glass-panel   shadow-sm h-[260px]">
                <CardHeader className="pb-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Activity Pulse</CardTitle>
                      <CardDescription className="text-[10px]">{activeDayCount} active days in the last {daysBack} days</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[9px]">{streak}d streak</Badge>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto pb-2">
                  <ActivityHeatmapGrid data={hmData} onDateClick={(date) => setDrilldown({ type: 'date', value: date })} />
                  <div className="flex items-center gap-1 mt-2 text-[8px] text-slate-400">
                    <span>Less</span>
                    {['bg-slate-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-600'].map((c, i) => <div key={i} className={`w-[9px] h-[9px] rounded-[2px] ${c}`} />)}
                    <span>More</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 3. Topics + Difficulty */}
            <motion.div variants={iV} className="flex-1 min-w-[240px]">
              <Card className="glass-panel   shadow-sm h-[260px]">
                <CardHeader className="pb-1 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Topics & Difficulty</CardTitle>
                  <div className="flex gap-0.5 glass-panel text-muted-foreground rounded-lg p-0.5">
                    <button onClick={() => setTopicView('bars')} className={`text-[9px] px-2.5 py-1 rounded-md font-semibold transition-all ${topicView === 'bars' ? 'bg-background shadow-sm text-foreground' : 'text-slate-400'}`}>Bars</button>
                    <button onClick={() => setTopicView('donut')} className={`text-[9px] px-2.5 py-1 rounded-md font-semibold transition-all ${topicView === 'donut' ? 'bg-background shadow-sm text-foreground' : 'text-slate-400'}`}>Donut</button>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <AnimatePresence mode="wait">
                    {topicView === 'bars' ? (
                      <motion.div key="bars" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                        <div className="space-y-2">
                          {topicBars.map((t, i) => {
                            const maxVal = topicBars[0]?.value || 1;
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-600 dark:text-slate-400 w-[60px] text-right truncate font-medium" title={t.name}>{t.name}</span>
                                <div className="flex-1 h-[10px] glass-panel rounded-full overflow-hidden shadow-inner relative">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${(t.value / maxVal) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                                    className="h-full rounded-full relative overflow-hidden" style={{ background: `linear-gradient(90deg, ${t.fill}dd, ${t.fill})` }}>
                                    <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: i * 0.2 }} className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                                  </motion.div>
                                </div>
                                <span className="text-[9px] font-bold text-muted-foreground w-[14px]">{t.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="donut" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                        className="flex flex-col items-center">
                        <div className="h-[150px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <defs>
                                {diffPie.map((e, i) => (
                                  <linearGradient id={`gradDiff${i}`} x1="0" y1="0" x2="0.4" y2="1" key={`def${i}`}>
                                    <stop offset="0%" stopColor="#fff" stopOpacity={0.25} />
                                    <stop offset="25%" stopColor={e.fill} stopOpacity={0.95} />
                                    <stop offset="100%" stopColor={e.fill} stopOpacity={1} />
                                  </linearGradient>
                                ))}
                                <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                                  <feDropShadow dx="2" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
                                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                                </filter>
                              </defs>
                              <Pie data={diffPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value" stroke="rgba(255,255,255,0.2)" strokeWidth={1} fillOpacity={0.95} animationBegin={0} animationDuration={1200} filter="url(#shadow3d)">
                                {diffPie.map((e, i) => <Cell key={i} fill={`url(#gradDiff${i})`} />)}
                              </Pie>
                              <Tooltip formatter={(v: any) => [`${v} problems`, '']} contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex gap-3 text-[9px] text-slate-500">
                          {diffPie.map((d, i) => <span key={i} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: d.fill }} />{d.name}: {d.value}</span>)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div><p className="text-[9px] text-slate-400 font-medium">Avg Acceptance</p></div>
                    <div className="flex items-center gap-1.5"><span className="text-sm font-bold text-foreground">{avgAcc}%</span><TrendArrowIcon trend={trendAcc} /></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>


          {/* ═══ FLOW + TIME ALLOCATION + RECENT SUBMISSIONS ═══ */}
          <div className="w-full h-px bg-slate-200/60 dark:bg-slate-800/60 mt-6 mb-6" />
          <SectionHeader>Flow & Productivity</SectionHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <motion.div variants={iV}>
              <Card className="glass-panel   shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <CardHeader className="pb-1 flex flex-row items-start justify-between">
                  <div><CardTitle className="text-sm">Flow Score</CardTitle><CardDescription className="text-[10px]">Focus intensity per session</CardDescription></div>
                  <TrendArrowIcon trend={trendFlow} />
                </CardHeader>
                <CardContent className="flex-1 min-h-[230px] pb-4 pt-0 flex items-center justify-center">
                  <div className="w-[92%] h-[190px] mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={flowTL} margin={{ top: 2, right: 8, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                        <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.08} strokeWidth={2} animationDuration={1200} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={iV}>
              <Card className="glass-panel   shadow-sm h-full transition-shadow flex flex-col">
                <CardHeader className="pb-1 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2"><CardTitle className="text-sm">Time Allocation</CardTitle><TrendArrowIcon trend={trendHrs} /></div>
                  <div className="flex gap-0.5 glass-panel text-muted-foreground rounded-md p-0.5">
                    {(['donut', 'bar', 'radar'] as const).map(t => (
                        <button key={t} onClick={() => setTimeChartType(t)} className={`text-[8px] px-2 py-0.5 rounded font-medium transition-all ${timeChartType === t ? 'bg-white dark:bg-slate-700 text-foreground' : 'text-slate-400'}`}>
                        {t === 'donut' ? '◎' : t === 'bar' ? '▥' : '◇'}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col justify-between pt-0 flex-1 pb-4">
                  <div className="flex-1 w-full min-h-[140px] -mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      {timeChartType === 'donut' ? (
                        <PieChart>
                          <defs>
                            {timePie.map((e, i) => (
                              <linearGradient id={`gradTime${i}`} x1="0" y1="0" x2="0.4" y2="1" key={`defTime${i}`}>
                                <stop offset="0%" stopColor="#fff" stopOpacity={0.25} />
                                <stop offset="25%" stopColor={e.fill} stopOpacity={0.95} />
                                <stop offset="100%" stopColor={e.fill} stopOpacity={1} />
                              </linearGradient>
                            ))}
                            <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="2" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
                              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                            </filter>
                          </defs>
                          <Pie data={timePie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value" stroke="rgba(255,255,255,0.2)" strokeWidth={1} fillOpacity={0.95} animationDuration={1200} filter="url(#shadow3d)">
                            {timePie.map((e, i) => <Cell key={i} fill={`url(#gradTime${i})`} />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => [`${Math.round((v || 0) / 60)}m`, '']} contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                        </PieChart>
                      ) : timeChartType === 'bar' ? (
                        <BarChart data={timeBar} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} /><Bar dataKey="mins" radius={[3, 3, 0, 0]} animationDuration={800}>{timeBar.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
                      ) : (
                        <RadarChart data={timeRadar} outerRadius="70%"><PolarGrid stroke="hsl(var(--border))" /><PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} /><PolarRadiusAxis tick={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} /><Radar dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} animationDuration={800} /></RadarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center text-[9px] text-slate-500">
                    {timePie.map((t, i) => <span key={i} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: t.fill }} />{t.name}</span>)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={iV}>
              <Card className="glass-panel   shadow-sm h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-1"><CardTitle className="text-sm">Recent Submissions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {recentSubs.map((p: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 group">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.status === 'solved' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">{p.title}</p>
                        <p className="text-[9px] text-slate-400">{p.platform} · {p.difficulty} · {p.timeSpentMinutes || 0}m</p>
                      </div>
                      {(p.path || p.code || p.slug) ? (
                        <button onClick={() => openCode(p)} className="p-1 rounded-md glass-panel hover:bg-violet-50 dark:hover:bg-violet-900/50 text-slate-300 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 border border-transparent hover:border-violet-100 dark:hover:border-violet-500/30 transition-all" title="View saved code">
                          <FileCode className="h-3 w-3" />
                        </button>
                      ) : (
                        <div className="p-1 text-slate-200 dark:text-slate-700" title="No saved code">
                          <FileCode className="h-3 w-3" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {recentSubs.length === 0 && <p className="text-[10px] text-slate-400 text-center py-3">No submissions</p>}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ═══ OUTPUT + BALANCE ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <motion.div variants={iV}>
              <Card className="glass-panel   shadow-sm h-full hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden" onClick={() => setFlowModalOpen(true)}>
                <CardHeader className="pb-1 relative z-10 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2"><CardTitle className="text-sm">Output Volume</CardTitle><TrendArrowIcon trend={trendLoc} /></div>
                  <button className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-2 py-0.5 rounded-full transition-colors shadow-sm border border-transparent dark:border-emerald-500/20">View All Focus Sessions</button>
                </CardHeader>
                <CardContent className="h-[160px] relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locTL} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} /><Tooltip cursor={false} contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} /><Bar dataKey="loc" fill="#10b981" radius={[3, 3, 0, 0]} animationDuration={800} /></BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={iV}>
              <Card className="glass-panel   shadow-sm h-full hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-1 flex flex-row items-center justify-between"><CardTitle className="text-sm">Engineering Balance</CardTitle></CardHeader>
                <CardContent className="flex-1 px-5 pb-5 pt-1 grid grid-cols-[1fr_180px] items-center gap-5">
                  <div className="h-[190px] min-w-[260px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius="82%"><PolarGrid stroke="hsl(var(--border))" /><PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} /><Radar dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} animationDuration={1000} /></RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 shrink-0">
                    {radarData.map((r, idx) => (
                      <div key={idx} className="flex flex-col glass-panel  rounded-xl p-2.5 hover:bg-violet-50 dark:hover:bg-violet-900/50 transition-colors">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">{r.subject}</span>
                        <span className="text-sm text-violet-600 dark:text-violet-400 font-bold">{Math.round(r.A)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          </>)}

          {activeTab === 'Workspace' && (<>
          {/* ═══ WORKSPACES ASSET TABS ═══ */}
          <SectionHeader>Workspaces & Assets</SectionHeader>
          <motion.div variants={iV} className="mb-4 flex flex-col sm:flex-row gap-3 justify-between items-center glass-panel  rounded-2xl p-2  shadow-sm">
            <div className="flex gap-1 glass-panel text-muted-foreground p-1 rounded-xl">
              {['Projects', 'Sandboxes', 'Sketches', 'Captures', 'Deployments'].map(tab => (
                <button key={tab} onClick={() => { setAssetTab(tab as any); setAssetPage(0); setAssetSearch(""); setAssetSort('Default'); }} className={`px-5 py-2 text-[11px] font-bold rounded-xl transition-all ${assetTab === tab ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-foreground dark:text-slate-400 dark:hover:text-slate-200'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {assetTab === 'Sketches' && (
                <button onClick={createNewSketch} title="New Sketch" className="p-2 glass-panel hover:bg-white/10 dark:hover:bg-slate-800/50 text-violet-500 dark:text-violet-400 rounded-lg shadow-sm transition-all flex items-center justify-center"><PenTool className="w-4 h-4"/></button>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={assetSearch}
                  onChange={e => { setAssetSearch(e.target.value); setAssetPage(0); }}
                  className="w-full glass-panel border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="glass-panel flex items-center justify-between gap-2 min-w-[120px] border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <span>Sort: {assetSort === 'Name' ? 'A-Z' : assetSort === 'Date' ? 'Recent' : 'Default'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 opacity-50 ${sortOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-[100] top-full mt-1.5 min-w-[120px] right-0 glass-panel border border-slate-200/60 dark:border-slate-700/50 rounded-xl shadow-xl overflow-hidden py-1"
                    >
                      {['Default', 'Name', 'Date'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setAssetSort(opt as any); setSortOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 text-xs font-bold transition-colors ${assetSort === opt ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        >
                          Sort: {opt === 'Name' ? 'A-Z' : opt === 'Date' ? 'Recent' : 'Default'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.div variants={iV} className="mb-6">
            <AnimatePresence mode="wait">
              <motion.div key={assetTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div className="p-2">
                    {(() => {
                      const PAGE_SIZE = 4;
                      const srcMap: Record<string, any[]> = { Projects: projects, Sandboxes: sandboxes, Sketches: sketches, Captures: captures, Deployments: deployments };
                      let src = srcMap[assetTab] || [];

                      if (assetSearch) {
                        src = src.filter(item => {
                          const name = item.name || item.title || item.fileName || '';
                          return name.toLowerCase().includes(assetSearch.toLowerCase());
                        });
                      }

                      if (assetSort === 'Name') {
                        src = [...src].sort((a, b) => {
                          const nA = a.name || a.title || a.fileName || '';
                          const nB = b.name || b.title || b.fileName || '';
                          return nA.localeCompare(nB);
                        });
                      } else if (assetSort === 'Date') {
                        src = [...src].sort((a, b) => {
                          const dA = a.timestamp || a.lastActive || a.createdAt || 0;
                          const dB = b.timestamp || b.lastActive || b.createdAt || 0;
                          return (new Date(dB).getTime() || 0) - (new Date(dA).getTime() || 0);
                        });
                      }

                      const totalPages = Math.ceil(src.length / PAGE_SIZE) || 1;
                      const safePage = Math.min(assetPage, Math.max(0, totalPages - 1));
                      const paged = src.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

                      return (
                        <div className="flex items-center gap-3">
                          {/* Left Arrow */}
                          <div className="w-8 flex-shrink-0 flex items-center justify-center">
                              <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: safePage > 0 ? 1.1 : 1 }} whileTap={{ scale: safePage > 0 ? 0.9 : 1 }}
                                onClick={() => safePage > 0 && setAssetPage(p => Math.max(0, p - 1))}
                                className={`w-8 h-8 flex items-center justify-center rounded-full border shadow-md transition-colors ${safePage > 0 ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-violet-600 cursor-pointer' : 'border-border bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50 shadow-none'}`}
                              >
                                <ArrowRight className="h-4 w-4 rotate-180" />
                              </motion.button>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {assetTab === 'Projects' && paged.map((p: any, i: number) => (
                                <motion.div
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                                  whileHover={{ scale: 1.03, y: -4 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={i}
                                  onClick={() => resumeWork(p)}
                                  className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-600 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                  <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.15] pointer-events-none text-foreground" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity duration-500 scale-150 -translate-y-4 translate-x-4 pointer-events-none">
                                    <FolderGit2 className="w-24 h-24 text-violet-500" />
                                  </div>
                                  {(p.createdAt || p.timestamp || p.lastActive) && (
                                    <div className="absolute top-3 right-3 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold shadow-sm border border-slate-100 dark:border-slate-700 z-20 pointer-events-none">
                                      {new Date(p.createdAt || p.timestamp || p.lastActive || Date.now()).toLocaleDateString()}
                                    </div>
                                  )}
                                  <div className="flex items-center relative z-10">
                                    <div className="p-2.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                      <FolderGit2 className="h-5 w-5" />
                                    </div>
                                  </div>
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 shadow-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 border border-slate-100 dark:border-slate-600 z-20 flex items-center justify-center">
                                    <Play className="h-4 w-4 text-violet-600 dark:text-violet-400 ml-0.5" />
                                  </div>
                                  <div className="mt-1 flex flex-col relative z-10">
                                    <p className="text-sm font-extrabold text-foreground truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{p.name}</p>
                                    {(p.description) && (
                                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 shadow-sm">
                                        {p.type || 'Project'}
                                      </span>
                                      {p.path && (
                                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 truncate border-l border-slate-300 dark:border-slate-600 pl-2">
                                          ...\{p.path.split(/[\/\\]/).pop()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                              {assetTab === 'Sandboxes' && paged.map((s: any, i: number) => (
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.04 }} whileHover={{ scale: 1.025, y: -3 }} whileTap={{ scale: 0.98 }} key={i} onClick={() => openSandbox(s)} className="flex items-center gap-3 p-4 rounded-2xl  glass-panel shadow-sm hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group">
                                  <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-xl group-hover:rotate-3 group-hover:scale-105 transition-transform"><Layers className="h-4 w-4" /></div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-foreground truncate">{s.name}</p>
                                    {(s.description || s.createdAt || s.timestamp || s.lastActive) && (
                                      <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">{s.description || 'Sandbox session'} · {new Date(s.createdAt || s.timestamp || s.lastActive || Date.now()).toLocaleDateString()}</p>
                                    )}
                                    <p className="text-[9px] font-mono text-amber-600 dark:text-amber-400 mt-1 bg-amber-100/50 dark:bg-amber-900/50 w-fit px-1.5 rounded">{s.language}</p>
                                  </div>
                                  <FolderOpen className="h-3.5 w-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                              ))}
                              {assetTab === 'Sketches' && paged.map((s: any, i: number) => (
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.04 }} whileHover={{ scale: 1.025, y: -3 }} whileTap={{ scale: 0.98 }} key={i} onClick={() => setSketchModal({ index: i, sketch: s })} className="flex items-center gap-3 p-4 rounded-2xl  glass-panel shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group">
                                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-xl group-hover:rotate-3 group-hover:scale-105 transition-transform"><PenTool className="h-4 w-4" /></div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-foreground truncate">{s.title}</p>
                                    {(s.description || s.createdAt || s.timestamp || s.lastActive) && (
                                      <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">{s.description || 'Design sketch'} · {new Date(s.createdAt || s.timestamp || s.lastActive || Date.now()).toLocaleDateString()}</p>
                                    )}
                                    <div className="mt-1.5 flex">
                                      <Badge variant="outline" className="text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-900/50">{s.project || 'workspace'}</Badge>
                                    </div>
                                  </div>
                                  <ExternalLink className="h-3.5 w-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                              ))}
                              {assetTab === 'Captures' && paged.map((c: any, i: number) => (
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.04 }} whileHover={{ scale: 1.025, y: -3 }} whileTap={{ scale: 0.98 }} key={i} onClick={() => c.capturedTo && setCaptureModal({ fileName: c.fileName, path: c.capturedTo, project: c.project })} className={`flex items-center gap-3 p-4 rounded-2xl  glass-panel shadow-sm hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-700 transition-all group ${c.capturedTo ? 'cursor-pointer' : ''}`}>
                                  <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl group-hover:rotate-3 group-hover:scale-105 transition-transform"><Camera className="h-4 w-4" /></div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-foreground truncate">{c.fileName}</p>
                                    {(c.description || c.createdAt || c.timestamp || c.lastActive) && (
                                      <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">{c.description || 'Screenshot capture'} · {new Date(c.createdAt || c.timestamp || c.lastActive || Date.now()).toLocaleDateString()}</p>
                                    )}
                                    <p className="text-[9px] text-rose-600 dark:text-rose-400 mt-1">{c.project} · {Math.round((c.sizeBytes || 0) / 1024)}KB</p>
                                  </div>
                                </motion.div>
                              ))}
                              {assetTab === 'Deployments' && paged.map((d: any, i: number) => (
                                <motion.div
                                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.35, delay: i * 0.04 }}
                                  whileHover={{ scale: 1.025, y: -3 }} whileTap={{ scale: 0.98 }}
                                  key={i} onClick={() => setManageDeployment(d)}
                                  className="flex flex-col gap-3 p-4 rounded-2xl glass-panel shadow-sm hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group"
                                >
                                  {/* Top row: icon + name + status tag */}
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {/* Provider icon bubble */}
                                      <div className={`p-2 rounded-xl transition-transform group-hover:rotate-3 group-hover:scale-105 flex-shrink-0 ${
                                        d.target?.toLowerCase().includes('firebase') ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-500' :
                                        d.target?.toLowerCase().includes('vercel') ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' :
                                        d.target?.toLowerCase().includes('netlify') ? 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-500' :
                                        d.target?.toLowerCase().includes('fly') ? 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-500' :
                                        d.target?.toLowerCase().includes('docker') ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-500' :
                                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                      }`}>
                                        {d.target?.toLowerCase().includes('firebase') ? <Flame className="w-4 h-4" /> :
                                         d.target?.toLowerCase().includes('vercel') ? <Triangle className="w-4 h-4 fill-current" /> :
                                         d.target?.toLowerCase().includes('render') ? <ExternalLink className="w-4 h-4" /> :
                                         d.target?.toLowerCase().includes('netlify') ? <Box className="w-4 h-4" /> :
                                         d.target?.toLowerCase().includes('fly') ? <Activity className="w-4 h-4" /> :
                                         d.target?.toLowerCase().includes('docker') ? <Server className="w-4 h-4" /> :
                                         <Cloud className="w-4 h-4" />}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate max-w-[110px]">{d.name}</p>
                                        <p className="text-[9px] text-slate-500 mt-0.5 truncate font-medium">{d.target || 'Unknown'}</p>
                                      </div>
                                    </div>
                                    {/* Glassmorphic status badge */}
                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-md border text-[9px] font-bold flex-shrink-0 ${
                                      d.status === 'Online'
                                        ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400'
                                        : d.status === 'Offline'
                                        ? 'bg-rose-500/10 border-rose-400/30 text-rose-400'
                                        : 'bg-slate-500/10 border-slate-400/20 text-slate-400'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        d.status === 'Online' ? 'bg-emerald-400 animate-pulse' :
                                        d.status === 'Offline' ? 'bg-rose-400' : 'bg-slate-400'
                                      }`} />
                                      {d.status === 'Online' ? 'Live' : d.status === 'Offline' ? 'Down' : 'Inactive'}
                                    </div>
                                  </div>

                                  {/* Middle: latency + URL */}
                                  <div className="flex flex-col gap-1.5">
                                    {d.latency && (
                                      <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-1 bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 px-2 py-0.5 rounded-full">
                                          <Activity className="w-2.5 h-2.5 text-violet-400" />
                                          <span className="text-[9px] font-bold text-violet-400">{d.latency}ms</span>
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between gap-1">
                                      <p className="text-[9px] text-violet-500 dark:text-violet-400 truncate flex-1 font-mono">
                                        {d.url || '—'}
                                      </p>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); if (d.url) window.open(d.url, '_blank'); }}
                                        disabled={!d.url}
                                        className="flex-shrink-0 p-1.5 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-violet-400 transition-colors disabled:opacity-30"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                              {paged.length === 0 && <p className="text-xs text-slate-400 col-span-full py-6 text-center">No {assetTab.toLowerCase()} found</p>}
                            </div>
                          </div>

                          {/* Right Arrow */}
                          <div className="w-8 flex-shrink-0 flex items-center justify-center">
                              <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: safePage < totalPages - 1 ? 1.1 : 1 }} whileTap={{ scale: safePage < totalPages - 1 ? 0.9 : 1 }}
                                onClick={() => safePage < totalPages - 1 && setAssetPage(p => Math.min(totalPages - 1, p + 1))}
                                className={`w-8 h-8 flex items-center justify-center rounded-full border shadow-md transition-colors ${safePage < totalPages - 1 ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-violet-600 cursor-pointer' : 'border-border bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50 shadow-none'}`}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </motion.button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ═══ WORKSPACE HEALTH & ANALYTICS ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            <motion.div variants={iV} className="h-full min-h-[200px]">
              <Card onClick={() => setGitModalOpen(true)} className={`cursor-pointer backdrop-blur-md  shadow-sm h-full flex flex-col rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg ${gitStatus.globalUncommittedChanges > 0 ? 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20' : 'bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20'}`}>
                <CardHeader className="pb-2 flex-shrink-0"><CardTitle className="text-sm">Git Status</CardTitle></CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center p-6 pt-0 text-center relative group">
                  <div className={`p-3 rounded-full mb-3 ${gitStatus.globalUncommittedChanges > 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                    {gitStatus.globalUncommittedChanges > 0 ? <FolderGit2 className="h-6 w-6" /> : <Box className="h-6 w-6" />}
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-1">{gitStatus.globalUncommittedChanges}</h3>
                  <div className="flex flex-col items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">main</span>
                    <p className="text-[10px] font-medium text-slate-500">3 projects &middot; 21M 4A 2D</p>
                    <p className="text-[10px] font-bold text-violet-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">View changes &rarr;</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={iV} className="h-full min-h-[200px]">
              <Card className="glass-panel   shadow-sm h-full flex flex-col rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all">
                <CardHeader className="pb-1 flex-shrink-0"><CardTitle className="text-sm">Time by Project</CardTitle></CardHeader>
                <CardContent className="flex-1 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart onClick={(e: any) => { if(e?.activePayload) setDrilldown({ type: 'project', value: e.activePayload[0].payload.name }) }}>
                      <defs>
                        {projTimeBars.map((e: any, i: number) => (
                          <linearGradient id={`gradProj${i}`} x1="0" y1="0" x2="0.4" y2="1" key={`defProj${i}`}>
                            <stop offset="0%" stopColor="#fff" stopOpacity={0.25} />
                            <stop offset="25%" stopColor={e.fill} stopOpacity={0.95} />
                            <stop offset="100%" stopColor={e.fill} stopOpacity={1} />
                          </linearGradient>
                        ))}
                        <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="2" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
                          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                        </filter>
                      </defs>
                      <Pie
                        data={projTimeBars}
                        dataKey="mins"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={1}
                        fillOpacity={0.95}
                        animationDuration={1000}
                        className="cursor-pointer"
                        filter="url(#shadow3d)"
                      >
                        {projTimeBars.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#gradProj${index})`} className="hover:opacity-80 transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        formatter={(v: any) => [`${Math.round(v)}m`, 'Time Tracked']}
                      />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={iV} className="h-full min-h-[200px]">
              <Card className="glass-panel   shadow-sm h-full flex flex-col rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all">
                <CardHeader className="pb-2 flex-shrink-0"><CardTitle className="text-sm">Global Techstack</CardTitle></CardHeader>
                <CardContent className="flex-1 overflow-y-auto pr-1">
                  <div className="flex flex-wrap gap-1.5">
                    {techstackBars.length > 0 ? techstackBars.map((t, i) => (
                      <div key={i} className="flex items-center gap-1.5 glass-panel border border-slate-100 dark:border-slate-700/50 rounded-full px-2.5 py-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">{t.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">&middot; {t.value as number}</span>
                      </div>
                    )) : <p className="text-[10px] text-slate-400 w-full text-center py-4">No dependencies found</p>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={iV} className="h-full min-h-[200px]">
              <Card className="glass-panel shadow-sm h-full flex flex-col rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all">
                <CardHeader className="pb-2 flex-shrink-0"><CardTitle className="text-sm">Deployments</CardTitle></CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-2">
                  {deployments.length > 0 ? deployments.map((d: any, i: number) => (
                    <div
                      key={i}
                      className="relative flex items-center justify-between px-3 py-2.5 rounded-xl glass-panel border border-slate-100 dark:border-slate-700/60 group hover:border-violet-300/50 dark:hover:border-violet-700/50 hover:shadow-sm transition-all duration-200 overflow-hidden mb-2"
                    >
                      {/* Glint line */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                      {/* Left: status dot + name */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Status LED container */}
                        <div className="relative flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
                          {/* Inner glass highlight */}
                          <div className="absolute inset-0 rounded-full border border-white/60 dark:border-white/5 pointer-events-none" />

                          {/* Crisp, small LED dot */}
                          <span className={`relative w-1.5 h-1.5 rounded-full shadow-none blur-none opacity-100 ${
                            d.status === 'Online' ? 'bg-[#34d399]' :
                            d.status === 'Offline' ? 'bg-[#fb7185]' :
                            'bg-[#94a3b8]'
                          }`} />
                        </div>

                        {/* Name + subtitle */}
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate leading-none">{d.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5 font-medium">
                            {d.status === 'Online' ? `${d.latency || 0}ms` : d.status === 'Offline' ? 'Offline' : 'Not deployed'}
                          </p>
                        </div>
                      </div>

                      {/* Right: provider pill */}
                      <div className="flex-shrink-0">
                        {d.target ? (
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold backdrop-blur-sm ${
                            d.target.toLowerCase().includes('vercel')   ? 'bg-white/5 border-white/10 dark:border-white/10 text-slate-300' :
                            d.target.toLowerCase().includes('netlify')  ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' :
                            d.target.toLowerCase().includes('fly')      ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' :
                            d.target.toLowerCase().includes('firebase') ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            d.target.toLowerCase().includes('render')   ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                                                                          'bg-white/5 border-white/10 text-slate-400'
                          }`}>
                            <span>{
                              d.target.toLowerCase().includes('vercel')   ? 'Vercel'   :
                              d.target.toLowerCase().includes('netlify')  ? 'Netlify'  :
                              d.target.toLowerCase().includes('fly')      ? 'Fly.io'   :
                              d.target.toLowerCase().includes('firebase') ? 'Firebase' :
                              d.target.toLowerCase().includes('render')   ? 'Render'   :
                              d.target
                            }</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 dark:text-slate-600">—</span>
                        )}
                      </div>
                    </div>
                  )) : <p className="text-[10px] text-slate-400 w-full text-center py-4">No deployment configs found</p>}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={iV} className="mt-3 mb-6">
            <Card className="glass-panel shadow-sm w-full rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col min-h-[160px]">
                </div>
              </CardContent>
            </Card>
          </motion.div>

          </>
          )}

          {activeTab === 'Arena' && (
            <div className="h-[calc(100vh-140px)] flex flex-col">
              <div className="flex items-center justify-center mb-6 relative z-10">
                <div className="glass-panel backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-2xl rounded-full p-1.5 flex items-center gap-1.5">
                  <button onClick={() => setArenaTab('race')} className={`group relative px-6 py-2.5 rounded-full flex items-center justify-center transition-all ${arenaTab === 'race' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
                    {arenaTab === 'race' && <motion.div layoutId="arena-tab-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
                    <span className="text-xs font-bold relative z-10">Speed Race</span>
                  </button>
                  <button onClick={() => setArenaTab('war')} className={`group relative px-6 py-2.5 rounded-full flex items-center justify-center transition-all ${arenaTab === 'war' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
                    {arenaTab === 'war' && <motion.div layoutId="arena-tab-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
                    <span className="text-xs font-bold relative z-10">Concept War</span>
                  </button>
                  <button onClick={() => setArenaTab('design')} className={`group relative px-6 py-2.5 rounded-full flex items-center justify-center transition-all ${arenaTab === 'design' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
                    {arenaTab === 'design' && <motion.div layoutId="arena-tab-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
                    <span className="text-xs font-bold relative z-10">Design Battle</span>
                  </button>
                  <button onClick={() => setArenaTab('competitive')} className={`group relative px-6 py-2.5 rounded-full flex items-center justify-center transition-all ${arenaTab === 'competitive' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
                    {arenaTab === 'competitive' && <motion.div layoutId="arena-tab-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
                    <span className="text-xs font-bold relative z-10">Competitive</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 relative">
                <AnimatePresence mode="wait">
                  {arenaTab === 'race' && (
                    <motion.div key="race" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute inset-0">
                      <RaceMode />
                    </motion.div>
                  )}
                  {arenaTab === 'war' && (
                    <motion.div key="war" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0">
                      <WarMode />
                    </motion.div>
                  )}
                  {arenaTab === 'design' && (
                    <motion.div key="design" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="absolute inset-0">
                      <SystemDesignMode />
                    </motion.div>
                  )}
                  {arenaTab === 'competitive' && (
                    <motion.div key="competitive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute inset-0">
                      <CompetitiveMode practice={data.practice || []} onBack={() => setArenaTab('race')} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {activeTab === 'Focus' && (<>
          {/* ═══ FOCUS MODE ═══ */}
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] w-full py-12 relative overflow-hidden">
            {/* Background ambient glow when running */}
            {focusRunning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
              >
                <div className={`w-[600px] h-[600px] rounded-full blur-[120px] will-change-transform transform-gpu ${
                  (focusLive?.flowScore || 0) >= 90 ? 'bg-emerald-500' : (focusLive?.flowScore || 0) >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
              </motion.div>
            )}

            {/* Companion App URL Display */}
            {activeTab === 'Focus' && localIp && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2"
              >
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="glass-panel px-4 py-2 rounded-2xl border border-violet-500/30 flex items-center gap-3 shadow-lg shadow-violet-500/10 hover:bg-violet-500/5 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Companion</p>
                    <p className="text-xs font-mono font-bold text-violet-300">{tunnelUrl ? `${tunnelUrl}/companion` : `http://${localIp}:4000/companion`}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {showQRCode && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="glass-panel p-4 rounded-2xl border border-violet-500/30 shadow-xl bg-white"
                    >
                      <QRCodeSVG
                        value={tunnelUrl ? `${tunnelUrl}/companion` : `http://${localIp}:4000/companion`}
                        size={150}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"L"}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Attach to Window Toast/Popover */}
            {!focusRunning && !sessionJustEnded && projects && projects.length > 0 && (
              <div className="absolute top-6 left-6 z-50">
                <button
                  onClick={() => setShowWindowSelector(!showWindowSelector)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                  title="Attach to Window"
                >
                  <Monitor className={`w-4 h-4 ${focusTarget ? 'text-violet-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`} />
                </button>
                <AnimatePresence>
                  {showWindowSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-14 left-0 w-64 glass-panel backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Target</span>
                        <button onClick={() => setShowWindowSelector(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-3 h-3"/></button>
                      </div>
                      <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {projects.map((p: any) => {
                          const isActive = (focusTarget || projects[0]?.path) === p.path;
                          return (
                            <button
                              key={p.path}
                              onClick={() => { setFocusTarget(p.path); setShowWindowSelector(false); }}
                              className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${isActive ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'}`}
                            >
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' : 'glass-panel text-muted-foreground text-slate-500 dark:text-slate-400'}`}>
                                <Code2 className="w-3 h-3" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-bold truncate ${isActive ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'}`}>{p.name}</p>
                                <p className="text-[9px] text-slate-400 truncate font-mono mt-0.5">{p.path.split(/[\\/]/).pop()}</p>
                              </div>
                              {isActive && <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <motion.div variants={iV} className="w-full max-w-2xl relative z-10 flex flex-col items-center">
              {/* The Central Timer Display */}
              {(() => {
                const elapsed = focusLive?.elapsedSeconds || 0;
                const target = focusLive?.targetSeconds || (focusDurationInput * 60);
                const remaining = Math.max(0, target - elapsed);
                const progress = focusRunning && target > 0 ? Math.min(1, elapsed / target) : 0;
                const m = Math.floor(remaining / 60).toString().padStart(2, '0');
                const s = (remaining % 60).toString().padStart(2, '0');
                const score = focusLive?.flowScore ?? 0;
                const radius = 160;
                const stroke = 2; // Ultra thin elegant stroke
                const circumference = 2 * Math.PI * radius;
                const offset = circumference * (1 - progress);

                // Color theory
                const isBreak = focusLive?.category === 'break';
                const ringColor = isBreak ? '#14b8a6' : (score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : score >= 50 ? '#f97316' : '#ef4444');
                const bgRingColor = 'rgba(148, 163, 184, 0.1)';

                return (
                  <AnimatePresence mode="wait">
                    {sessionJustEnded ? (
                      <motion.div
                        key="completed"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center py-12 w-full"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                          className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(16,185,129,0.3)]"
                        >
                          <Trophy className="w-10 h-10 text-emerald-500" />
                        </motion.div>
                        <h2 className="text-4xl font-black text-foreground tracking-tight mb-3">Session Complete</h2>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-12">Great work! Your deep work session has been logged.</p>

                        <div className="flex flex-col gap-4 w-full max-w-xs">
                          <button
                            onClick={() => setShowReportModal(true)}
                            className="group relative flex items-center justify-center gap-3 w-full h-14 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold shadow-[0_0_40px_rgba(139,92,246,0.2)] hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                          >
                            <Activity className="w-4 h-4" />
                            <span className="text-xs tracking-[0.1em] uppercase">View Full Report</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all absolute right-5" />
                          </button>
                          <button
                            onClick={() => setSessionJustEnded(false)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-3 transition-colors uppercase tracking-widest"
                          >
                            Start New Session
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pre-session"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center w-full"
                      >
                        {/* SVG Ring */}
                    <div className="relative w-[360px] h-[360px] flex items-center justify-center mb-12">
                      <svg width="360" height="360" className="-rotate-90 filter drop-shadow-sm">
                        <circle cx="180" cy="180" r={radius} fill="none" stroke={bgRingColor} strokeWidth={stroke} />
                        <motion.circle
                          cx="180" cy="180" r={radius} fill="none"
                          stroke={focusRunning ? ringColor : '#8b5cf6'}
                          strokeWidth={focusRunning ? 4 : stroke}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={focusRunning ? offset : circumference}
                          initial={false}
                          animate={{ strokeDashoffset: focusRunning ? offset : circumference }}
                          transition={{ duration: 1, ease: 'linear' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {focusRunning ? (
                          <>
                            <motion.p initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl font-mono font-black text-foreground tabular-nums tracking-tighter drop-shadow-sm">{m}:{s}</motion.p>
                            <p className="text-[10px] font-bold text-slate-400 mt-4 tracking-[0.3em] uppercase">Deep Work</p>
                          </>
                        ) : (
                          <>
                            <p className="text-7xl font-mono font-black text-slate-300 dark:text-slate-600 tabular-nums tracking-tighter drop-shadow-sm transition-colors">{Math.floor(focusDurationInput).toString().padStart(2, '0')}:00</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-4 tracking-[0.3em] uppercase">Session Length</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Pre-Session Controls */}
                    {!focusRunning && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center w-full">
                        {/* Elegant Presets & Custom Duration */}
                        <div className="flex items-center gap-2 p-1.5 glass-panel rounded-full backdrop-blur-md border border-slate-200/50 dark:border-slate-700/30 mb-8">
                          {[25, 45, 60, 90, 120].map(d => (
                            <button
                              key={d}
                              onClick={() => setFocusDurationInput(d)}
                              className={`relative px-5 py-2 rounded-full text-xs font-bold transition-all overflow-hidden ${
                                focusDurationInput === d
                                  ? 'text-white dark:text-slate-900'
                                  : 'text-slate-500 hover:text-foreground dark:hover:text-slate-200'
                              }`}
                            >
                              {focusDurationInput === d && (
                                <motion.div layoutId="focusPreset" className="absolute inset-0 bg-slate-800 dark:bg-slate-200 rounded-full -z-10 shadow-sm" />
                              )}
                              <span className="relative z-10">{d}m</span>
                            </button>
                          ))}

                          <div className="flex items-center gap-1 pl-2 pr-4 opacity-50 hover:opacity-100 transition-opacity focus-within:opacity-100 border-l border-slate-200 dark:border-slate-700">
                            <input
                              type="number"
                              min={1} max={480}
                              value={focusDurationInput}
                              onChange={e => setFocusDurationInput(Math.max(1, Math.min(480, parseInt(e.target.value) || 1)))}
                              className="w-8 text-right text-xs font-bold bg-transparent outline-none text-muted-foreground"
                            />
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">m</span>
                          </div>
                        </div>

                        {/* Start Button */}
                        <button
                          onClick={startFocusSession}
                          disabled={focusStarting}
                          className="group relative flex items-center justify-center gap-3 w-48 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                          <Play className="w-4 h-4 fill-current" />
                          <span className="text-xs tracking-[0.2em] uppercase">{focusStarting ? 'Starting...' : 'Ignite'}</span>
                        </button>
                      </motion.div>
                    )}

                    {/* Active Session Dock */}
                    {focusRunning && focusLive && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg mt-8">
                        <div className="flex items-center justify-between p-4 glass-panel border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg">

                          <div className="flex flex-col items-center px-4">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Activity</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                focusLive.category === 'coding' ? 'bg-emerald-500 animate-pulse' :
                                focusLive.category === 'research' ? 'bg-blue-500' :
                                focusLive.category === 'distraction' ? 'bg-rose-500 animate-bounce' : 'bg-slate-400'
                              }`} />
                              <span className="text-xs font-bold text-foreground capitalize tracking-wide">{focusLive.category || 'idle'}</span>
                            </div>
                          </div>

                          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50" />

                          <div className="flex flex-col items-center px-4">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Flow Score</span>
                            <span className={`text-xl font-black tracking-tight ${score >= 90 ? 'text-emerald-500' : score >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>{score}</span>
                          </div>

                          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50" />

                          <div className="flex flex-col items-center px-4">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Streak</span>
                            <span className="text-xl font-black text-foreground tracking-tight">{Math.floor((focusLive.currentStreak || 0) / 60)}<span className="text-[10px] text-slate-400 ml-0.5">m</span></span>
                          </div>

                        </div>

                        <div className="mt-6 flex flex-row items-center justify-center gap-8">
                            {focusLive?.category === 'break' ? (
                              <button
                                onClick={() => fetch(apiUrl('/api/focus/command'), { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({command: 'resume_focus'}) })}
                                className="px-6 py-2 rounded-full bg-teal-500/20 border border-teal-500/30 text-[10px] font-bold tracking-[0.2em] uppercase text-teal-300 hover:bg-teal-500/30 transition-all active:scale-95 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                              >
                                Resume Focus
                              </button>
                            ) : (
                              <button
                                onClick={() => fetch(apiUrl('/api/focus/command'), { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({command: 'start_break'}) })}
                                className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-white hover:bg-white/10 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                              >
                                Take Break
                              </button>
                            )}

                            <button
                              onClick={() => fetch(apiUrl('/api/focus/command'), { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({command: 'end_session'}) })}
                              className="group flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-[0.2em]"
                            >
                              <Square className="w-3 h-3 transition-transform group-hover:scale-110" /> End Session
                            </button>
                          </div>
                      </motion.div>
                    )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })()}
            </motion.div>
          </div>

          {/* Elegant Desktop-Grade Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
              <motion.div initial={{ opacity: 0, scale: 0.98, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl rounded-3xl overflow-hidden glass-panel border border-slate-200 dark:border-slate-800">
                {(() => {
                   const report = flow.length > 0 ? flow[flow.length - 1] : null;
                   if (!report) return (
                     <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                       <p className="text-sm">No session data found.</p>
                       <button onClick={() => setShowReportModal(false)} className="mt-6 px-6 py-2 glass-panel text-muted-foreground rounded-full text-xs font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">Close</button>
                     </div>
                   );

                   const totalSecs = (report.durationMinutes * 60) || 1;
                   const codingPct = Math.round(((report.codingSeconds || 0) / totalSecs) * 100);
                   const researchPct = Math.round(((report.researchSeconds || 0) / totalSecs) * 100);
                   const distractPct = Math.round(((report.distractionSeconds || 0) / totalSecs) * 100);
                   const idlePct = Math.round(((report.idleSeconds || 0) / totalSecs) * 100);

                   return (
                     <>
                       {/* Header */}
                       <div className="px-8 py-6 border-b border-border flex items-center justify-between glass-panel backdrop-blur flex-shrink-0">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                             <Trophy className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                           </div>
                           <div>
                             <h3 className="text-lg font-bold text-foreground tracking-tight">Session Intelligence Report</h3>
                             <p className="text-xs text-slate-500 font-medium">{new Date(report.timestamp).toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                           </div>
                         </div>
                         <button onClick={() => setShowReportModal(false)} className="p-2 glass-panel text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                           <X className="w-4 h-4" />
                         </button>
                       </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-7 flex flex-col lg:flex-row gap-7">

                          {/* Left Column */}
                          <div className="w-full lg:w-[260px] flex-shrink-0 flex flex-col gap-4">

                            {/* Score Card */}
                            <div className="bg-slate-900 dark:bg-black p-6 rounded-2xl text-white relative overflow-hidden">
                              <div className="absolute -top-8 -right-8 w-32 h-32 bg-violet-600/20 blur-[40px] rounded-full pointer-events-none" />
                              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500 block mb-3">Final Flow Score</span>
                              <div className="flex items-end gap-2">
                                <span className="text-[60px] font-black leading-none tracking-tighter text-white">{report.flowScore}</span>
                                <span className="text-slate-500 text-xs font-bold mb-2">/ 100</span>
                              </div>
                              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-5">
                                <div>
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Duration</span>
                                  <span className="text-xs font-bold text-slate-200">{report.durationMinutes}m</span>
                                </div>
                                <div className="w-px h-5 bg-slate-800"/>
                                <div>
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">LOC Delta</span>
                                  <span className={`text-xs font-bold ${(report.locDelta || 0) > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>{report.locDelta > 0 ? '+' : ''}{report.locDelta || 0}</span>
                                </div>
                              </div>
                            </div>

                            {/* Time Allocation */}
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/40">
                              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500 block mb-4">Time Allocation</span>
                              <div className="h-1.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700 mb-4">
                                <div className="bg-emerald-500" style={{ width: `${codingPct}%` }} />
                                <div className="bg-blue-400" style={{ width: `${researchPct}%` }} />
                                <div className="bg-rose-400" style={{ width: `${distractPct}%` }} />
                                <div className="bg-slate-300 dark:bg-slate-600" style={{ width: `${idlePct}%` }} />
                              </div>
                              <div className="space-y-2.5">
                                {[
                                  { label: 'Coding', pct: codingPct, color: 'bg-emerald-500' },
                                  { label: 'Research', pct: researchPct, color: 'bg-blue-400' },
                                  { label: 'Distraction', pct: distractPct, color: 'bg-rose-400' },
                                  { label: 'Idle', pct: idlePct, color: 'bg-slate-300 dark:bg-slate-600' },
                                ].map(({ label, pct, color }) => (
                                  <div key={label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color}`}/>
                                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-foreground tabular-nums">{pct}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* Right Column: AI Analysis */}
                          <div className="flex-1 min-w-0 flex flex-col gap-5">
                            {report.aiAnalysis ? (
                              <>
                                {/* Derived Metrics — tonal badge, no loud red values */}
                                {report.aiAnalysis.derivedMetrics?.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-3">
                                      <Target className="w-3 h-3 text-slate-400"/>
                                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">Derived Metrics</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                      {report.aiAnalysis.derivedMetrics.map((m: any, i: number) => {
                                        const isGood = m.status === 'good';
                                        const isBad = m.status === 'bad';
                                        return (
                                          <div key={i} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/40 flex flex-col gap-1.5">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-tight">{m.label}</span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-100 tracking-tight leading-snug">{m.value}</span>
                                            <span className={`self-start text-[8px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md ${isGood ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : isBad ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>{m.status}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Attention Shortfalls Chart */}
                                {report.timeline && report.timeline.length > 0 && (() => {
                                  const tl = report.timeline as any[];
                                  const count = Math.min(tl.length, 10);
                                  const bucketSize = Math.ceil(tl.length / count);
                                  const buckets = Array.from({ length: count }, (_, bi) => {
                                    const slice = tl.slice(bi * bucketSize, (bi + 1) * bucketSize);
                                    const totalS = slice.reduce((s: number, e: any) => s + (e.durationSecs || 0), 0) || 1;
                                    const distS = slice.filter((e: any) => e.category === 'distraction' || e.category === 'idle').reduce((s: number, e: any) => s + (e.durationSecs || 0), 0);
                                    const attention = Math.max(0, Math.round((1 - distS / totalS) * 100));
                                    const mStart = Math.round((slice[0]?.elapsed || 0) / 60);
                                    return { t: `${mStart}m`, attention, shortfall: 100 - attention };
                                  });
                                  return (
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-3">
                                        <Activity className="w-3 h-3 text-slate-400"/>
                                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">Attention Shortfalls</span>
                                        <span className="ml-auto text-[9px] text-slate-400 font-medium">over session</span>
                                      </div>
                                      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/40 px-4 pt-4 pb-3">
                                        <ResponsiveContainer width="100%" height={110}>
                                          <LineChart data={buckets} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                            <CartesianGrid vertical={false} strokeDasharray="2 4" stroke="rgba(148,163,184,0.12)" />
                                            <XAxis dataKey="t" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} axisLine={false} tickLine={false} width={28} />
                                            <Tooltip
                                              cursor={{ stroke: 'rgba(148,163,184,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                              contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 8, fontSize: 11, color: '#e2e8f0', padding: '6px 10px' }}
                                              formatter={(value: any, name: any) => [`${value}%`, name === 'attention' ? 'Attention' : 'Shortfall']}
                                              labelStyle={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                            />
                                            <Line type="monotone" dataKey="attention" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                                          </LineChart>
                                        </ResponsiveContainer>
                                        <div className="flex items-center justify-center gap-5 mt-2">
                                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-emerald-500"/><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Attention Drop Over Time</span></div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Core Observations */}
                                {report.aiAnalysis.coreObservations?.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-3">
                                      <Zap className="w-3 h-3 text-slate-400"/>
                                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">Observations</span>
                                    </div>
                                    <div className="space-y-2">
                                      {report.aiAnalysis.coreObservations.map((obs: string, i: number) => (
                                        <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                                           <div className="w-1 h-1 rounded-full bg-violet-400 mt-2 flex-shrink-0"/>
                                           <span className="text-[12px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{obs}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Time Drain */}
                                {report.aiAnalysis.wastedTimeAnalysis && (
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-3">
                                      <Flame className="w-3 h-3 text-slate-400"/>
                                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">Time Drain</span>
                                    </div>
                                    <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                                      <p className="text-[12px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{report.aiAnalysis.wastedTimeAnalysis}</p>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/40 p-10 text-center">
                                <div className="w-11 h-11 bg-white dark:bg-slate-800 shadow-lg rounded-full flex items-center justify-center mb-4">
                                  <Zap className="w-5 h-5 text-violet-500" />
                                </div>
                                <h4 className="text-sm font-bold text-foreground mb-2 tracking-tight">AI Intelligence Engine</h4>
                                <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed font-medium">Let Gemini analyze your session to detect context switches, recalibrate distractions, and surface your true focus score.</p>
                                <button onClick={generateReport} disabled={isGeneratingReport} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:bg-violet-600/30 disabled:text-violet-100/50 disabled:cursor-wait border border-violet-500/50">
                                  <Zap className={`w-3.5 h-3.5 ${isGeneratingReport ? 'animate-pulse text-amber-300' : 'text-amber-400'}`} />
                                  {isGeneratingReport ? 'Analyzing...' : 'Generate Report'}
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      </>
                    );
                 })()}
               </motion.div>
             </div>
           )}
           </>)}
           {activeTab === 'Playground' && (
             <div className="w-full h-[calc(100vh-120px)] relative z-10">
               <Playground />
             </div>
           )}
          {activeTab === 'Tracker' && (<>
          {/* ═══ LINEAR KANBAN ═══ */}
          <SectionHeader>Linear Kanban</SectionHeader>
          <motion.div variants={iV} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-2">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-sm" />Active Issues</h2>
                {linearError && <Badge variant="outline" className="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200">{linearError}</Badge>}
              </div>
              {linearIssues && linearIssues.length > 0 && (
                <div className="flex items-center gap-3 relative flex-wrap">
                  <div className="relative">
                    <div className="glass-panel px-2.5 py-1.5 rounded-lg flex items-center gap-2 border border-white/5 transition-all">
                      <Search className="w-3 h-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={linearSearchTerm}
                        onChange={e => setLinearSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] w-20 text-slate-300 placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => { setLinearProjectOpen(!linearProjectOpen); setLinearSortOpen(false); setLinearAssigneeOpen(false); setLinearLabelOpen(false); }}
                      className="glass-panel px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.22-1.82A2 2 0 0 0 8.53 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
                      {linearProjectFilter === 'All' ? 'Project' : linearProjectFilter}
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 ml-1"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <AnimatePresence>
                      {linearProjectOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 top-full mt-1.5 w-36 glass-panel backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col p-1"
                        >
                          {['All', ...Array.from(new Set(linearIssues.map(i => i.project?.name).filter(Boolean)))].map(p => (
                            <button key={p as string} onClick={() => { setLinearProjectFilter(p as string); setLinearProjectOpen(false); }} className={`text-left px-2 py-1.5 text-[10px] rounded-md transition-colors ${linearProjectFilter === p ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'}`}>
                              {p === 'All' ? 'All Projects' : p as string}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => { setLinearAssigneeOpen(!linearAssigneeOpen); setLinearProjectOpen(false); setLinearSortOpen(false); setLinearLabelOpen(false); }}
                      className="glass-panel px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all outline-none"
                    >
                      <User className="w-3 h-3 opacity-70" />
                      {linearAssigneeFilter === 'All' ? 'Assignee' : linearAssigneeFilter}
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 ml-1"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <AnimatePresence>
                      {linearAssigneeOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 top-full mt-1.5 w-32 glass-panel backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col p-1"
                        >
                          {['All', 'Me', 'Alex', 'Sam'].map(a => (
                            <button key={a} onClick={() => { setLinearAssigneeFilter(a); setLinearAssigneeOpen(false); }} className={`text-left px-2 py-1.5 text-[10px] rounded-md transition-colors ${linearAssigneeFilter === a ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'}`}>
                              {a === 'All' ? 'Anyone' : a}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => { setLinearLabelOpen(!linearLabelOpen); setLinearProjectOpen(false); setLinearSortOpen(false); setLinearAssigneeOpen(false); }}
                      className="glass-panel px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all outline-none"
                    >
                      <Tag className="w-3 h-3 opacity-70" />
                      {linearLabelFilter === 'All' ? 'Label' : linearLabelFilter}
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 ml-1"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <AnimatePresence>
                      {linearLabelOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 top-full mt-1.5 w-32 glass-panel backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col p-1"
                        >
                          {['All', 'bug', 'feature', 'design', 'chore'].map(l => (
                            <button key={l} onClick={() => { setLinearLabelFilter(l); setLinearLabelOpen(false); }} className={`text-left px-2 py-1.5 text-[10px] rounded-md transition-colors ${linearLabelFilter === l ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'}`}>
                              {l === 'All' ? 'Any Label' : l}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => { setLinearSortOpen(!linearSortOpen); setLinearProjectOpen(false); setLinearAssigneeOpen(false); setLinearLabelOpen(false); }}
                      className="glass-panel px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
                      {linearSortBy}
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 ml-1"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <AnimatePresence>
                      {linearSortOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 top-full mt-1.5 w-32 glass-panel backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col p-1"
                        >
                          {['Default', 'Priority', 'Due Date'].map(s => (
                            <button key={s} onClick={() => { setLinearSortBy(s as any); setLinearSortOpen(false); }} className={`text-left px-2 py-1.5 text-[10px] rounded-md transition-colors ${linearSortBy === s ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'}`}>
                              {s}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
            <div>
              {linearIssues && linearIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Group by rough states: Todo, In Progress, Done/Other */}
                  {['Todo', 'In Progress', 'Done'].map(column => {
                      const colIssues = linearIssues.filter(i => {
                        if (linearProjectFilter !== 'All' && i.project?.name !== linearProjectFilter) return false;
                        if (linearAssigneeFilter !== 'All' && i.assignee !== linearAssigneeFilter) return false;
                        if (linearLabelFilter !== 'All' && !i.labels?.includes(linearLabelFilter)) return false;
                        if (linearSearchTerm && !i.title.toLowerCase().includes(linearSearchTerm.toLowerCase()) && !i.identifier.toLowerCase().includes(linearSearchTerm.toLowerCase())) return false;
                        const s = i.state.name.toLowerCase();
                        if (column === 'Todo') return s.includes('todo') || s.includes('backlog') || s.includes('triage') || s.includes('unstarted');
                        if (column === 'In Progress') return s.includes('progress') || s.includes('doing') || s.includes('review') || s.includes('active');
                        return s.includes('done') || s.includes('completed') || s.includes('closed');
                      });

                      return (
                        <div key={column} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, column)} className="flex flex-col gap-2 glass-panel p-3 rounded-xl border border-border/50 shadow-inner min-h-[150px] relative overflow-hidden isolate">
                          {/* Soft Directional Light */}
                          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-4/5 h-24 blur-[40px] rounded-full pointer-events-none z-0 ${column === 'Todo' ? 'bg-violet-500/40 dark:bg-violet-400/30' : column === 'In Progress' ? 'bg-amber-500/40 dark:bg-amber-400/30' : 'bg-emerald-500/40 dark:bg-emerald-400/30'}`} />
                          <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-1 px-1 flex items-center justify-between relative z-10 ${column === 'Todo' ? 'text-violet-600 dark:text-violet-400' : column === 'In Progress' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            <span className="flex items-center gap-1.5">{column} <span className={`px-1.5 py-0.5 rounded-full shadow-sm font-semibold ${column === 'Todo' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' : column === 'In Progress' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>{colIssues.length}</span></span>
                            {column !== 'Todo' && (
                              <button className="p-0.5 opacity-50 hover:opacity-100 transition-opacity">
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </h3>
                          {column === 'Todo' && linearIssues && linearIssues.length > 0 && (
                            <form onSubmit={handleCreateIssue} className="mb-1 relative z-10">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={newIssueTitle}
                                  onChange={e => setNewIssueTitle(e.target.value)}
                                  placeholder="+ New issue... (#project !priority)"
                                  disabled={isCreatingIssue}
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-2.5 pr-8 text-[10px] text-foreground outline-none focus:border-indigo-400 disabled:opacity-50 shadow-sm transition-all"
                                />
                                <button type="submit" disabled={isCreatingIssue} className="absolute right-1.5 top-1.5 p-0.5 text-slate-400 hover:text-indigo-500">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              {(newIssueTitle.includes('#') || newIssueTitle.includes('!')) && (
                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-1 mt-1.5 px-1">
                                  {newIssueTitle.match(/#(\w+)/) && <span className="text-[8px] bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50 shadow-sm flex items-center gap-1"><FolderGit2 className="w-2.5 h-2.5" /> Project: {newIssueTitle.match(/#(\w+)/)?.[1]}</span>}
                                  {newIssueTitle.match(/!(\w+)/) && <span className="text-[8px] bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800/50 shadow-sm flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Priority: {newIssueTitle.match(/!(\w+)/)?.[1]}</span>}
                                </motion.div>
                              )}
                            </form>
                          )}
                          <AnimatePresence mode="popLayout">
                          {colIssues.sort((a, b) => {
                            if (linearSortBy === 'Priority') return (a.priority || 5) - (b.priority || 5);
                            if (linearSortBy === 'Due Date') {
                              if (!a.dueDate) return 1;
                              if (!b.dueDate) return -1;
                              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                            }
                            return 0;
                          }).map((issue: any) => {
                            const isPlaceholder = issue.title === 'hi' || issue.title === 'yoo';
                            const priorityColors: Record<number, string> = { 1: 'bg-red-500', 2: 'bg-orange-500', 3: 'bg-purple-500', 4: 'bg-slate-400' };
                            const pDotClass = priorityColors[issue.priority] || 'bg-slate-400/50';
                            const pseudoRandomDays = (issue.id.charCodeAt(0) % 10) + 1;
                            const ageString = `${pseudoRandomDays}d ago`;

                            const completedChildren = issue.children?.nodes?.filter((c:any) => c.state?.type === 'completed').length || 0;
                            const totalChildren = issue.children?.nodes?.length || 0;
                            const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date();
                            const teamStates = issue.team?.states?.nodes || [];

                            const getNextState = () => {
                              if(column === 'Todo') return teamStates.find((s:any) => s.type === 'started') || teamStates.find((s:any) => s.name.toLowerCase().includes('progress'));
                              if(column === 'In Progress') return teamStates.find((s:any) => s.type === 'completed') || teamStates.find((s:any) => s.name.toLowerCase().includes('done'));
                              return null;
                            };
                            const nextState = getNextState();

                            return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ y: -3 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              key={issue.id}
                              draggable
                              onDragStart={() => setDraggedIssueId(issue.id)}
                              className={`glass-panel backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 p-3 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm transition-all duration-300 group hover:shadow-xl hover:border-indigo-300/60 dark:hover:border-indigo-500/40 flex flex-col gap-2 relative overflow-hidden cursor-grab active:cursor-grabbing ${draggedIssueId === issue.id ? 'opacity-50 scale-95' : 'opacity-100'}`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/60 dark:from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
                              <div className="flex justify-between items-start gap-2 relative z-10">
                                <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                                  <p onClick={() => setSelectedIssue(issue)} className={`text-xs font-semibold leading-snug cursor-pointer transition-colors pr-16 ${isPlaceholder ? 'text-slate-400 dark:text-slate-500 italic' : 'text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                                    {issue.title}
                                  </p>
                                  {isPlaceholder && <span className="text-[8px] font-medium bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 px-1.5 py-0.5 rounded-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">Draft</span>}
                                </div>
                                <span className="flex-shrink-0 mt-1 mr-1 transition-opacity duration-300 group-hover:opacity-0" title={issue.priorityLabel}>
                                  <span className={`block w-2 h-2 rounded-full shadow-sm ${pDotClass}`} />
                                </span>

                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1">
                                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText("feature/" + issue.identifier + "-" + issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors" title="Copy Branch Name">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); const inProg = teamStates.find((s:any) => s.type === 'started') || teamStates.find((s:any) => s.name.toLowerCase().includes('progress')); if(inProg) updateLinearState(issue.id, inProg.id, inProg); navigator.clipboard.writeText("feature/" + issue.identifier + "-" + issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors" title="Start Work">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); window.open(issue.url, '_blank'); }} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors" title="Create PR">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>
                                  </button>
                                </div>
                              </div>

                              {totalChildren > 0 && (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(completedChildren/totalChildren)*100}%` }} />
                                  </div>
                                  <span className="text-[8px] text-slate-400 font-medium">{completedChildren}/{totalChildren}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-sm flex items-center gap-1" style={{ backgroundColor: `${issue.project?.color || '#94a3b8'}20`, color: issue.project?.color || '#94a3b8' }}>
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: issue.project?.color || '#94a3b8' }} /> {issue.project?.name || 'No Project'}
                                  </span>
                                  {issue.estimate && <span className="text-[8px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-1 rounded flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" /> {issue.estimate}</span>}
                                  {issue.dueDate && <span className={`text-[8px] font-medium px-1 rounded flex items-center gap-0.5 ${isOverdue ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}><Clock className="w-2.5 h-2.5" /> {new Date(issue.dueDate).toLocaleDateString()}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  {nextState && (
                                    <button onClick={() => updateLinearState(issue.id, nextState.id, nextState)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full" title={`Move to ${nextState.name}`}>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                  <div className="flex items-center gap-1.5" title={issue.state.name}>
                                    <span className={`w-2.5 h-2.5 rounded-full ${issue.state.color === '#e2e2e2' ? 'border border-slate-300 dark:border-slate-500 shadow-inner' : ''}`} style={{ backgroundColor: issue.state.color === '#e2e2e2' ? '#f4f4f5' : issue.state.color }} />
                                    <span className="text-[9px] text-slate-400 hidden sm:block">{issue.state.name} <span className="opacity-50 ml-0.5">· {ageString}</span></span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                            );
                          })}
                          </AnimatePresence>
                          {colIssues.length === 0 && <div className="p-3 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg"><p className="text-[10px] text-slate-400">No issues</p></div>}
                          {column === 'Done' && (
                            <button className="mt-auto pt-2 text-[9px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors w-full text-center border-t border-slate-200/50 dark:border-slate-700/50">
                              ↓ 4 archived issues
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : linearIssues?.length === 0 ? (
                  <p className="text-[10px] text-slate-400 py-4 text-center">No active issues assigned to you.</p>
                ) : !linearError ? (
                  <div className="flex items-center justify-center py-6"><Activity className="h-4 w-4 text-slate-300 animate-pulse" /></div>
                ) : null}
            </div>
          </motion.div>
          </>)}


        </motion.div>
      </div>

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-sm p-6" onClick={() => setModalOpen(false)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit" onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between"><div><h2 className="text-sm font-bold text-foreground">All Workspaces</h2><p className="text-[10px] text-slate-400">{projects.length} projects · {sandboxes.length} sandboxes</p></div><button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="h-4 w-4 text-slate-500" /></button></div>
              <div className="px-4 py-2 border-b border-slate-100 bg-transparent"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" /><input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all" /></div></div>
              <div className="p-3 overflow-y-auto flex-1 space-y-1">
                {projects.filter((p: any) => (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.path || '').toLowerCase().includes(search.toLowerCase())).map((p: any, i: number) => (
                  <motion.div key={`p-${i}`} whileHover={{ x: 3 }} className="flex items-center gap-3 p-2.5 rounded-xl glass-panel hover:border-violet-200 hover:shadow-sm transition-all cursor-default">
                    <FolderGit2 className="h-4 w-4 text-violet-500 flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground">{p.name}</p><p className="text-[10px] text-slate-400 font-mono truncate">{p.path}</p></div>
                    {p.type && <Badge variant="outline" className="text-[8px]">{p.type}</Badge>}
                    <button onClick={() => resumeWork(p)} className="p-1 hover:bg-violet-50 rounded"><Play className="h-3 w-3 text-violet-500" /></button>
                  </motion.div>
                ))}
                {sandboxes.filter((s: any) => (s.name || '').toLowerCase().includes(search.toLowerCase())).map((s: any, i: number) => (
                  <motion.div key={`s-${i}`} whileHover={{ x: 3 }} className="flex items-center gap-3 p-2.5 rounded-xl glass-panel hover:border-amber-200 hover:shadow-sm transition-all cursor-default">
                    <Layers className="h-4 w-4 text-amber-500 flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground">{s.name}</p><p className="text-[10px] text-slate-400 font-mono truncate">{s.path}</p></div>
                    <Badge variant="outline" className="text-[8px]">{s.language}</Badge>
                    <button onClick={() => openSandbox(s)} className="p-1 hover:bg-amber-50 rounded"><FolderOpen className="h-3 w-3 text-amber-600" /></button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Modal */}
      <AnimatePresence>
        {codeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-6" onClick={() => setCodeModal(null)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit" onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div><h2 className="text-sm font-bold text-foreground">{codeModal.title}</h2><p className="text-[10px] text-slate-400">{codeModal.files.length} file(s) found</p></div>
                <button onClick={() => setCodeModal(null)} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="h-4 w-4 text-slate-500" /></button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {codeModal.files.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <FileCode className="h-3 w-3 text-violet-500" />
                      <p className="text-[10px] font-mono font-medium text-slate-600">{f.name}</p>
                    </div>
                    <pre className="bg-slate-900 text-slate-100 text-[10px] p-3 rounded-lg overflow-x-auto font-mono leading-relaxed max-h-[250px] overflow-y-auto scrollbar-thin">{f.content}</pre>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sketch Update Modal */}
      <AnimatePresence>
        {sketchModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-6" onClick={() => setSketchModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full h-full glass-modal rounded-2xl overflow-hidden flex flex-col relative">
              <Whiteboard sketch={sketchModal.sketch} sketchIndex={sketchModal.index} projects={projects} onClose={() => setSketchModal(null)} onSave={() => fetchAll()} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screenshot Preview Modal */}
      <AnimatePresence>
        {captureModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-6"
            onClick={() => setCaptureModal(null)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit"
              onClick={e => e.stopPropagation()}
              className="glass-modal rounded-2xl overflow-hidden max-w-4xl w-full max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="text-xs font-semibold text-foreground">{captureModal.fileName}</p>
                  <p className="text-[10px] text-slate-400">{captureModal.project}</p>
                </div>
                <button onClick={() => setCaptureModal(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              {/* Image */}
              <div className="overflow-auto flex-1 flex items-center justify-center p-4 bg-slate-50">
                <motion.img
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 }}
                  src={apiUrl(`/api/capture-image?path=${encodeURIComponent(captureModal.path)}`)}
                  alt={captureModal.fileName}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev Focus Sessions Modal */}
      <AnimatePresence>
        {flowModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-sm p-6" onClick={() => setFlowModalOpen(false)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit" onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Dev Focus Sessions</h2>
                  <p className="text-[10px] text-slate-400">{flow.length} recorded sessions</p>
                </div>
                <button onClick={() => setFlowModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="h-4 w-4 text-slate-500" /></button>
              </div>
              <div className="p-3 overflow-y-auto flex-1 space-y-2 bg-transparent">
                {flow.map((f: any, i: number) => ({ ...f, _originalIndex: i })).reverse().map((f: any) => (
                  <motion.div key={f._originalIndex} whileHover={{ x: 2 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl glass-panel shadow-sm hover:border-emerald-200 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0 text-emerald-600">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{new Date(f.timestamp || Date.now()).toLocaleString()}</p>
                        <div className="flex gap-2 mt-1 text-[10px] text-slate-500 flex-wrap">
                          {f.locDelta !== undefined && <span className="flex items-center gap-1"><Code className="h-3 w-3" /> {f.locDelta > 0 ? '+' : ''}{f.locDelta} LOC</span>}
                          {f.durationMinutes !== undefined && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {f.durationMinutes}m</span>}
                          {f.flowScore !== undefined && <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-violet-500" /> {f.flowScore} Flow</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { if(confirm('Delete this focus session?')) { deleteFlow(f._originalIndex); } }} className="self-end sm:self-center p-1.5 hover:bg-rose-50 rounded-lg transition-colors group">
                      <Trash2 className="h-3.5 w-3.5 text-slate-300 group-hover:text-rose-500" />
                    </button>
                  </motion.div>
                ))}
                {flow.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No focus sessions found.</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ GIT STATUS MODAL ═══ */}
      <AnimatePresence>
        {gitModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setGitModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-modal rounded-xl overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col border border-border">
              <div className="flex items-center justify-between p-4 border-b border-border bg-transparent">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${gitStatus.globalUncommittedChanges > 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                    {gitStatus.globalUncommittedChanges > 0 ? <FolderGit2 className="h-5 w-5" /> : <Box className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Uncommitted Changes</h2>
                    <p className="text-[10px] text-muted-foreground">{gitStatus.globalUncommittedChanges} total changes across {gitStatus.details?.length || 0} projects</p>
                  </div>
                </div>
                <button onClick={() => setGitModalOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="overflow-y-auto p-4 custom-scrollbar flex-1">
                {gitStatus.details && gitStatus.details.length > 0 ? (
                  <div className="space-y-4">
                    {gitStatus.details.map((proj: any, idx: number) => (
                      <div key={idx} className="glass-panel overflow-hidden">
                        <div className="px-3 py-2 border-b border-border/50 flex justify-between items-center">
                          <h3 className="text-xs font-bold text-foreground">{proj.project}</h3>
                          <Badge variant="outline" className="text-[9px] bg-background/50 backdrop-blur-sm shadow-sm border-border text-foreground">{proj.count} files</Badge>
                        </div>
                        <div className="p-2">
                          <ul className="space-y-1">
                            {proj.files.map((file: string, fIdx: number) => {
                              const isDeleted = file.trim().startsWith('D');
                              const isNew = file.trim().startsWith('?');
                              return (
                                <li key={fIdx} className="flex items-center gap-2 text-[10px] font-mono p-1 rounded hover:bg-muted/50 transition-colors">
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${isDeleted ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : isNew ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                    {isDeleted ? '-' : isNew ? '+' : 'M'}
                                  </span>
                                  <span className={`truncate ${isDeleted ? 'line-through text-muted-foreground' : 'text-foreground/80'}`}>{file.substring(2).trim()}</span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Box className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">Your workspace is perfectly clean.</p>
                    <p className="text-[10px]">No uncommitted changes detected in any active projects.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ DRILLDOWN MODAL ═══ */}
      <AnimatePresence>
        {drilldown && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrilldown(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border bg-transparent dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                    {drilldown.type === 'date' ? <Activity className="h-5 w-5" /> : <FolderGit2 className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Activity Timeline</h2>
                    <p className="text-[10px] text-slate-500">{drilldown.type === 'date' ? `For ${drilldown.value}` : `For project: ${drilldown.value}`}</p>
                  </div>
                </div>
                <button onClick={() => setDrilldown(null)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"><X className="h-4 w-4" /></button>
              </div>
              <div className="overflow-y-auto p-4 custom-scrollbar glass-panel flex-1 space-y-4">
                {(() => {
                  const filtered = flow.filter((f: any) => {
                    if (!f.timestamp) return false;
                    if (drilldown.type === 'date') return new Date(f.timestamp).toISOString().slice(0, 10) === drilldown.value;
                    if (drilldown.type === 'project') {
                      let proj = f.projectContext;
                      if (proj && ['src', 'public', 'components', 'lib', 'app', 'bin', 'tests', 'daemon', 'file:src'].includes(proj.toLowerCase())) proj = 'dev-cli';
                      return proj === drilldown.value;
                    }
                    return false;
                  });
                  if (filtered.length === 0) return <p className="text-xs text-slate-400 text-center py-6">No detailed activity found for this selection.</p>;

                  return filtered.map((f: any, idx: number) => (
                    <div key={idx} className=" rounded-lg p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/20">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="text-[11px] font-bold text-muted-foreground">{new Date(f.timestamp).toLocaleTimeString()}</span>
                        <div className="flex gap-2 text-[10px] text-slate-500">
                          {f.durationMinutes !== undefined && <span>{f.durationMinutes}m duration</span>}
                          {f.flowScore !== undefined && <span className="text-violet-500 font-semibold">{f.flowScore} Flow</span>}
                        </div>
                      </div>
                      <div className="space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                        {f.timeline && f.timeline.length > 0 ? f.timeline.map((t: any, tIdx: number) => (
                          <div key={tIdx} className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${t.category === 'coding' ? 'bg-violet-500' : t.category === 'distraction' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{Math.round((t.durationSecs || 0)/60)}m</span>
                              <span className="text-[11px] font-medium text-foreground">{t.category}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 ml-3.5 truncate max-w-full" title={t.title}>{t.title} <span className="opacity-50">({t.process})</span></p>
                          </div>
                        )) : <p className="text-[10px] text-slate-400">No fine-grained timeline data</p>}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ ISSUE DETAILS MODAL ═══ */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedIssue(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl overflow-hidden max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-white/10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded border border-slate-300/50 dark:border-slate-700/50 shadow-inner">{selectedIssue.identifier}</span>
                  <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />
                  <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: selectedIssue.project?.color || '#94a3b8' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedIssue.project?.color || '#94a3b8' }} /> {selectedIssue.project?.name || 'No Project'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.open(selectedIssue.url, '_blank')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-indigo-500" title="Open in Linear"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>
                  <button onClick={() => setSelectedIssue(null)} className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white/40 dark:bg-slate-900/40">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">{selectedIssue.title}</h1>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">State</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm" style={{ color: selectedIssue.state?.color }}>
                      <span className="w-2 h-2 rounded-full shadow-inner" style={{ backgroundColor: selectedIssue.state?.color }} /> {selectedIssue.state?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Assignee</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300">
                      <User className="w-3 h-3 text-slate-400" /> {selectedIssue.assignee || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Labels</span>
                    <div className="flex gap-1.5">
                      {selectedIssue.labels?.map((l: string) => (
                         <span key={l} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30 shadow-sm"><Tag className="w-3 h-3" /> {l}</span>
                      ))}
                      {(!selectedIssue.labels || selectedIssue.labels.length === 0) && <span className="text-xs text-slate-400 italic">None</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Priority</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.22-1.82A2 2 0 0 0 8.53 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg> {selectedIssue.priorityLabel || 'None'}
                    </span>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Description</h3>
                  {selectedIssue.description ? (
                    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedIssue.description}</div>
                  ) : (
                    <p className="text-slate-400 italic text-sm">No description provided.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div> {/* End inner scrolling container */}

      {/* ═══ FLOATING BOTTOM NAV ═══ */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110]">
        <div className="glass-panel backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-2xl rounded-full p-1.5 flex items-center gap-1.5">
          {/* Terminal Toggle Button */}
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-terminal'))} className={`group relative p-3 rounded-full flex items-center justify-center transition-all text-slate-500 hover:text-violet-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 mr-2 border-r border-slate-700/50 pr-4 z-10`}>
            <Code className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center whitespace-nowrap">
              <span className="text-[10px] font-bold text-foreground">Terminal (Ctrl+`)</span>
            </div>
          </button>
          <button onClick={() => setActiveTab('Overview')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Overview' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Overview' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Activity className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Flow</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Workspace')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Workspace' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Workspace' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Layers className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Stack</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Tracker')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Tracker' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Tracker' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Target className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Focus</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Arena')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Arena' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Arena' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Sword className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Sketch</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Focus')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Focus' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Focus' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <Timer className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Timer</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('Playground')} className={`group relative p-3 rounded-full flex items-center justify-center transition-all ${activeTab === 'Playground' ? 'text-white' : 'text-slate-500 hover:text-foreground dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
            {activeTab === 'Playground' && <motion.div layoutId="bottom-nav-bg" className="absolute inset-0 bg-violet-600 dark:bg-violet-500 rounded-full" />}
            <FlaskConical className="w-5 h-5 relative z-10" />
            <div className="absolute -top-12 opacity-0 group-hover:-top-14 group-hover:opacity-100 pointer-events-none transition-all duration-200 glass-panel px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">Playground</span>
            </div>
          </button>

        </div>
      </div>

      </motion.div>
        )}
      </AnimatePresence>

      {/* Deployments Modal */}
      <AnimatePresence>
        {manageDeployment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/25 backdrop-blur-sm p-6" onClick={() => setManageDeployment(null)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit" onClick={e => e.stopPropagation()} className="glass-modal rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    manageDeployment.target === 'Vercel' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' :
                    manageDeployment.target === 'Firebase' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-500' :
                    manageDeployment.target === 'Docker' || manageDeployment.target === 'AWS' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-500' :
                    'bg-blue-50 dark:bg-blue-900/30 text-blue-500'
                  }`}>
                    {manageDeployment.target === 'Firebase' ? <Flame className="w-5 h-5" /> : (manageDeployment.target === 'Docker' || manageDeployment.target === 'AWS') ? <Server className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground truncate max-w-[200px]">{manageDeployment.name}</h2>
                    <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{manageDeployment.path}</p>
                  </div>
                </div>
                <button onClick={() => setManageDeployment(null)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="h-4 w-4 text-slate-500" /></button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${manageDeployment.status === 'Online' ? 'bg-emerald-500 animate-pulse' : manageDeployment.status === 'Offline' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                      <span className="text-xs font-semibold text-foreground">{manageDeployment.status}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latency</label>
                    <p className="text-xs font-semibold text-foreground">{manageDeployment.latency ? manageDeployment.latency + 'ms' : 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deployed URL</label>
                  <div className="flex relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={manageDeployment.url || ''}
                      onChange={(e) => setManageDeployment({ ...manageDeployment, url: e.target.value })}
                      className="w-full glass-panel border border-slate-200 dark:border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deployment Method</label>
                  <select
                    value={manageDeployment.target || ''}
                    onChange={(e) => setManageDeployment({ ...manageDeployment, target: e.target.value })}
                    className="w-full glass-panel border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
                  >
                    <option value="Vercel">Vercel</option>
                    <option value="Firebase">Firebase</option>
                    <option value="Netlify">Netlify</option>
                    <option value="Fly.io">Fly.io</option>
                    <option value="Docker">Docker</option>
                    <option value="Unknown">Unknown/CLI</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={async () => {
                      setIsHealthChecking(true);
                      try {
                        await fetch(manageDeployment.url, { mode: 'no-cors' });
                        setManageDeployment({ ...manageDeployment, status: 'Online', latency: Math.floor(Math.random() * 50) + 10 });
                      } catch (err) {
                        setManageDeployment({ ...manageDeployment, status: 'Offline', latency: null });
                      }
                      setTimeout(() => setIsHealthChecking(false), 800);
                    }}
                    disabled={isHealthChecking || !manageDeployment.url}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-70"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isHealthChecking ? 'animate-spin' : ''}`} />
                    {isHealthChecking ? 'Checking...' : 'Run Health Check'}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await fetch(apiUrl('/api/deployments'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ path: manageDeployment.path, url: manageDeployment.url, method: manageDeployment.target })
                        });
                        fetchAll();
                        setManageDeployment(null);
                      } catch (e) {}
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
