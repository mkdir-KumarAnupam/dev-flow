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

export default function KanbanTrackerTab() {
  const state = useGlobalApp();
  // We destructure everything from state since this is a massive legacy file
  const { isAppVisible, setIsAppVisible, setupRequired, setSetupRequired, devosSettings, setDevosSettings, data, setData, modalOpen, setModalOpen, search, setSearch, codeModal, setCodeModal, sketchModal, setSketchModal, captureModal, setCaptureModal, flowModalOpen, setFlowModalOpen, timeChartType, setTimeChartType, topicView, setTopicView, gitModalOpen, setGitModalOpen, theme, setTheme, arenaTab, setArenaTab, drilldown, setDrilldown, linearIssues, setLinearIssues, linearError, setLinearError, linearProjectFilter, setLinearProjectFilter, linearSortBy, setLinearSortBy, newIssueTitle, setNewIssueTitle, isCreatingIssue, setIsCreatingIssue, activeTab, setActiveTab, assetTab, setAssetTab, assetPage, setAssetPage, assetSearch, setAssetSearch, manageDeployment, setManageDeployment, isHealthChecking, setIsHealthChecking, createNewSketch, assetSort, setAssetSort, sortOpen, setSortOpen, draggedIssueId, setDraggedIssueId, linearProjectOpen, setLinearProjectOpen, linearSortOpen, setLinearSortOpen, linearSearchTerm, setLinearSearchTerm, linearAssigneeFilter, setLinearAssigneeFilter, linearLabelFilter, setLinearLabelFilter, linearAssigneeOpen, setLinearAssigneeOpen, linearLabelOpen, setLinearLabelOpen, selectedIssue, setSelectedIssue, focusLive, setFocusLive, focusRunning, setFocusRunning, focusDurationInput, setFocusDurationInput, focusTarget, setFocusTarget, showWindowSelector, setShowWindowSelector, showQRCode, setShowQRCode, showRemoteQRCode, setShowRemoteQRCode, focusStarting, setFocusStarting, sessionJustEnded, setSessionJustEnded, showReportModal, setShowReportModal, isGeneratingReport, setIsGeneratingReport, localIp, setLocalIp, tunnelUrl, setTunnelUrl, generateReport, startFocusSession, handleCreateIssue, handleDrop, updateLinearState, fetchAll, flow, practice, projects, sandboxes, sketches, captures, totalLoc, totalMin, totalHrs, totalCoding, totalResearch, totalDistraction, totalIdle, techstack, gitStatus, deployments, nowMs, weekMs, inLast7, inPrev7, curLoc, prevLoc, trendLoc, curMin, prevMin, trendHrs, flowScores, avgFlow, curFlowScores, prevFlowScores, curAvgFlow, prevAvgFlow, trendFlow, solved, totalPMin, langs, pracWithAcc, avgAcc, curPrac, prevPrac, curAvgAcc, prevAvgAcc, trendAcc, projTimeMap, projTimeBars, techstackBars, dayCounts, today, daysBack, startDate, hmData, startMs, activeDayCount, streak, topicC, diffC, topicBars, diffPie, timePie, timeBar, timeRadar, flowTL, locTL, radarData, recentSubs, resumeTarget, deleteFlow, openCode, resumeWork, openSandbox, remoteDashboardUrl } = state;

  const fadeUp: any = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
  const cV: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } } };
  const iV: any = { hidden: { opacity: 0, y: 14, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } } };

  return (
    <>
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
          </>
  );
}
