import React, { useState, useRef } from 'react';
import { Sparkles, Play, RotateCcw, Box, ArrowRight } from 'lucide-react';
import { generateWorkflowPlan } from './services/geminiService';
import { WorkflowExecutor } from './services/executorService';
import { WorkflowGraph, ExecutionState, ExecutionLog } from './types';
import NodeCard from './components/NodeCard';
import MetricsChart from './components/MetricsChart';
import { clsx } from 'clsx';

const SAMPLE_PROMPTS = [
  "Every Monday at 9am, scrape Hacker News top posts, summarize them with AI, and email me the summary.",
  "Fetch user data from https://jsonplaceholder.typicode.com/users, filter for users with id < 4, and email admin.",
  "Check stock price API, if value > 100 (simulated), email me to sell."
];

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [execState, setExecState] = useState<ExecutionState>({ isRunning: false, logs: {} });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setWorkflow(null);
    setExecState({ isRunning: false, logs: {} });

    try {
      const plan = await generateWorkflowPlan(prompt);
      setWorkflow(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate workflow. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecute = async () => {
    if (!workflow) return;
    
    // Reset logs
    setExecState({ isRunning: true, logs: {} });
    
    const executor = new WorkflowExecutor((log: ExecutionLog) => {
      setExecState(prev => ({
        ...prev,
        logs: { ...prev.logs, [log.nodeId]: log }
      }));
    });

    await executor.executeWorkflow(workflow);
    
    setExecState(prev => ({ ...prev, isRunning: false }));
  };

  const handleSampleClick = (text: string) => {
    setPrompt(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white" size={18} />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">Gemini Workflow Studio</h1>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
             Powered by Gemini 2.0 Flash
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Intro / Input Section */}
        <section className="mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 text-transparent bg-clip-text">
            Build agents with words.
          </h2>
          <p className="text-center text-slate-400 mb-10 max-w-2xl mx-auto text-lg">
            Describe a complex task, and let Gemini architect and execute a multi-step workflow for you.
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-30 blur group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-slate-900 rounded-xl p-2 border border-slate-800 shadow-2xl">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your workflow here... (e.g., 'Scrape BBC News and summarize the top headlines')"
                  className="w-full bg-transparent text-slate-200 placeholder-slate-600 p-4 min-h-[120px] outline-none resize-none text-lg rounded-lg"
                />
                <div className="flex justify-between items-center px-4 pb-2 mt-2">
                  <div className="flex gap-2">
                    {/* Tiny badges or helper icons could go here */}
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className={clsx(
                      "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200",
                      isGenerating || !prompt.trim()
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 active:scale-95"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <RotateCcw className="animate-spin" size={18} />
                        <span>Architecting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Generate Workflow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {SAMPLE_PROMPTS.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => handleSampleClick(sample)}
                  className="text-xs text-slate-400 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-full transition-colors text-left"
                >
                  {sample.length > 50 ? sample.substring(0, 50) + "..." : sample}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Error Display */}
        {error && (
            <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-300 text-center text-sm">
                {error}
            </div>
        )}

        {/* Workflow Visualization & Execution */}
        {workflow && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-2xl font-bold text-white mb-1">{workflow.workflow_name}</h3>
                 <p className="text-slate-500 text-sm">Generated by Gemini • {workflow.nodes.length} Steps</p>
              </div>
              <button
                onClick={handleExecute}
                disabled={execState.isRunning}
                className={clsx(
                  "flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all",
                  execState.isRunning
                    ? "bg-slate-800 text-slate-400 cursor-wait"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95"
                )}
              >
                 {execState.isRunning ? <RotateCcw className="animate-spin" size={18}/> : <Play size={18} fill="currentColor" />}
                 {execState.isRunning ? "Running..." : "Run Workflow"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left: Workflow Graph */}
                <div className="lg:col-span-2 flex flex-col items-center space-y-2">
                    {workflow.execution_order.map((nodeId, index) => {
                        const node = workflow.nodes.find(n => n.id === nodeId);
                        if (!node) return null;
                        return (
                            <NodeCard 
                                key={nodeId} 
                                node={node} 
                                index={index}
                                total={workflow.nodes.length}
                                log={execState.logs[nodeId]}
                            />
                        );
                    })}
                </div>

                {/* Right: Stats & Info */}
                <div className="lg:col-span-1 space-y-6 sticky top-24">
                   <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                        <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                            <Box size={18} className="text-blue-400"/>
                            Plan Details
                        </h4>
                        <div className="space-y-4">
                            <div className="text-sm">
                                <span className="text-slate-500 block mb-1">Execution Order</span>
                                <div className="flex flex-wrap gap-2">
                                    {workflow.execution_order.map((id, i) => (
                                        <div key={id} className="flex items-center text-slate-300 text-xs">
                                            <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{id}</span>
                                            {i < workflow.execution_order.length - 1 && <ArrowRight size={12} className="ml-2 text-slate-600"/>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-sm">
                                <span className="text-slate-500 block mb-1">Total Nodes</span>
                                <span className="text-slate-200 font-mono">{workflow.nodes.length}</span>
                            </div>
                        </div>
                   </div>

                   {/* D3 Chart */}
                   <MetricsChart logs={execState.logs} />
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}