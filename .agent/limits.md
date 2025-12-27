# Agent Limits and Safety Rules

## ⚠️ Critical Safety Guidelines

These limits are **strict** and **must always be respected**. They exist to prevent unintended damage to the codebase and ensure safe, controlled development.

## Execution Limits

### Time Constraints
- **Maximum runtime per operation**: 15 minutes
- **Maximum iterations per task**: 8 attempts
- **Loop detection**: Immediately stop if stuck in repetitive cycles

### Progress Requirements
- Each iteration must show measurable progress
- If blocked for >5 minutes without progress, seek user clarification

## File Operation Limits

### Modification Limits
- **Maximum lines modified per iteration**: 200 lines
- **Maximum files edited per iteration**: 10 files
- **Preferred edit method**: Targeted search-and-replace over full rewrites

### Build Configuration Protection
- **Do not modify** build configs (`vite.config.ts`, `tsconfig.*.json`, `eslint.config.js`) unless:
  - Explicitly requested by user
  - Critical for task completion
  - Changes are minimal and well-tested

## Directory Permissions

### ✅ Allowed Areas
- `src/` - Application source code
- `public/` - Static public assets
- `tests/` (when added) - Test files
- `README.md` - Project documentation

### ❌ Restricted Areas
- `.github/workflows/` - CI/CD pipelines
- `.agent/` - Agent configuration files (including this file)
- `node_modules/` - Dependencies (managed by npm/yarn)
- `dist/` - Build output directory
- `package-lock.json` - Dependency lock file
- Root configuration files unless explicitly authorized

## Forbidden Actions

### Dependency Management
- **No dependency upgrades** unless explicitly requested
- **No package.json modifications** without user approval
- **No npm install** operations without explicit instruction

### Code Changes
- **No unrelated refactors** - stick to the assigned task
- **No architectural changes** without user consent
- **No database schema modifications** (if applicable)

## Code Editing Rules

### Best Practices
- **Prefer patch-based edits** over full file rewrites
- **Use search-and-replace** for targeted changes
- **Preserve existing code style** and conventions
- **Explain intent** before making significant changes

### Quality Standards
- **Maintain TypeScript strictness** - no `any` types or disabled checks
- **Follow React best practices** - proper hooks usage, key props, etc.
- **Preserve accessibility** - alt text, semantic HTML, keyboard navigation

## Failure Handling

### Stop Conditions
- **Test failures**: If the same test fails twice with no progress → stop and report
- **Build failures**: If build fails unexpectedly → stop and seek guidance
- **API uncertainty**: Never guess APIs — always inspect files first
- **Complex requirements**: If task complexity exceeds safe limits → request clarification

### Error Reporting
- **Clear error messages** with specific details
- **Suggest next steps** when stopping due to limits
- **Preserve work done** up to the failure point

## Development Workflow

### Pre-Edit Checklist
- [ ] Verify task is within scope
- [ ] Check file/directory permissions
- [ ] Ensure changes align with project conventions
- [ ] Confirm no build config modifications needed

### Post-Edit Verification
- [ ] Run relevant tests if available
- [ ] Verify build still passes
- [ ] Check linting passes
- [ ] Confirm application functionality

## Emergency Procedures

### If Something Goes Wrong
1. **Stop immediately** - don't compound errors
2. **Report the issue** with specific details
3. **Revert changes** if they break the build
4. **Wait for user guidance** before proceeding

### Recovery Priority
1. Restore build functionality
2. Fix critical errors
3. Address warnings and style issues
4. Optimize performance (if relevant)

---

**Remember**: When in doubt, ask the user. It's better to seek clarification than risk breaking the codebase.