# Prompt Engineering Fundamentals

Large Language Models (LLMs) are probabilistic token-prediction engines. The prompt is your interface to constrain the model's vast probability distribution toward predictable, reliable outcomes.

## The Anatomy of an Enterprise Prompt

A production-grade prompt is composed of four distinct layers:

1. **Role & Persona:** Directs the model's latent representations (e.g., *"You are a senior site reliability engineer"*).
2. **Context:** Relevant runtime data, logs, database schemas, or business rules.
3. **Instructions & Constraints:** Clear instructions, negative constraints (*"Do NOT include markdown formatting"*), and edge-case handling.
4. **Output Schema:** Format specification (e.g., JSON schema, Pydantic model representation).

## Zero-Shot vs Few-Shot Prompting

- **Zero-Shot:** Giving an instruction directly with no examples. Works well for simple classification or summarization with capable frontier models.
- **Few-Shot:** Providing 2–5 exemplar input/output pairs. Few-shot drastically stabilizes edge cases, controls tone, and enforces structured syntax without fine-tuning.

```json
{
  "system": "You extract server incidents from telemetry alerts.",
  "few_shot_examples": [
    {
      "input": "CRITICAL: Redis pod OOMKilled in prod-eu-west",
      "output": {"severity": "P1", "service": "redis", "action": "restart_and_scale"}
    }
  ]
}
```

## Enforcing Structured Outputs

Modern APIs support JSON mode and Structured Outputs via JSON Schema. Constraining outputs to deterministic schemas ensures downstream microservices never fail due to unexpected conversational prose.
