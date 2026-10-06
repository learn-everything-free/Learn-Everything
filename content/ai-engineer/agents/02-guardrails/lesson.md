# Agent Guardrails

An agent is a loop — think, call a tool, look at the result, repeat. Left unbounded, that loop can spin forever, burning tokens on the same failed step. Guardrails are the simple settings that bound it: a maximum number of iterations and a fixed policy for what to do when a call errors.

## What you'll practice

- **Bound an Agent Loop** — guided · beginner

## A command you'll meet

```bash
echo max_iterations=10 > agent.yaml
```

Open any task below to get the full step-by-step walkthrough — every command is explained, and the lab validator checks what you actually built.
