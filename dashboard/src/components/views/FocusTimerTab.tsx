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

export default function FocusTimerTab() {
  const state = useGlobalApp();
  // We destructure everything from state since this is a massive legacy file
  const { isAppVisible, setIsAppVisible, setupRequired, setSetupRequired, devosSettings, setDevosSettings, data, setData, modalOpen, setModalOpen, search, setSearch, codeModal, setCodeModal, sketchModal, setSketchModal, captureModal, setCaptureModal, flowModalOpen, setFlowModalOpen, timeChartType, setTimeChartType, topicView, setTopicView, gitModalOpen, setGitModalOpen, theme, setTheme, arenaTab, setArenaTab, drilldown, setDrilldown, linearIssues, setLinearIssues, linearError, setLinearError, linearProjectFilter, setLinearProjectFilter, linearSortBy, setLinearSortBy, newIssueTitle, setNewIssueTitle, isCreatingIssue, setIsCreatingIssue, activeTab, setActiveTab, assetTab, setAssetTab, assetPage, setAssetPage, assetSearch, setAssetSearch, manageDeployment, setManageDeployment, isHealthChecking, setIsHealthChecking, createNewSketch, assetSort, setAssetSort, sortOpen, setSortOpen, draggedIssueId, setDraggedIssueId, linearProjectOpen, setLinearProjectOpen, linearSortOpen, setLinearSortOpen, linearSearchTerm, setLinearSearchTerm, linearAssigneeFilter, setLinearAssigneeFilter, linearLabelFilter, setLinearLabelFilter, linearAssigneeOpen, setLinearAssigneeOpen, linearLabelOpen, setLinearLabelOpen, selectedIssue, setSelectedIssue, focusLive, setFocusLive, focusRunning, setFocusRunning, focusDurationInput, setFocusDurationInput, focusTarget, setFocusTarget, showWindowSelector, setShowWindowSelector, showQRCode, setShowQRCode, showRemoteQRCode, setShowRemoteQRCode, focusStarting, setFocusStarting, sessionJustEnded, setSessionJustEnded, showReportModal, setShowReportModal, isGeneratingReport, setIsGeneratingReport, localIp, setLocalIp, tunnelUrl, setTunnelUrl, generateReport, startFocusSession, handleCreateIssue, handleDrop, updateLinearState, fetchAll, flow, practice, projects, sandboxes, sketches, captures, totalLoc, totalMin, totalHrs, totalCoding, totalResearch, totalDistraction, totalIdle, techstack, gitStatus, deployments, nowMs, weekMs, inLast7, inPrev7, curLoc, prevLoc, trendLoc, curMin, prevMin, trendHrs, flowScores, avgFlow, curFlowScores, prevFlowScores, curAvgFlow, prevAvgFlow, trendFlow, solved, totalPMin, langs, pracWithAcc, avgAcc, curPrac, prevPrac, curAvgAcc, prevAvgAcc, trendAcc, projTimeMap, projTimeBars, techstackBars, dayCounts, today, daysBack, startDate, hmData, startMs, activeDayCount, streak, topicC, diffC, topicBars, diffPie, timePie, timeBar, timeRadar, flowTL, locTL, radarData, recentSubs, resumeTarget, deleteFlow, openCode, resumeWork, openSandbox, remoteDashboardUrl } = state;

  const fadeUp: any = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
  const cV: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } } };
  const iV: any = { hidden: { opacity: 0, y: 14, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } } };

  return (
    <>
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
           </>
  );
}
