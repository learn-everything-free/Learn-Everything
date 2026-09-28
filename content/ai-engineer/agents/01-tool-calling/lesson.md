# Function Calling and Tool Definitions

An AI Agent is an LLM embedded in a stateful control loop with the capability to perceive its environment, invoke external tools, and inspect execution feedback.

## The Tool Schema Contract

Language models do not execute functions directly; they emit a structured request containing the tool name and validated arguments. The client runtime runs the tool and returns the observation back to the model.

```json
{
  "type": "function",
  "function": {
    "name": "query_database",
    "description": "Execute a readonly SQL query against the customer inventory table",
    "parameters": {
      "type": "object",
      "properties": {
        "query": { "type": "string", "description": "Valid SQL SELECT statement" }
      },
      "required": ["query"]
    }
  }
}
```

## The ReAct Pattern (Reason + Act)

Modern agents operate via the ReAct framework:
1. **Thought:** The model analyzes the current goal and past observations.
2. **Action:** Emits a function call with parameters.
3. **Observation:** Receives terminal output or API response.
4. **Repeat / Final Answer:** Continues until the objective is accomplished or error recovery kicks in.
