import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './DesignNodes';
import { motion } from 'framer-motion';
import { Database, Server, Zap, Globe, Layers, Repeat, ShieldCheck, Loader2, Play, CheckCircle2, AlertTriangle } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
};

const INITIAL_NODES = [
  { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Client App', type: 'client' } },
];

const COMPONENTS = [
  { type: 'client', label: 'Client', icon: Globe },
  { type: 'loadbalancer', label: 'Load Balancer', icon: Layers },
  { type: 'apigateway', label: 'API Gateway', icon: ShieldCheck },
  { type: 'server', label: 'App Server', icon: Server },
  { type: 'database', label: 'Database', icon: Database },
  { type: 'cache', label: 'Cache (Redis)', icon: Zap },
  { type: 'messagequeue', label: 'Message Queue', icon: Repeat },
];

const PROBLEMS = [
  {
    id: 'url-shortener',
    title: 'Design a URL Shortener',
    description: 'Design a highly available and scalable URL shortener service (like Bitly). It needs to handle high read traffic and generate unique short aliases for long URLs.',
  },
  {
    id: 'twitter',
    title: 'Design Twitter',
    description: 'Design Twitter\'s core features: posting tweets and viewing the home timeline. The system must handle high fanout for celebrities and fast read operations.',
  }
];

export default function SystemDesignMode() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } }, eds)), [setEdges]);

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label: nodeLabel }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const dataStr = event.dataTransfer.getData('application/reactflow');
      if (!dataStr || !reactFlowBounds || !reactFlowInstance) return;

      const data = JSON.parse(dataStr);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: Date.now().toString(),
        type: 'custom',
        position,
        data: { label: data.label, type: data.type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const evaluateDesign = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('http://localhost:4000/api/sysdesign/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: selectedProblem.description,
          nodes,
          edges
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback(data);
    } catch (err: any) {
      alert("Error evaluating design: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full flex gap-4">
      {/* Left Pane: Problem & Evaluation */}
      <div className="w-[350px] shrink-0 flex flex-col gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Prompt</h2>
          
          <select 
            className="w-full mb-4 p-2.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-700 text-sm font-semibold bg-transparent text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500"
            value={selectedProblem.id}
            onChange={(e) => setSelectedProblem(PROBLEMS.find(p => p.id === e.target.value) || PROBLEMS[0])}
          >
            {PROBLEMS.map(p => <option key={p.id} value={p.id} className="bg-white dark:bg-slate-800">{p.title}</option>)}
          </select>

          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            {selectedProblem.description}
          </p>

          <button 
            onClick={evaluateDesign}
            disabled={loading}
            className="w-full mt-auto bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? 'Evaluating...' : 'Submit Architecture'}
          </button>
        </div>

        {feedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/5 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Evaluation Report</h3>
              <span className={`ml-auto text-sm font-bold px-2.5 py-1 rounded-full ${feedback.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                {feedback.score}/100
              </span>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
              {feedback.feedback}
            </p>

            {feedback.bottlenecks && feedback.bottlenecks.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-100 dark:border-rose-500/20">
                <div className="flex items-center gap-1.5 mb-2 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Bottlenecks</span>
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  {feedback.bottlenecks.map((b: string, i: number) => (
                    <li key={i} className="text-xs font-medium text-rose-700 dark:text-rose-300">{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Right Pane: Canvas */}
      <div className="flex-1 glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex gap-2 p-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-700/50 overflow-x-auto custom-scrollbar shrink-0">
          {COMPONENTS.map((comp) => (
            <div 
              key={comp.type}
              draggable
              onDragStart={(e) => onDragStart(e, comp.type, comp.label)}
              className="flex items-center gap-2 px-3 py-2 glass-panel border border-slate-200/50 dark:border-slate-700/50 rounded-lg cursor-grab hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
            >
              <comp.icon className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{comp.label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 min-h-0 relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="bg-slate-50/30 dark:bg-slate-900/20"
            >
              <Controls className="glass-panel border-none shadow-md rounded-xl overflow-hidden" />
              <MiniMap 
                className="glass-panel border border-slate-200/50 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm"
                maskColor="var(--color-slate-900)"
                nodeColor="#8b5cf6" 
              />
              <Background gap={12} size={1} color="#cbd5e1" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
