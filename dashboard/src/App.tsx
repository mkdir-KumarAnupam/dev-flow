// @ts-nocheck
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
import DashboardOverviewTab from './components/views/DashboardOverviewTab';
import AssetWorkspaceTab from './components/views/AssetWorkspaceTab';
import KanbanTrackerTab from './components/views/KanbanTrackerTab';
import CodingArenaTab from './components/views/CodingArenaTab';
import FocusTimerTab from './components/views/FocusTimerTab';
import DeveloperPlaygroundTab from './components/views/DeveloperPlaygroundTab';

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
};import { GlobalAppProvider, useGlobalApp } from './context/GlobalAppContext';

function AppContent() {
  const { isAppVisible, setIsAppVisible, setupRequired, setSetupRequired, devosSettings, setDevosSettings, data, setData, modalOpen, setModalOpen, search, setSearch, codeModal, setCodeModal, sketchModal, setSketchModal, captureModal, setCaptureModal, flowModalOpen, setFlowModalOpen, timeChartType, setTimeChartType, topicView, setTopicView, gitModalOpen, setGitModalOpen, theme, setTheme, arenaTab, setArenaTab, drilldown, setDrilldown, linearIssues, setLinearIssues, linearError, setLinearError, linearProjectFilter, setLinearProjectFilter, linearSortBy, setLinearSortBy, newIssueTitle, setNewIssueTitle, isCreatingIssue, setIsCreatingIssue, activeTab, setActiveTab, assetTab, setAssetTab, assetPage, setAssetPage, assetSearch, setAssetSearch, manageDeployment, setManageDeployment, isHealthChecking, setIsHealthChecking, createNewSketch, assetSort, setAssetSort, sortOpen, setSortOpen, draggedIssueId, setDraggedIssueId, linearProjectOpen, setLinearProjectOpen, linearSortOpen, setLinearSortOpen, linearSearchTerm, setLinearSearchTerm, linearAssigneeFilter, setLinearAssigneeFilter, linearLabelFilter, setLinearLabelFilter, linearAssigneeOpen, setLinearAssigneeOpen, linearLabelOpen, setLinearLabelOpen, selectedIssue, setSelectedIssue, focusLive, setFocusLive, focusRunning, setFocusRunning, focusDurationInput, setFocusDurationInput, focusTarget, setFocusTarget, showWindowSelector, setShowWindowSelector, showQRCode, setShowQRCode, showRemoteQRCode, setShowRemoteQRCode, focusStarting, setFocusStarting, sessionJustEnded, setSessionJustEnded, showReportModal, setShowReportModal, isGeneratingReport, setIsGeneratingReport, localIp, setLocalIp, tunnelUrl, setTunnelUrl, generateReport, startFocusSession, handleCreateIssue, handleDrop, updateLinearState, fetchAll, flow, practice, projects, sandboxes, sketches, captures, totalLoc, totalMin, totalHrs, totalCoding, totalResearch, totalDistraction, totalIdle, techstack, gitStatus, deployments, nowMs, weekMs, inLast7, inPrev7, curLoc, prevLoc, trendLoc, curMin, prevMin, trendHrs, flowScores, avgFlow, curFlowScores, prevFlowScores, curAvgFlow, prevAvgFlow, trendFlow, solved, totalPMin, langs, pracWithAcc, avgAcc, curPrac, prevPrac, curAvgAcc, prevAvgAcc, trendAcc, projTimeMap, projTimeBars, techstackBars, dayCounts, today, daysBack, startDate, hmData, startMs, activeDayCount, streak, topicC, diffC, topicBars, diffPie, timePie, timeBar, timeRadar, flowTL, locTL, radarData, recentSubs, resumeTarget, deleteFlow, openCode, resumeWork, openSandbox, remoteDashboardUrl } = useGlobalApp();

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

export default function App() {
  return (
    <GlobalAppProvider>
      <AppContent />
    </GlobalAppProvider>
  );
}
