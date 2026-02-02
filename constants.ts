import { ActionType } from "./types";

export const GEMINI_MODEL_PLANNER = "gemini-3-flash-preview";
export const GEMINI_MODEL_PROCESSOR = "gemini-3-flash-preview";

export const AVAILABLE_ACTIONS: Record<ActionType, string> = {
  web_scraper: "Fetch content from URLs. Params: url, selector (optional)",
  ai_processor: "Summarize, extract, or transform text using Gemini. Params: instruction, model_params (optional)",
  email_sender: "Send emails (Simulated). Params: recipient, subject, body_template",
  data_filter: "Filter/sort/deduplicate data. Params: condition, limit",
  scheduler: "Time-based triggers. Params: cron_expression, description",
  api_caller: "Make HTTP requests. Params: url, method, headers, body"
};

export const WORKFLOW_PLANNING_PROMPT = `
You are an expert AI workflow architect. Your goal is to convert a user's natural language request into a strictly structured JSON execution plan.

**Available Action Blocks:**
1. web_scraper: Fetches text content from a URL.
2. ai_processor: Uses LLM to process text (summarize, translate, extract).
3. email_sender: Simulates sending an email.
4. data_filter: Filters or slices arrays of data.
5. scheduler: Defines when the workflow runs (trigger).
6. api_caller: generic HTTP request.

**Rules:**
- Output MUST be valid JSON.
- The root object must have: "workflow_name", "nodes" (array), "execution_order" (array of node IDs).
- Each node must have: "id" (unique string), "action" (one of the available types), "params" (object), "depends_on" (array of IDs).
- Ensure the "execution_order" is a valid topological sort.
- For 'ai_processor', strictly define the 'instruction' param.
- For 'web_scraper', strictly define the 'url' param.

**Example Input:**
"Every morning scrape techcrunch and email me a summary"

**Example Output:**
{
  "workflow_name": "Daily TechCrunch Summary",
  "nodes": [
    {
      "id": "trigger_1",
      "action": "scheduler",
      "params": { "cron": "0 8 * * *", "description": "Every morning at 8am" },
      "depends_on": []
    },
    {
      "id": "scraper_1",
      "action": "web_scraper",
      "params": { "url": "https://techcrunch.com" },
      "depends_on": ["trigger_1"]
    },
    {
      "id": "ai_1",
      "action": "ai_processor",
      "params": { "instruction": "Summarize the following tech news headlines into a bulleted list." },
      "depends_on": ["scraper_1"]
    },
    {
      "id": "email_1",
      "action": "email_sender",
      "params": { "recipient": "user@example.com", "subject": "Daily Tech News" },
      "depends_on": ["ai_1"]
    }
  ],
  "execution_order": ["trigger_1", "scraper_1", "ai_1", "email_1"]
}
`;
