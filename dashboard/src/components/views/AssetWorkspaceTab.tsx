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

export default function AssetWorkspaceTab() {
  const state = useGlobalApp();
  // We destructure everything from state since this is a massive legacy file
  const { tunnelingProject, setTunnelingProject, securityManagerOpen, setSecurityManagerOpen, isAppVisible, setIsAppVisible, setupRequired, setSetupRequired, devosSettings, setDevosSettings, data, setData, modalOpen, setModalOpen, search, setSearch, codeModal, setCodeModal, sketchModal, setSketchModal, captureModal, setCaptureModal, flowModalOpen, setFlowModalOpen, timeChartType, setTimeChartType, topicView, setTopicView, gitModalOpen, setGitModalOpen, theme, setTheme, arenaTab, setArenaTab, drilldown, setDrilldown, linearIssues, setLinearIssues, linearError, setLinearError, linearProjectFilter, setLinearProjectFilter, linearSortBy, setLinearSortBy, newIssueTitle, setNewIssueTitle, isCreatingIssue, setIsCreatingIssue, activeTab, setActiveTab, assetTab, setAssetTab, assetPage, setAssetPage, assetSearch, setAssetSearch, manageDeployment, setManageDeployment, isHealthChecking, setIsHealthChecking, createNewSketch, assetSort, setAssetSort, sortOpen, setSortOpen, draggedIssueId, setDraggedIssueId, linearProjectOpen, setLinearProjectOpen, linearSortOpen, setLinearSortOpen, linearSearchTerm, setLinearSearchTerm, linearAssigneeFilter, setLinearAssigneeFilter, linearLabelFilter, setLinearLabelFilter, linearAssigneeOpen, setLinearAssigneeOpen, linearLabelOpen, setLinearLabelOpen, selectedIssue, setSelectedIssue, focusLive, setFocusLive, focusRunning, setFocusRunning, focusDurationInput, setFocusDurationInput, focusTarget, setFocusTarget, showWindowSelector, setShowWindowSelector, showQRCode, setShowQRCode, showRemoteQRCode, setShowRemoteQRCode, focusStarting, setFocusStarting, sessionJustEnded, setSessionJustEnded, showReportModal, setShowReportModal, isGeneratingReport, setIsGeneratingReport, localIp, setLocalIp, tunnelUrl, setTunnelUrl, generateReport, startFocusSession, handleCreateIssue, handleDrop, updateLinearState, fetchAll, flow, practice, projects, sandboxes, sketches, captures, totalLoc, totalMin, totalHrs, totalCoding, totalResearch, totalDistraction, totalIdle, techstack, gitStatus, deployments, nowMs, weekMs, inLast7, inPrev7, curLoc, prevLoc, trendLoc, curMin, prevMin, trendHrs, flowScores, avgFlow, curFlowScores, prevFlowScores, curAvgFlow, prevAvgFlow, trendFlow, solved, totalPMin, langs, pracWithAcc, avgAcc, curPrac, prevPrac, curAvgAcc, prevAvgAcc, trendAcc, projTimeMap, projTimeBars, techstackBars, dayCounts, today, daysBack, startDate, hmData, startMs, activeDayCount, streak, topicC, diffC, topicBars, diffPie, timePie, timeBar, timeRadar, flowTL, locTL, radarData, recentSubs, resumeTarget, deleteFlow, openCode, resumeWork, openSandbox, remoteDashboardUrl } = state;

  const [deploymentsPage, setDeploymentsPage] = useState(0);
  const DEPLOYMENTS_PER_PAGE = 4;

  const fadeUp: any = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
  const cV: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } } };
  const iV: any = { hidden: { opacity: 0, y: 14, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } } };

  return (
    <>
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
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 z-20">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setTunnelingProject(p.path); }}
                                      className="bg-white dark:bg-slate-700 shadow-md p-2 rounded-full border border-slate-100 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                      title="Expose Local Tunnel"
                                    >
                                      <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); resumeWork(p); }}
                                      className="bg-white dark:bg-slate-700 shadow-md p-2 rounded-full border border-slate-100 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                      title="Resume Work"
                                    >
                                      <Play className="h-4 w-4 text-violet-600 dark:text-violet-400 ml-0.5" />
                                    </button>
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
                <CardContent className="flex-1 overflow-y-auto space-y-2 pb-2">
                  {deployments.length > 0 ? deployments.slice(deploymentsPage * DEPLOYMENTS_PER_PAGE, (deploymentsPage + 1) * DEPLOYMENTS_PER_PAGE).map((d: any, i: number) => (
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
                {deployments.length > DEPLOYMENTS_PER_PAGE && (
                  <div className="flex justify-center items-center gap-1.5 pb-2 pt-0.5">
                    {Array.from({ length: Math.ceil(deployments.length / DEPLOYMENTS_PER_PAGE) }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDeploymentsPage(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${deploymentsPage === idx ? 'bg-violet-500 scale-125' : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'}`}
                      />
                    ))}
                  </div>
                )}
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
  );
}
