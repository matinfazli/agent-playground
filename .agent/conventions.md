# Agent Playground Code Conventions

## Overview
This document outlines the coding conventions and standards used in the agent-playground project. These conventions ensure consistency, maintainability, and best practices across the codebase.

## Technology Stack & Configuration

### TypeScript Configuration
- **Target**: ES2022 for application code, ES2023 for Node.js tooling
- **Module System**: ESNext modules with bundler resolution
- **JSX**: React JSX transform (`react-jsx`)
- **Strict Mode**: Full TypeScript strict mode enabled
- **Linting**: Comprehensive linting with unused variable detection
- **Build Info**: Separate tsbuildinfo files for incremental builds

### ESLint Configuration
- **Base Rules**: ESLint recommended + TypeScript recommended
- **React Rules**: React Hooks rules + React Refresh rules for Vite
- **File Scope**: Applied to `**/*.{ts,tsx}` files
- **Ignores**: `dist/` directory excluded from linting
- **Browser Globals**: Browser environment globals available

## Code Style & Structure

### File Organization
```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── assets/        # Static assets (images, icons)
├── App.tsx        # Main application component
├── main.tsx       # Application entry point
└── *.css          # Component-specific styles
```

### Import Conventions
- **React imports**: Import hooks and components from 'react'
- **Relative imports**: Use relative paths (`./`, `../`) for internal modules
- **Asset imports**: Import from `src/assets/` for local assets
- **Public assets**: Reference from `/` root for public assets
- **CSS imports**: Import component-specific styles at the top

### Component Structure
- **Function Components**: Use function declarations with PascalCase naming
- **Export Pattern**: Default export for main components
- **Props Interface**: Define interfaces for component props when needed
- **State Management**: Use React hooks (useState, useEffect, etc.)
- **Event Handlers**: Inline arrow functions for simple handlers

### Naming Conventions

#### Files & Directories
- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (`apiUtils.ts`, `dateHelpers.ts`)
- **Types**: PascalCase with `.types.ts` or `.d.ts` suffix
- **Assets**: kebab-case for images (`react-logo.svg`)
- **Directories**: camelCase or kebab-case (`user-profile/`, `apiUtils/`)

#### Variables & Functions
- **camelCase**: Variables, functions, and methods
- **PascalCase**: Components, types, interfaces, and classes
- **UPPER_SNAKE_CASE**: Constants and environment variables
- **Prefix Conventions**:
  - `is*`, `has*`, `can*` for boolean variables
  - `get*`, `set*`, `handle*` for functions
  - `on*` for event handlers

### CSS Conventions
- **Component Styles**: One CSS file per component (`Component.css`)
- **Class Naming**: kebab-case for CSS classes (`.logo`, `.card`)
- **CSS Variables**: Not currently used (consider adding for theming)
- **Responsive Design**: Media queries for accessibility (e.g., `prefers-reduced-motion`)
- **Animations**: CSS keyframes for complex animations

## Development Workflow

### Build & Development
- **Development**: `npm run dev` (Vite dev server with HMR)
- **Build**: `npm run build` (TypeScript check + Vite build)
- **Linting**: `npm run lint` (ESLint on all source files)
- **Preview**: `npm run preview` (Serve production build locally)

### Git & Version Control
- **Branching**: Feature branches for new functionality
- **Commits**: Descriptive commit messages
- **Pull Requests**: Code review required for main branch merges

## React Best Practices

### Hooks Usage
- **useState**: For local component state
- **useEffect**: For side effects (API calls, subscriptions)
- **useCallback**: For expensive computations in dependencies
- **useMemo**: For expensive calculations to avoid re-computation

### Performance Considerations
- **Key Props**: Always provide `key` props for list items
- **Memoization**: Use React.memo for expensive components
- **Lazy Loading**: Consider dynamic imports for large components

## Dependency Management

### Package Organization
- **Runtime Dependencies**: Minimal core dependencies (React, ReactDOM)
- **Dev Dependencies**: Build tools, type definitions, linting
- **Version Pinning**: Caret ranges (^) for patch updates
- **Type Definitions**: Separate @types packages for non-TypeScript libraries

## Accessibility & UX
- **Semantic HTML**: Use appropriate HTML elements
- **Alt Text**: Provide descriptive alt text for images
- **Keyboard Navigation**: Ensure interactive elements are keyboard accessible
- **Motion Preferences**: Respect `prefers-reduced-motion` settings

## Future Considerations
- **Testing**: Add Jest/Vitest for unit and integration tests
- **State Management**: Consider Zustand or Redux for complex state
- **Styling**: Evaluate CSS-in-JS (styled-components) or CSS modules
- **Component Library**: Consider adding a design system
- **Internationalization**: Plan for i18n support as the app grows
