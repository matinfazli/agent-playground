import fs from "node:fs";

function env(name, fallback = "") {
  return process.env[name] ?? fallback;
}

const issueNumber = env("ISSUE_NUMBER");
const issueTitle = env("ISSUE_TITLE");
const issueBody = env("ISSUE_BODY");
const repo = env("REPO");
const runId = env("RUN_ID");
const triggerLabel = env("TRIGGER_LABEL");

const issueBodySafe =
  issueBody && issueBody.trim().length > 0 ? issueBody : "_(No issue description provided)_";

const comment = `## Agent plan (placeholder — no LLM yet)

**Issue:** #${issueNumber} — ${issueTitle}

### Issue description
${issueBodySafe}

---

## Proposed approach
1. Confirm current behavior and reproduce (if applicable)
2. Identify the minimal set of files likely involved
3. Implement the smallest correct change
4. Add/update tests
5. Run:
   - \`npm run build\`
   - \`npm run test\` (or \`npm test\`)

---

## Files to inspect (likely)
- \`src/App.*\`
- \`src/main.*\`
- \`src/components/**\` (if UI change)
- \`src/**\` relevant module for the feature/bug
- Any existing test files in \`src/**\` or \`tests/**\`

---

## Acceptance criteria (draft)
- Change matches issue requirements
- No unrelated refactors
- Build passes
- Tests pass (or explanation if no tests exist)

---

## Run metadata
- Trigger: \`${triggerLabel}\`
- Workflow run: https://github.com/${repo}/actions/runs/${runId}
`;

fs.writeFileSync("plan_comment.md", comment, "utf8");
console.log("Wrote plan_comment.md");
