import React from 'react';
import { WorkflowNode, ExecutionLog } from '../types';
import { Globe, Bot, Mail, Filter, Calendar, Zap, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface NodeCardProps {
  node: WorkflowNode;
  log?: ExecutionLog;
  index: number;
  total: number;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  web_scraper: <Globe size={20} className="text-blue-400" />,
  ai_processor: <Bot size={20} className="text-purple-400" />,
  email_sender: <Mail size={20} className="text-green-400" />,
  data_filter: <Filter size={20} className="text-orange-400" />,
  scheduler: <Calendar size={20} className="text-yellow-400" />,
  api_caller: <Zap size={20} className="text-red-400" />,
};

const ACTION_LABELS: Record<string, string> = {
  web_scraper: 'Web Scraper',
  ai_processor: 'AI Processor',
  email_sender: 'Email Sender',
  data_filter: 'Data Filter',
  scheduler: 'Scheduler',
  api_caller: 'API Caller',
};

const NodeCard: React.FC<NodeCardProps> = ({ node, log, index, total }) => {
  const isLast = index === total - 1;

  const getStatusIcon = () => {
    if (!log) return <Clock size={16} className="text-slate-500" />;
    switch (log.status) {
      case 'running': return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      case 'skipped': return <Clock size={16} className="text-slate-600" />;
      default: return <Clock size={16} className="text-slate-500" />;
    }
  };

  const getStatusBorder = () => {
    if (!log) return 'border-slate-800 hover:border-slate-700';
    switch (log.status) {
      case 'running': return 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
      case 'success': return 'border-emerald-500/50';
      case 'error': return 'border-red-500/50';
      default: return 'border-slate-800';
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-2xl">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[28px] top-[60px] bottom-[-20px] w-0.5 bg-slate-800 -z-10"></div>
      )}

      <div className={clsx(
        "relative w-full p-5 rounded-xl border bg-slate-900/50 backdrop-blur-sm transition-all duration-300",
        getStatusBorder()
      )}>
        <div className="flex items-start gap-4">
          
          {/* Icon Container */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
            {ACTION_ICONS[node.action] || <Zap size={20} />}
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-200">{ACTION_LABELS[node.action]}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500">{node.id}</span>
                {getStatusIcon()}
              </div>
            </div>

            {/* Params Preview */}
            <div className="text-sm text-slate-400 font-mono bg-slate-950/50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(node.params).replace(/["{}]/g, '').replace(/,/g, ', ')}
            </div>

            {/* Execution Result Output */}
            {log?.output && (
              <div className="mt-3 pt-3 border-t border-slate-800/50 animate-in fade-in slide-in-from-top-1 duration-300">
                <p className="text-xs font-semibold text-emerald-400 mb-1">OUTPUT</p>
                <div className="text-xs text-slate-300 font-mono bg-slate-950 p-2 rounded max-h-32 overflow-y-auto">
                  {typeof log.output === 'object' 
                    ? JSON.stringify(log.output, null, 2) 
                    : String(log.output)}
                </div>
              </div>
            )}

            {/* Error Message */}
            {log?.error && (
              <div className="mt-3 pt-3 border-t border-red-900/30">
                <p className="text-xs font-semibold text-red-400 mb-1">ERROR</p>
                <p className="text-xs text-red-300">{log.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Down Arrow for visuals */}
      {!isLast && (
        <div className="h-6 w-px bg-slate-800 my-1"></div>
      )}
    </div>
  );
};

export default NodeCard;