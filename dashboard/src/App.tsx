// @ts-nocheck
import { useEffect, useState, } from 'react';

import { Code, Clock, FolderGit2, Search, X, Flame, Target, Zap, Camera, Layers, Activity, Play, Trash2, FileCode, FolderOpen, Box, Sun, Sunset, Moon, Sword, Timer, User, Tag, FlaskConical, Cloud, Globe, Server, RefreshCw, Wifi } from 'lucide-react';
const API_BASE =
  typeof window !== 'undefined' &&
  window.location.protocol.startsWith('http') &&
  window.location.port !== '5173'
    ? window.location.origin
    : 'http://localhost:4000';
const apiUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
const isElectronRuntime = () =>
  typeof window !== 'undefined' && typeof (window as any).require === 'function';

import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from 'qrcode.react';

import SetupOnboardingScreen from './components/features/SetupOnboardingScreen';
import DashboardOverviewTab from './components/views/DashboardOverviewTab';
import AssetWorkspaceTab from './components/views/AssetWorkspaceTab';
import KanbanTrackerTab from './components/views/KanbanTrackerTab';
import CodingArenaTab from './components/views/CodingArenaTab';
import FocusTimerTab from './components/views/FocusTimerTab';
import DeveloperPlaygroundTab from './components/views/DeveloperPlaygroundTab';

import GlobalCommandPalette from './components/features/GlobalCommandPalette';

import GlobalModals from './components/features/GlobalModals';
import FloatingBottomNav from './components/features/FloatingBottomNav';


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

            {/* ═══ HEADER ═══ */}<AnimatePresence mode="wait">
            {activeTab === 'Overview' && <DashboardOverviewTab />}
            {activeTab === 'Workspace' && <AssetWorkspaceTab />}
            {activeTab === 'Tracker' && <KanbanTrackerTab />}
            {activeTab === 'Arena' && <CodingArenaTab />}
            {activeTab === 'Focus' && <FocusTimerTab />}
            {activeTab === 'Playground' && <DeveloperPlaygroundTab />}
          </AnimatePresence>

        </motion.div>
      </div>

      {/* ═══ MODALS ═══ */}
      <GlobalModals /></div> {/* End inner scrolling container */}

      {/* ═══ FLOATING BOTTOM NAV ═══ */}
        <FloatingBottomNav />
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
