import { Handle, Position } from '@xyflow/react';
import { Database, Server, Zap, Globe, Layers, Repeat, ShieldCheck } from 'lucide-react';

export const CustomNode = ({ data, selected }: any) => {
  const getIcon = () => {
    switch(data.type) {
      case 'database': return <Database className="w-5 h-5 text-rose-400" />;
      case 'server': return <Server className="w-5 h-5 text-blue-400" />;
      case 'cache': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'client': return <Globe className="w-5 h-5 text-emerald-400" />;
      case 'loadbalancer': return <Layers className="w-5 h-5 text-violet-400" />;
      case 'messagequeue': return <Repeat className="w-5 h-5 text-fuchsia-400" />;
      case 'apigateway': return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      default: return <Server className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className={`relative px-4 py-3 min-w-[160px] rounded-xl glass-panel border shadow-sm transition-all flex items-center gap-3 ${selected ? 'border-violet-500 shadow-violet-500/20 shadow-lg scale-105' : 'border-slate-200/50 dark:border-slate-700/50 hover:border-violet-300 dark:hover:border-violet-700/50'}`}>
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-violet-500 border-2 border-white dark:border-slate-800" />
      <Handle type="target" position={Position.Left} id="left" className="w-2.5 h-2.5 bg-violet-500 border-2 border-white dark:border-slate-800" />
      
      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
        {getIcon()}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{data.label}</p>
        <p className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">{data.type}</p>
      </div>

      <Handle type="source" position={Position.Right} id="right" className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800" />
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800" />
    </div>
  );
};
