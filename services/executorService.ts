import { WorkflowGraph, WorkflowNode, ExecutionLog } from "../types";
import { executeAiTask } from "./geminiService";

// Helper to delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data Source
const MOCK_NEWS = [
    "Gemini 1.5 Pro establishes new benchmark in long-context understanding.",
    "SpaceX successfully catches Super Heavy booster.",
    "New battery tech promises 1000 mile range for EVs.",
    "Global markets rally as inflation cools down.",
    "Python 3.13 introduces JIT compiler improvements."
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExecutionContext = Record<string, any>;

export class WorkflowExecutor {
    private context: ExecutionContext = {};
    private onLogUpdate: (log: ExecutionLog) => void;

    constructor(onLogUpdate: (log: ExecutionLog) => void) {
        this.onLogUpdate = onLogUpdate;
    }

    async executeWorkflow(graph: WorkflowGraph) {
        this.context = {}; // Reset context
        
        for (const nodeId of graph.execution_order) {
            const node = graph.nodes.find(n => n.id === nodeId);
            if (!node) continue;

            // Start logging
            this.onLogUpdate({ nodeId, status: 'running', startTime: Date.now() });

            try {
                // Resolve inputs from dependencies
                const inputs = this.resolveInputs(node);
                
                // Execute Logic
                const output = await this.runNodeAction(node, inputs);

                // Save output to context
                this.context[nodeId] = output;

                // Success Log
                this.onLogUpdate({ nodeId, status: 'success', output, endTime: Date.now() });
            } catch (error) {
                // Error Log
                this.onLogUpdate({ 
                    nodeId, 
                    status: 'error', 
                    error: error instanceof Error ? error.message : "Unknown error",
                    endTime: Date.now()
                });
                // Stop execution on error (simplification for MVP)
                break;
            }
        }
    }

    private resolveInputs(node: WorkflowNode) {
        if (node.depends_on.length === 0) return null;
        // For simplicity, just grab the output of the *last* dependency or aggregate all
        const outputs = node.depends_on.map(depId => this.context[depId]);
        
        // If single dependency, return it directly, else return array
        return outputs.length === 1 ? outputs[0] : outputs;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async runNodeAction(node: WorkflowNode, inputData: any): Promise<any> {
        await delay(800 + Math.random() * 500); // Simulate network latency

        switch (node.action) {
            case 'scheduler':
                return { triggered_at: new Date().toISOString(), schedule: node.params.cron };
            
            case 'web_scraper':
                const url = node.params.url || "";
                if (url.includes("fail")) throw new Error(`Failed to reach ${url} (Simulated 404)`);
                // Mock scraper behavior
                if (url.includes("news") || url.includes("ycombinator") || url.includes("techcrunch")) {
                    return MOCK_NEWS;
                }
                return [`Scraped content from ${url}`, "Sample Paragraph 1", "Sample Paragraph 2"];
            
            case 'ai_processor':
                const instruction = node.params.instruction || "Summarize";
                const dataStr = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);
                return await executeAiTask(instruction, dataStr);

            case 'data_filter':
                if (Array.isArray(inputData)) {
                    const limit = node.params.limit || 3;
                    return inputData.slice(0, limit);
                }
                return inputData;

            case 'email_sender':
                // Simulate sending
                const recipient = node.params.recipient || "me@example.com";
                console.log(`Sending email to ${recipient}:`, inputData);
                return { sent: true, recipient, timestamp: Date.now(), content_preview: String(inputData).substring(0, 50) + "..." };
            
            case 'api_caller':
                try {
                     // Attempt real fetch if simple GET
                    if (node.params.method === 'GET' && !node.params.url.includes('localhost')) {
                         const res = await fetch(node.params.url);
                         return await res.json();
                    }
                } catch {
                    // Fallback
                }
                return { status: 200, data: "Simulated API Response" };
            
            default:
                throw new Error(`Unknown action type: ${node.action}`);
        }
    }
}