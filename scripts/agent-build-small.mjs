import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function env(name, fallback = "") {
  return process.env[name] ?? fallback;
}

function sh(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts });
}

function shLive(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf8", stdio: "inherit", ...opts });
}

function readFileIfExists(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function listTree(dir, maxDepth = 4, depth = 0) {
  if (depth > maxDepth) return "";
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return "";
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));

  let out = "";
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".git" || e.name === "dist") continue;
    const rel = path.join(dir, e.name);
    out += `${"  ".repeat(depth)}${e.isDirectory() ? "📁" : "📄"} ${rel}\n`;
    if (e.isDirectory()) out += listTree(rel, maxDepth, depth + 1);
  }
  return out;
}

async function callGemini({ apiKey, model, prompt }) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 1400,
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
  const parts = json?.candidates?.[0]?.content?.parts;
  const out = Array.isArray(parts) ? parts.map((p) => p.text ?? "").join("") : "";
  return out.trim();
}

function extractDiffBlock(text) {
  // Look for ```diff ... ```
  const m = text.match(/```diff\s*([\s\S]*?)```/i);
  if (!m) return { diff: "", withoutDiff: text };
  const diff = m[1].trim();
  const withoutDiff = text.replace(m[0], "").trim();
  return { diff, withoutDiff };
}

function tail(text, lines = 120) {
  const arr = text.split("\n");
  return arr.slice(Math.max(0, arr.length - lines)).join("\n");
}

// ---- main ----

const apiKey = env("GEMINI_API_KEY");
const model = env("GEMINI_MODEL", "gemini-1.5-flash-latest");

const issueNumber = env("ISSUE_NUMBER");
const issueTitle = env("ISSUE_TITLE");
const issueBody = env("ISSUE_BODY");
const repo = env("REPO");
const runId = env("RUN_ID");
const triggerLabel = env("TRIGGER_LABEL");
const branchName = env("BRANCH_NAME");

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY (add repo secret).");
  process.exit(1);
}

const issueBodySafe =
  issueBody && issueBody.trim().length > 0 ? issueBody : "_(No issue description provided)_";

const repoSummary = readFileIfExists(".agent/repo_summary.md");
const conventions = readFileIfExists(".agent/conventions.md");
const howToTest = readFileIfExists(".agent/how_to_test.md");
const limits = readFileIfExists(".agent/limits.md");
const pkg = readFileIfExists("package.json");

const tree = listTree("src", 5);
const rootTree = listTree(".", 2);

const systemInstruction = `
You are a senior engineer making a SMALL change to a React + Vite repo.

Hard constraints:
- ONLY modify files under src/ (and optionally README.md if needed).
- Do NOT modify .github/, .agent/, package.json, lockfiles, or configs.
- Keep it SMALL: max ~200 lines changed total, max 1-3 files.
- Output MUST include a unified diff in a \`\`\`diff block that can be applied with \`git apply\`.
- If you are unsure, choose the smallest safe implementation.

You MUST:
- Provide a short Plan section
- Provide a Patch section with unified diff
`.trim();

const prompt = `
${systemInstruction}

## Repo context
### .agent/repo_summary.md
${repoSummary || "(missing)"}

### .agent/conventions.md
${conventions || "(missing)"}

### .agent/how_to_test.md
${howToTest || "(missing)"}

### .agent/limits.md
${limits || "(missing)"}

### package.json (scripts only)
${pkg}

### repo tree (depth 2)
${rootTree}

### src/ tree (depth 5)
${tree}

## Issue
### #${issueNumber}: ${issueTitle}
${issueBodySafe}

## Required output format
Return markdown with exactly:

## Plan
...

## Patch
\`\`\`diff
(unified diff; ONLY src/ files)
\`\`\`
`.trim();

console.log(`Calling Gemini model: ${model} ...`);
const response = await callGemini({ apiKey, model, prompt });

// Extract plan text and diff patch
const { diff, withoutDiff } = extractDiffBlock(response);
if (!diff) {
  console.error("Model did not return a ```diff block. Full response:\n", response);
  process.exit(1);
}

// Save plan for debugging (NOT committed)
fs.writeFileSync("agent_plan.md", withoutDiff + "\n", "utf8");

// Apply patch
console.log("Applying patch via git apply ...");
try {
  execSync("git apply --whitespace=fix -", {
    input: diff + "\n",
    stdio: ["pipe", "inherit", "pipe"],
    encoding: "utf8",
  });
} catch (e) {
  console.error("git apply failed.");
  console.error("Patch was:\n", diff);
  process.exit(1);
}

// Install + build
let buildOk = false;
let buildLog = "";

console.log("Installing dependencies (npm ci) ...");
try {
  shLive("npm ci");
} catch (e) {
  console.error("npm ci failed.");
  process.exit(1);
}

console.log("Running build (npm run build) ...");
try {
  buildLog = sh("npm run build");
  buildOk = true;
} catch (e) {
  buildLog = (e?.stdout ?? "") + "\n" + (e?.stderr ?? "");
  buildOk = false;
}

// Diff summary
const diffStat = sh("git diff --stat").trim();
const changedFiles = sh("git diff --name-only").trim();

// Create PR body
const buildStatusLine = buildOk ? "✅ `npm run build` passed" : "❌ `npm run build` failed";
const buildLogTail = tail(buildLog || "(no output captured)", 120);

const prBody = `
## Context
Closes #${issueNumber}

### Issue title
${issueTitle}

### Issue description
${issueBodySafe}

---

## Plan (from agent)
${withoutDiff || "_(no plan text)_"} 

---

## What changed
**Files changed:**
\`\`\`
${changedFiles || "(none)"}
\`\`\`

**Diffstat:**
\`\`\`
${diffStat || "(no diffstat)"}
\`\`\`

---

## Build result
${buildStatusLine}

<details>
<summary>Build output (tail)</summary>

\`\`\`
${buildLogTail}
\`\`\`

</details>

---

## Run metadata
- Model: \`${model}\`
- Trigger: \`${triggerLabel}\`
- Branch: \`${branchName}\`
- Workflow run: https://github.com/${repo}/actions/runs/${runId}
`.trim() + "\n";

fs.writeFileSync("pr_body.md", prBody, "utf8");

if (!buildOk) {
  console.error("Build failed. PR body generated; stopping so CI is honest.");
  process.exit(2); // fail the job; you'll see logs in Actions
}

console.log("Agent build-small completed successfully.");
