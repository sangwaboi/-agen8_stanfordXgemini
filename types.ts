export type ActionType = 
  | 'web_scraper' 
  | 'ai_processor' 
  | 'email_sender' 
  | 'data_filter' 
  | 'scheduler' 
  | 'api_caller';

export interface WorkflowNode {
  id: string;
  action: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>;
  depends_on: string[];
}

export interface WorkflowGraph {
  workflow_name: string;
  nodes: WorkflowNode[];
  execution_order: string[];
}

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'error' | 'skipped';

export interface ExecutionLog {
  nodeId: string;
  status: ExecutionStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface ExecutionState {
  isRunning: boolean;
  logs: Record<string, ExecutionLog>;
}