# Testing Guide for Agent Playground

This document provides instructions for running various types of tests and checks in the agent-playground project.

## Unit Tests

### Current Status: Not Configured
The project does not currently have unit tests configured. To add unit testing:

### Recommended Setup (Vitest)
```bash
# Install Vitest and React Testing Library
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configuration Steps
1. Create `vitest.config.ts` in the project root
2. Add test scripts to `package.json`
3. Create test files alongside components (e.g., `Component.test.tsx`)

### Future Test Commands (after setup)
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- Component.test.tsx
```

## Linting

### ESLint Configuration
The project uses ESLint with TypeScript and React-specific rules.

### Run Linting
```bash
# Run ESLint on all files
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### ESLint Rules Applied
- **Base Rules**: ESLint recommended rules
- **TypeScript**: TypeScript ESLint recommended rules
- **React**: React Hooks rules and React Refresh rules
- **File Scope**: Applied to `**/*.{ts,tsx}` files
- **Ignores**: `dist/` directory is excluded

### Common Issues and Solutions
- **Unused variables**: Remove or prefix with `_` if intentionally unused
- **Missing dependencies**: Add dependencies to useEffect or useCallback arrays
- **React Hooks violations**: Follow the Rules of Hooks

## Type Checking

### TypeScript Configuration
The project uses TypeScript with strict mode and separate configurations for app and Node.js code.

### Run Type Checking

#### Method 1: Via Build Command (Recommended)
```bash
# Run TypeScript type checking (part of build process)
npm run build
```

#### Method 2: Direct TypeScript Check
```bash
# Check types without building
npx tsc --noEmit

# Check specific config
npx tsc --noEmit --project tsconfig.app.json
npx tsc --noEmit --project tsconfig.node.json
```

#### Method 3: IDE Integration
Most modern IDEs (VS Code, WebStorm, etc.) automatically run TypeScript type checking in the background and show errors inline.

### TypeScript Strict Mode Features
- **strict**: All strict type checking options enabled
- **noUnusedLocals**: Warn about unused local variables
- **noUnusedParameters**: Warn about unused function parameters
- **noFallthroughCasesInSwitch**: Prevent switch case fallthrough
- **noUncheckedSideEffectImports**: Check for side effects in imports

### Common Type Errors and Solutions
- **Implicit any**: Add explicit type annotations
- **Property does not exist**: Check object types or use optional chaining
- **Type mismatch**: Ensure types align or use type assertions carefully
- **Unused variables**: Remove or use or prefix with `_`

## Continuous Integration (Future)

### Recommended CI Pipeline
```yaml
# Example GitHub Actions workflow
- name: Type Check
  run: npm run build

- name: Lint
  run: npm run lint

- name: Test
  run: npm run test
```

## Development Workflow

### Pre-commit Hooks (Recommended)
Consider adding Husky and lint-staged for automatic checks:

```bash
npm install --save-dev husky lint-staged
```

### VS Code Extensions
Recommended extensions for development:
- **ESLint**: Real-time linting
- **TypeScript Importer**: Auto-imports
- **Prettier**: Code formatting (if added)

## Troubleshooting

### Common Issues

#### ESLint not working
```bash
# Clear ESLint cache
npx eslint --cache-location .eslintcache --print-config src/App.tsx
```

#### TypeScript not recognizing types
```bash
# Regenerate node_modules/.cache
rm -rf node_modules/.cache
npm install
```

#### Build failing but no obvious errors
```bash
# Run with verbose output
npm run build -- --verbose
```

## Adding Tests (Future Enhancement)

### Test File Structure
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.css
│   └── ...
└── utils/
    ├── api.ts
    └── api.test.ts
```

### Test Examples (after setup)
```typescript
// Component test example
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

This testing setup provides a solid foundation for ensuring code quality and preventing regressions as the agent-playground project grows.
