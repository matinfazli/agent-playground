import fs from "node:fs";
import path from "node:path";

function env(name, fallback = "") {
  return process.env[name] ?? fallback;
}

function readFileIfExists(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function listTree(dir, maxDepth = 3, prefix = "", depth = 0) {
  if (depth > maxDepth) return "";
  let out = "";
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return "";
  }

  // Keep stable ordering
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".git" || e.name === "dist") continue;
    const rel = path.join(dir, e.name);
    out += `${prefix}${e.isDirectory() ? "📁" : "📄"} ${rel}\n`;
    if (e.isDirectory()) out += listTree(rel, maxDepth, prefix + "  ", depth + 1);
  }
  return out;
}

async function callGemini({ apiKey, model, prompt }) {
  // Gemini API (AI Studio / Generative Language) - REST
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 900, // keep it cheap + short
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }

  const json = await res.json();

  // Extract text
  const parts = json?.candidates?.[0]?.content?.parts;
  const out = Array.isArray(parts) ? parts.map((p) => p.text ?? "").join("") : "";
  return out.trim();
}

// ---- Main ----

const apiKey = env("GEMINI_API_KEY");
const model = env("GEMINI_MODEL", "gemini-1.5-flash"); // cheap+fast by default

const issueNumber = env("ISSUE_NUMBER");
const issueTitle = env("ISSUE_TITLE");
const issueBody = env("ISSUE_BODY");
const repo = env("REPO");
const runId = env("RUN_ID");
const triggerLabel = env("TRIGGER_LABEL");

const issueBodySafe =
  issueBody && issueBody.trim().length > 0 ? issueBody : "_(No issue description provided)_";

const repoSummary = readFileIfExists(".agent/repo_summary.md");
const conventions = readFileIfExists(".agent/conventions.md");
const howToTest = readFileIfExists(".agent/how_to_test.md");
const limits = readFileIfExists(".agent/limits.md");

const tree = listTree(".", 3);

const systemInstruction = `
You are a senior software engineer acting as a planning assistant for a React + Vite repo.
You MUST:
- Produce a concrete, minimal, step-by-step plan to implement the issue safely.
- Identify the most likely files to touch.
- Specify exact commands to run (build/tests).
- Define clear acceptance criteria.
- Keep scope tight and avoid refactors.

You MUST NOT:
- invent file contents
- propose dependency upgrades unless required
- propose changes in forbidden paths unless requested

If the issue is ambiguous, include a short "Questions" section with the minimum clarifying questions.
Keep the output as markdown.
`.trim();

const prompt = `
${systemInstruction}

## Repo context
### Summary
${repoSummary || "(missing .agent/repo_summary.md)"}

### Conventions
${conventions || "(missing .agent/conventions.md)"}

### How to test
${howToTest || "(missing .agent/how_to_test.md)"}

### Limits
${limits || "(missing .agent/limits.md)"}

### Project tree (depth 3)
${tree}

## Issue
### #${issueNumber}: ${issueTitle}
${issueBodySafe}

## Output format (must follow)
Return markdown with these sections:

## Plan
(numbered steps)

## Files to inspect
(bullets)

## Files likely to change
(bullets)

## Commands to run
(code block)

## Risks & edge cases
(bullets)

## Acceptance criteria
(checklist)

## Questions (only if needed)
(bullets)
`.trim();

let llmPlan = "";
let error = "";

if (!apiKey) {
  error = "Missing GEMINI_API_KEY secret. Add it in repo settings.";
} else {
  try {
    llmPlan = await callGemini({ apiKey, model, prompt });
  } catch (e) {
    error = String(e?.message || e);
  }
}

const comment = `
## Agent plan (Gemini)

**Issue:** #${issueNumber} — ${issueTitle}

${llmPlan ? llmPlan : `⚠️ Plan generation failed.\n\n**Error:**\n\`\`\`\n${error}\n\`\`\`\n`}

---

## Run metadata
- Model: \`${model}\`
- Trigger: \`${triggerLabel}\`
- Workflow run: https://github.com/${repo}/actions/runs/${runId}
`.trim() + "\n";

fs.writeFileSync("plan_comment.md", comment, "utf8");
console.log("Wrote plan_comment.md");
