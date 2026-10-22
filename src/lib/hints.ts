import type { CheckResult } from "./shell";
import type { Task } from "./data";

// Progressive hints for a lab, derived from the task itself — no extra
// content authoring needed. Each hint is one step further than the last:
//
//   1. what the task is really asking for (its requirements)
//   2. the first command of the walkthrough
//   3. the first check the validator still reports as open
//   4. where the walkthrough ends
//
// Hints never contain the answer — they point at the thing to look at.

export interface Hint {
  label: string;
  body: string;
}

export function buildHints(
  task: Task,
  results: CheckResult[] | null,
  liveChecks: CheckResult[] | null,
): Hint[] {
  const hints: Hint[] = [];

  const firstRequirement = task.requirements[0];
  if (firstRequirement) {
    hints.push({
      label: "Read the requirement again",
      body: `The validator is looking for exactly this: “${firstRequirement}”. Every other requirement is a bonus until that one is true.`,
    });
  }

  const firstCommand = task.steps.find((s) => s.command)?.command;
  if (firstCommand) {
    hints.push({
      label: "Start with the first command",
      body: `The walkthrough opens with: ${firstCommand}. Run it and read what it says before doing anything else.`,
    });
  } else {
    hints.push({
      label: "Look before you change",
      body: "Run ls and cat on the paths the task mentions. The validator reads the state of the machine, so the state is what you need to see.",
    });
  }

  const open = (results ?? liveChecks ?? []).find((r) => !r.pass);
  if (open) {
    hints.push({
      label: "The open check",
      body: `Still open: ${open.label}${open.detail && open.detail !== "ok" ? ` — ${open.detail}` : ""}. Everything else is already green.`,
    });
  }

  const lastStep = task.steps[task.steps.length - 1];
  if (lastStep) {
    hints.push({
      label: "The last step of the walkthrough",
      body: `The walkthrough finishes with “${lastStep.title}”. If you have done everything before it, that step is what is left.`,
    });
  }

  return hints;
}
