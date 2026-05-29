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

export default function CodingArenaTab() {
  const state = useGlobalApp();
  // We destructure everything from state since this is a massive legacy file
  const { isAppVisible, setIsAppVisible, setupRequired, setSetupRequired, devosSettings, setDevosSettings, data, setData, modalOpen, setModalOpen, search, setSearch, codeModal, setCodeModal, sketchModal, setSketchModal, captureModal, setCaptureModal, flowModalOpen, setFlowModalOpen, timeChartType, setTimeChartType, topicView, setTopicView, gitModalOpen, setGitModalOpen, theme, setTheme, arenaTab, setArenaTab, drilldown, setDrilldown, linearIssues, setLinearIssues, linearError, setLinearError, linearProjectFilter, setLinearProjectFilter, linearSortBy, setLinearSortBy, newIssueTitle, setNewIssueTitle, isCreatingIssue, setIsCreatingIssue, activeTab, setActiveTab, assetTab, setAssetTab, assetPage, setAssetPage, assetSearch, setAssetSearch, manageDeployment, setManageDeployment, isHealthChecking, setIsHealthChecking, createNewSketch, assetSort, setAssetSort, sortOpen, setSortOpen, draggedIssueId, setDraggedIssueId, linearProjectOpen, setLinearProjectOpen, linearSortOpen, setLinearSortOpen, linearSearchTerm, setLinearSearchTerm, linearAssigneeFilter, setLinearAssigneeFilter, linearLabelFilter, setLinearLabelFilter, linearAssigneeOpen, setLinearAssigneeOpen, linearLabelOpen, setLinearLabelOpen, selectedIssue, setSelectedIssue, focusLive, setFocusLive, focusRunning, setFocusRunning, focusDurationInput, setFocusDurationInput, focusTarget, setFocusTarget, showWindowSelector, setShowWindowSelector, showQRCode, setShowQRCode, showRemoteQRCode, setShowRemoteQRCode, focusStarting, setFocusStarting, sessionJustEnded, setSessionJustEnded, showReportModal, setShowReportModal, isGeneratingReport, setIsGeneratingReport, localIp, setLocalIp, tunnelUrl, setTunnelUrl, generateReport, startFocusSession, handleCreateIssue, handleDrop, updateLinearState, fetchAll, flow, practice, projects, sandboxes, sketches, captures, totalLoc, totalMin, totalHrs, totalCoding, totalResearch, totalDistraction, totalIdle, techstack, gitStatus, deployments, nowMs, weekMs, inLast7, inPrev7, curLoc, prevLoc, trendLoc, curMin, prevMin, trendHrs, flowScores, avgFlow, curFlowScores, prevFlowScores, curAvgFlow, prevAvgFlow, trendFlow, solved, totalPMin, langs, pracWithAcc, avgAcc, curPrac, prevPrac, curAvgAcc, prevAvgAcc, trendAcc, projTimeMap, projTimeBars, techstackBars, dayCounts, today, daysBack, startDate, hmData, startMs, activeDayCount, streak, topicC, diffC, topicBars, diffPie, timePie, timeBar, timeRadar, flowTL, locTL, radarData, recentSubs, resumeTarget, deleteFlow, openCode, resumeWork, openSandbox, remoteDashboardUrl } = state;

  const fadeUp: any = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
  const cV: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } } };
  const iV: any = { hidden: { opacity: 0, y: 14, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } } };

  return (
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
  );
}
