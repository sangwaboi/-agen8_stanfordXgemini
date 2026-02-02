# agen8

A hackathon project that transforms natural language descriptions into executable multi-step agentic workflows using Google Gemini's function calling capabilities and Composio for integrations.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set environment variables:
   Copy `.env.example` to `.env` and fill in your API keys.

3. Run the app:
   ```bash
   python app.py
   ```

## Architecture

- **Layer 1: Natural Language Parser**: Gemini 2.0 Flash (generates JSON workflow)
- **Layer 2: Action Block Executor**: Modular functions for scraping, AI processing, etc.
- **Layer 3: Execution Engine**: Python class managing DAG execution.
- **Layer 4: UI/UX**: Flask + Vanilla JS + Tailwind.

## Phase 1 Status
- Project structure created.
- Flask app initialized.
- Skeleton classes for engine and actions defined.
- Frontend shell ready with Orange/White theme.
