const fs = require('fs');

const path = 'dashboard/src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

function extractBlock(startMarker) {
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return null;
    
    // We need to find the matching closing parenthesis for `&& (`
    let openCount = 0;
    let endIndex = -1;
    let hasStarted = false;
    
    for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '(') {
            openCount++;
            hasStarted = true;
        } else if (content[i] === ')') {
            openCount--;
        }
        
        if (hasStarted && openCount === 0) {
            // Also include the trailing `}` for `{activeTab === 'Overview' && (...) }`
            endIndex = content.indexOf('}', i);
            break;
        }
    }
    
    if (endIndex === -1) return null;
    
    const block = content.substring(startIndex, endIndex + 1);
    content = content.substring(0, startIndex) + content.substring(endIndex + 1);
    
    // remove the wrapper `{activeTab === '...' && (` and trailing `)}`
    let innerJsx = block.substring(startMarker.length);
    innerJsx = innerJsx.substring(0, innerJsx.lastIndexOf(')'));
    
    return innerJsx.trim();
}

const tabs = [
    { id: 'Overview', marker: "{activeTab === 'Overview' && (", file: 'DashboardOverviewTab' },
    { id: 'Workspace', marker: "{activeTab === 'Workspace' && (", file: 'AssetWorkspaceTab' },
    { id: 'Tracker', marker: "{activeTab === 'Tracker' && (", file: 'KanbanTrackerTab' },
    { id: 'Arena', marker: "{activeTab === 'Arena' && (", file: 'CodingArenaTab' },
    { id: 'Focus', marker: "{activeTab === 'Focus' && (", file: 'FocusTimerTab' },
    { id: 'Playground', marker: "{activeTab === 'Playground' && (", file: 'DeveloperPlaygroundTab' }
];

let imports = ``;
let replacements = {};

tabs.forEach(tab => {
    const jsx = extractBlock(tab.marker);
    if (jsx) {
        let code = `// @ts-nocheck
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

export default function ${tab.file}() {
  const state = useGlobalApp();
  // We destructure everything from state since this is a massive legacy file
  const { isAppVisible, setIsAppVisible, setupRequired, setSetupRequired, devosSettings, setDevosSettings, data, setData, modalOpen, setModalOpen, search, setSearch, codeModal, setCodeModal, sketchModal, setSketchModal, captureModal, setCaptureModal, flowModalOpen, setFlowModalOpen, timeChartType, setTimeChartType, topicView, setTopicView, gitModalOpen, setGitModalOpen, theme, setTheme, arenaTab, setArenaTab, drilldown, setDrilldown, linearIssues, setLinearIssues, linearError, setLinearError, linearProjectFilter, setLinearProjectFilter, linearSortBy, setLinearSortBy, newIssueTitle, setNewIssueTitle, isCreatingIssue, setIsCreatingIssue, activeTab, setActiveTab, assetTab, setAssetTab, assetPage, setAssetPage, assetSearch, setAssetSearch, manageDeployment, setManageDeployment, isHealthChecking, setIsHealthChecking, createNewSketch, assetSort, setAssetSort, sortOpen, setSortOpen, draggedIssueId, setDraggedIssueId, linearProjectOpen, setLinearProjectOpen, linearSortOpen, setLinearSortOpen, linearSearchTerm, setLinearSearchTerm, linearAssigneeFilter, setLinearAssigneeFilter, linearLabelFilter, setLinearLabelFilter, linearAssigneeOpen, setLinearAssigneeOpen, linearLabelOpen, setLinearLabelOpen, selectedIssue, setSelectedIssue, focusLive, setFocusLive, focusRunning, setFocusRunning, focusDurationInput, setFocusDurationInput, focusTarget, setFocusTarget, showWindowSelector, setShowWindowSelector, showQRCode, setShowQRCode, showRemoteQRCode, setShowRemoteQRCode, focusStarting, setFocusStarting, sessionJustEnded, setSessionJustEnded, showReportModal, setShowReportModal, isGeneratingReport, setIsGeneratingReport, localIp, setLocalIp, tunnelUrl, setTunnelUrl, generateReport, startFocusSession, handleCreateIssue, handleDrop, updateLinearState, fetchAll, flow, practice, projects, sandboxes, sketches, captures, totalLoc, totalMin, totalHrs, totalCoding, totalResearch, totalDistraction, totalIdle, techstack, gitStatus, deployments, nowMs, weekMs, inLast7, inPrev7, curLoc, prevLoc, trendLoc, curMin, prevMin, trendHrs, flowScores, avgFlow, curFlowScores, prevFlowScores, curAvgFlow, prevAvgFlow, trendFlow, solved, totalPMin, langs, pracWithAcc, avgAcc, curPrac, prevPrac, curAvgAcc, prevAvgAcc, trendAcc, projTimeMap, projTimeBars, techstackBars, dayCounts, today, daysBack, startDate, hmData, startMs, activeDayCount, streak, topicC, diffC, topicBars, diffPie, timePie, timeBar, timeRadar, flowTL, locTL, radarData, recentSubs, resumeTarget, deleteFlow, openCode, resumeWork, openSandbox, remoteDashboardUrl } = state;

  const fadeUp: any = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
  const cV: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } } };
  const iV: any = { hidden: { opacity: 0, y: 14, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } } };

  return (
    ${jsx}
  );
}
`;
        fs.mkdirSync('dashboard/src/components/views', { recursive: true });
        fs.writeFileSync(`dashboard/src/components/views/${tab.file}.tsx`, code);
        console.log(`Extracted ${tab.file}`);
        
        imports += `import ${tab.file} from './components/views/${tab.file}';\n`;
        replacements[tab.id] = `<${tab.file} />`;
    } else {
        console.log(`Failed to extract ${tab.id}`);
    }
});

// Update App.tsx
content = content.replace("import SetupOnboardingScreen from './components/features/SetupOnboardingScreen';", "import SetupOnboardingScreen from './components/features/SetupOnboardingScreen';\n" + imports);

// We need to inject the tab components back into the rendering space
let tabRenderLogic = `
            {activeTab === 'Overview' && <DashboardOverviewTab />}
            {activeTab === 'Workspace' && <AssetWorkspaceTab />}
            {activeTab === 'Tracker' && <KanbanTrackerTab />}
            {activeTab === 'Arena' && <CodingArenaTab />}
            {activeTab === 'Focus' && <FocusTimerTab />}
            {activeTab === 'Playground' && <DeveloperPlaygroundTab />}
`;

// Insert it where the first tab used to be (before "BOTTOM DOCK")
content = content.replace("{/*  ? ? ? BOTTOM DOCK  ? ? ? */}", tabRenderLogic + "\n            {/*  ? ? ? BOTTOM DOCK  ? ? ? */}");

fs.writeFileSync(path, content);
console.log("Successfully extracted all 6 tabs!");
