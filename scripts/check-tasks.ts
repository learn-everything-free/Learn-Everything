// Determinism check (direct-YAML edition): parse task.yaml files straight from
// content/ with the yaml package, resolve validators against the registry, run
// each walkthrough through a fresh LabShell, then evaluate its checks.
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { LabShell, type ValidatorCheck } from "../src/lib/shell";

const ROOT = path.join(import.meta.dirname, "..", "content");

interface TaskYaml {
  slug: string;
  steps: { title: string; detail: string; command?: string }[];
  validation: { validator: string; label: string } & Record<string, unknown>;
}

// Walk content/ collecting every task.yaml, keyed by slug.
const tasks = new Map<string, { file: string; data: TaskYaml }>();
const unparsable: string[] = [];
function walk(dir: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name === "task.yaml") {
      try {
        const data = parse(fs.readFileSync(p, "utf8")) as TaskYaml;
        tasks.set(data.slug, { file: p, data });
      } catch (e) {
        unparsable.push(`${p}: ${(e as Error).message.split("\n")[0]}`);
      }
    }
  }
}
walk(ROOT);

// Registry: validator id -> {kind, fields}
const registry = parse(
  fs.readFileSync(path.join(ROOT, "validators", "registry.yaml"), "utf8"),
) as {
  validators: { id: string; kind: string; params: string[]; fields: Record<string, string> }[];
};

function resolveChecks(task: TaskYaml): ValidatorCheck[] {
  const entries = task.validation as unknown as ({ validator: string; label: string } & Record<string, unknown>)[];
  return entries.map((entry) => {
    const def = registry.validators.find((v) => v.id === entry.validator)!;
    const check = { kind: def.kind, label: entry.label } as unknown as ValidatorCheck;
    for (const [field, template] of Object.entries(def.fields)) {
      const match = template.match(/^\{\{(\w+)\}\}$/);
      if (match) {
        const value = entry[match[1]];
        (check as unknown as Record<string, unknown>)[field] =
          typeof value === "number" ? value : String(value);
      } else {
        (check as unknown as Record<string, unknown>)[field] = template.replace(
          /\{\{(\w+)\}\}/g,
          (_m, p: string) => String(entry[p]),
        );
      }
    }
    return check;
  });
}

const targets = process.argv.slice(2);
const list = targets.length ? targets : [...tasks.keys()];

let failed = 0;
for (const slug of list) {
  const t = tasks.get(slug);
  if (!t) {
    console.log(`${slug}: NOT FOUND`);
    failed++;
    continue;
  }
  const sh = new LabShell();
  for (const step of t.data.steps) {
    if (step.command) sh.run(step.command);
  }
  const res = sh.validate(resolveChecks(t.data));
  const bad = res.filter((r) => !r.pass);
  if (bad.length === 0) {
    console.log(`${slug}: PASS (${res.length} checks)`);
  } else {
    failed++;
    console.log(`${slug}: FAIL -> ${bad.map((b) => `${b.label} [${b.detail}]`).join("; ")}`);
  }
}
console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILING`);
if (unparsable.length) {
  console.log(`\n${unparsable.length} UNPARSABLE (skipped):`);
  for (const u of unparsable) console.log("  " + u);
}
