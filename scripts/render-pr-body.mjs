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
const mode = env("MODE", "smoke"); // smoke | research | build
const branchName = env("BRANCH_NAME", "");

const issueBodySafe =
  issueBody && issueBody.trim().length > 0 ? issueBody : "_(No issue description provided)_";

const header = `## Context
Closes #${issueNumber}

### Issue title
${issueTitle}

### Issue description
${issueBodySafe}
`;

let whatThisDoes = "";
if (mode === "smoke") {
  whatThisDoes = `## What this PR does
- ✅ Smoke-test change (**no LLM**)
- ✅ Validates: label → runner → branch → PR
`;
} else if (mode === "research") {
  whatThisDoes = `## What this PR does
- 📚 Adds research findings and recommendations
- ❗ No production code changes (unless explicitly stated)
`;
} else {
  whatThisDoes = `## What this PR does
- ✅ Implements the requested change
- ✅ Includes tests/updates where appropriate
`;
}

const checklist = `## Review checklist
- [ ] PR is scoped to the issue
- [ ] No unrelated changes
- [ ] Build passes (\`npm run build\`)
- [ ] Tests pass (\`npm run test\` / \`npm test\`) if configured
`;

const meta = `## Run metadata
- Repo: ${repo}
- Issue: #${issueNumber}
- Trigger: \`${triggerLabel}\`
- Branch: \`${branchName}\`
- Workflow run: https://github.com/${repo}/actions/runs/${runId}
`;

const body = [header, "---\n", whatThisDoes, "\n---\n", checklist, "\n---\n", meta, ""].join("\n");

fs.writeFileSync("pr_body.md", body, "utf8");
console.log("Wrote pr_body.md");
