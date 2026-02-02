def get_workflow_planning_prompt(user_input: str, available_actions: list) -> str:
    """
    Generate prompt for Gemini to plan workflow.
    
    Returns structured prompt that ENFORCES valid JSON output.
    Implementation in Phase 4.
    """
    return f"""
    You are an expert AI workflow architect. Convert this request into a JSON workflow:
    Request: {user_input}
    
    Available Actions: {available_actions}
    
    Return strict JSON.
    """
