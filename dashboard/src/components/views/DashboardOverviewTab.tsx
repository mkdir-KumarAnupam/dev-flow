// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGlobalApp } from '../../context/GlobalAppContext';
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
import TrendArrowIcon from '../ui/TrendArrowIcon';
import MetricCard from '../ui/MetricCard';
import SectionHeader from '../ui/SectionHeader';
import LiveDateTimeClock from '../ui/LiveDateTimeClock';
import ActivityHeatmapGrid from '../ui/ActivityHeatmapGrid';
import RaceMode from '../../RaceMode';
import WarMode from '../../WarMode';
import SystemDesignMode from '../../SystemDesignMode';
import Whiteboard from '../../Whiteboard';
import CompetitiveMode from '../../CompetitiveMode';
import Playground from '../../Playground';


const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getGreetingIcon = () => {
  const hour = new Date().getHours();
  if (hour < 12) return <Sun className="w-5 h-5" />;
  if (hour < 18) return <Sun className="w-5 h-5 text-amber-500" />;
  return <Moon className="w-5 h-5" />;
};

export default function DashboardOverviewTab() {
  const state = useGlobalApp();
  // We destructure everything from state since this is a massive legacy file
  const { isAppVisible, setIsAppVisible, setupRequired, setSetupRequired, devosSettings, setDevosSettings, data, setData, modalOpen, setModalOpen, search, setSearch, codeModal, setCodeModal, sketchModal, setSketchModal, captureModal, setCaptureModal, flowModalOpen, setFlowModalOpen, timeChartType, setTimeChartType, topicView, setTopicView, gitModalOpen, setGitModalOpen, theme, setTheme, arenaTab, setArenaTab, drilldown, setDrilldown, linearIssues, setLinearIssues, linearError, setLinearError, linearProjectFilter, setLinearProjectFilter, linearSortBy, setLinearSortBy, newIssueTitle, setNewIssueTitle, isCreatingIssue, setIsCreatingIssue, activeTab, setActiveTab, assetTab, setAssetTab, assetPage, setAssetPage, assetSearch, setAssetSearch, manageDeployment, setManageDeployment, isHealthChecking, setIsHealthChecking, createNewSketch, assetSort, setAssetSort, sortOpen, setSortOpen, draggedIssueId, setDraggedIssueId, linearProjectOpen, setLinearProjectOpen, linearSortOpen, setLinearSortOpen, linearSearchTerm, setLinearSearchTerm, linearAssigneeFilter, setLinearAssigneeFilter, linearLabelFilter, setLinearLabelFilter, linearAssigneeOpen, setLinearAssigneeOpen, linearLabelOpen, setLinearLabelOpen, selectedIssue, setSelectedIssue, focusLive, setFocusLive, focusRunning, setFocusRunning, focusDurationInput, setFocusDurationInput, focusTarget, setFocusTarget, showWindowSelector, setShowWindowSelector, showQRCode, setShowQRCode, showRemoteQRCode, setShowRemoteQRCode, focusStarting, setFocusStarting, sessionJustEnded, setSessionJustEnded, showReportModal, setShowReportModal, isGeneratingReport, setIsGeneratingReport, localIp, setLocalIp, tunnelUrl, setTunnelUrl, generateReport, startFocusSession, handleCreateIssue, handleDrop, updateLinearState, fetchAll, flow, practice, projects, sandboxes, sketches, captures, totalLoc, totalMin, totalHrs, totalCoding, totalResearch, totalDistraction, totalIdle, techstack, gitStatus, deployments, nowMs, weekMs, inLast7, inPrev7, curLoc, prevLoc, trendLoc, curMin, prevMin, trendHrs, flowScores, avgFlow, curFlowScores, prevFlowScores, curAvgFlow, prevAvgFlow, trendFlow, solved, totalPMin, langs, pracWithAcc, avgAcc, curPrac, prevPrac, curAvgAcc, prevAvgAcc, trendAcc, projTimeMap, projTimeBars, techstackBars, dayCounts, today, daysBack, startDate, hmData, startMs, activeDayCount, streak, topicC, diffC, topicBars, diffPie, timePie, timeBar, timeRadar, flowTL, locTL, radarData, recentSubs, resumeTarget, deleteFlow, openCode, resumeWork, openSandbox, remoteDashboardUrl } = state;

  const fadeUp: any = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
  const cV: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } } };
  const iV: any = { hidden: { opacity: 0, y: 14, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } } };

  return (
    <>
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
    </>
  );
}
