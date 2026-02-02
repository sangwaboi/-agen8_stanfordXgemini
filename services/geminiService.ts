import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_PLANNER, GEMINI_MODEL_PROCESSOR, WORKFLOW_PLANNING_PROMPT } from "../constants";
import { WorkflowGraph } from "../types";

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const generateWorkflowPlan = async (userPrompt: string): Promise<WorkflowGraph> => {
  const ai = getClient();
  
  const systemInstruction = WORKFLOW_PLANNING_PROMPT;
  const prompt = `User Request: ${userPrompt}`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_PLANNER,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    // Parse JSON
    const plan = JSON.parse(text) as WorkflowGraph;
    
    // Basic validation
    if (!plan.nodes || !plan.execution_order) {
      throw new Error("Invalid workflow structure returned");
    }

    return plan;
  } catch (error) {
    console.error("Workflow generation failed:", error);
    throw error;
  }
};

export const executeAiTask = async (instruction: string, contextData: string): Promise<string> => {
    const ai = getClient();
    
    const prompt = `
      Instruction: ${instruction}
      
      Input Data:
      ${contextData.substring(0, 10000)} // Truncate to avoid massive context in demo
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_PROCESSOR,
        contents: prompt,
      });
  
      return response.text || "No output generated.";
    } catch (error) {
      console.error("AI execution failed:", error);
      return `Error processing AI task: ${error instanceof Error ? error.message : String(error)}`;
    }
  };