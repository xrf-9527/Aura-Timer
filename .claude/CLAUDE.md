# Aura Timer - Project Memory

## Project Overview

Aura Timer is a macOS-inspired floating timer widget built with React 19.2, TypeScript, and Tailwind CSS. The application features:
- A draggable glassmorphism timer widget
- AI-powered time editing via Google Gemini
- Automatic rotating eye-friendly HD background images (12 curated nature photos)
- Keyboard shortcuts (Space: Play/Pause, R: Reset)
- Smooth fade transitions and modern UI

**Tech Stack:**
- React 19.2.0 with React Compiler 1.0.0
- TypeScript 5.3.0
- Vite 7.2.4
- Tailwind CSS (via CDN)
- Google Gemini AI (@google/genai)
- Deployed on Cloudflare Workers (wrangler)

## Getting Started

### Setup
```bash
npm install              # Install all dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run deploy          # Deploy to Cloudflare Workers
```

### First-Time Setup
1. Ensure Node.js is installed (uses @types/node for TypeScript)
2. Run `npm install` to install all dependencies
3. The project uses ESM import maps for browser module loading

## SessionStart Hook

Auto-installs dependencies in Claude Code web/remote sessions via `scripts/install_deps.sh`. Uses `npm ci` for exact versions (~30s first run, ~1s subsequent). Local development unaffected. Troubleshoot: see script comments. Disable: empty `SessionStart` in `.claude/settings.json`.

## Working with Claude Code Agent

**IMPORTANT**: Always verify against official documentation using the `claude-code-guide` agent when uncertain about React, Claude Code, or TypeScript best practices. Don't rely on assumptions—official docs change frequently (especially React 19.2 patterns).

## Custom Slash Commands

### Available Commands

| Command | Purpose |
|---------|---------|
| `/tighten-docs` | Optimize CLAUDE.md token usage |
| `/review-best-practices [file]` | Check code against project best practices |
| `/check-build` | Run TypeScript/Vite build and fix errors |
| `/update-memory <section> <guideline>` | Capture new guidelines |

**Workflow**: Spot issue → `/update-memory` → `/tighten-docs` → `/review-best-practices`

**Note**: Commands are self-documenting; run them to see detailed instructions.

## Build & Test

**Before commit**: `npm run build` (strict mode, fixes unused imports) → manual test via `npm run dev`
**Output**: `dist/` (~217KB, 68KB gzipped)

## Coding Conventions

### React 19.2 Best Practices (CRITICAL)

**✅ Implemented Optimizations:**
- **React Compiler 1.0.0 Enabled** - Automatic memoization eliminates manual `useCallback/useMemo/memo` ([announcement](https://react.dev/blog/2025/10/07/react-compiler-1))
- **Function Placement** - Event listeners moved inside `useEffect` blocks (see `useDraggable.ts:49-86`, `TimerWidget.tsx:144-197`)
- **Primitive Dependencies** - `useEffect` arrays contain only primitive values, not function references
- **Merged Effects** - Wake Lock logic consolidated into single `useEffect` (`TimerWidget.tsx:144-197`)
- **Removed Unnecessary Hooks** - Eliminated 11 `useCallback` instances and 1 `useMemo` across codebase

**Coding Guidelines:**
- **DO NOT use `useCallback`/`useMemo` manually** - React Compiler handles optimization automatically ([official guidance](https://react.dev/reference/react/useCallback))
- **DO** move functions inside `useEffect` when only used there
- **DO** use primitive dependencies in `useEffect` dependency arrays
- **DO** use named exports for components, default export only for App.tsx
- **PREFER `matchMedia` API over `resize` events** - For responsive breakpoints, use `window.matchMedia('(max-width: 768px)').addEventListener('change', handler)` instead of resize events. Only fires when crossing thresholds, not on every pixel change. Include `addListener` fallback for Safari < 14. (See: `useDraggable.ts`, `TimerWidget.tsx`)

### TypeScript Configuration

**tsconfig.json settings:**
- `jsx: "react-jsx"` - Use automatic JSX runtime (React 19.2)
- `esModuleInterop: true` - Proper module compatibility
- `allowSyntheticDefaultImports: true` - Import flexibility
- `types: ["node"]` - Include Node.js types for process, etc.
- `typeRoots: ["./node_modules/@types"]` - Explicit type resolution

**Experimental Web APIs typings:**
- Use `types/web-apis.d.ts` for ambient declarations of experimental browser APIs (Wake Lock, Document Picture-in-Picture).
- Prefer precise interfaces over `any`, and use `unknown` + `instanceof Error` for error handling.
- Keep global browser API augmentations in this file instead of scattering `declare global` blocks in implementation files.

### Component Patterns

- TypeScript interfaces required for all props
- JSDoc comments for reusable components
- Accessibility: `role="presentation"` for decorative elements, keyboard navigation (Space: play/pause, R: reset)

### File Organization
```
/
├── components/          # React components
│   ├── TimerWidget.tsx
│   └── BackgroundLayer.tsx
├── hooks/              # Custom React hooks
│   ├── useDraggable.ts
│   └── useBackgroundRotation.ts
├── services/           # External services
│   └── geminiService.ts
├── App.tsx             # Main app component
├── index.tsx           # Entry point
├── types.ts            # Shared TypeScript types
└── vite.config.ts      # Vite configuration
```

## Key Architecture Decisions

### Background Image Rotation System

**Architecture** (`hooks/useBackgroundRotation.ts`):
- 12 curated eye-friendly nature images from Unsplash (1920px, q=80)
- Random initial image on page load, then 5-min rotation with 2s fade transitions
- Preloads next image to prevent loading flashes
- **Pattern**: Functions inside `useEffect` (React 19.2 best practice) with primitive dependencies only

### High-Precision Timer

Timestamp-based calculation (not tick counting) eliminates cumulative drift. 100ms intervals, ±1s precision over hours. Implementation: `TimerWidget.tsx` (timer tick logic). Full details: [`docs/timer-precision.md`](../docs/timer-precision.md)

### Glassmorphism Design

- macOS-style backdrop blur with semi-transparent backgrounds, subtle shadows
- Pointer events disabled on background layer to allow widget dragging

### PiP System

Strategy pattern for cross-browser support: Document PiP (Chrome/Edge) or Canvas Stream (Firefox/Safari). See [`docs/pip-architecture.md`](../docs/pip-architecture.md)

### React Compiler Integration

**Status**: ✅ Enabled since 2025-12-02

**Configuration** (`vite.config.ts`):
```typescript
plugins: [
  react({
    babel: {
      plugins: [['babel-plugin-react-compiler', {}]]
    }
  })
]
```

**Benefits**:
- Automatic memoization of components and values
- Eliminates need for manual `useCallback`, `useMemo`, and `React.memo`
- Optimizes re-renders without developer intervention
- Maintains code simplicity and readability

**Optimizations Applied**:
- Removed 11 `useCallback` instances (useDraggable: 6, TimerWidget: 4, ActionDock: 1)
- Removed 1 `useMemo` instance (TimerWidget pipCallbacks)
- Consolidated 3 `useEffect` blocks into 1 (TimerWidget Wake Lock logic)
- Simplified dependency arrays to contain only primitive values

**ESLint Integration** (Recommended for Future):
While not currently configured, consider adding `eslint-plugin-react-hooks@latest` to detect Rules of React violations:
```bash
npm install --save-dev eslint eslint-plugin-react-hooks
```

See [React Compiler v1.0 Documentation](https://react.dev/blog/2025/10/07/react-compiler-1) for details.

## Known Issues & Considerations

### TypeScript Build Errors

**Previous Issue** (RESOLVED): TypeScript couldn't find React type definitions
- **Root Cause**: Missing `esModuleInterop` and explicit `typeRoots` configuration
- **Solution**: Updated tsconfig.json with proper module resolution settings
- **Status**: ✅ Build now succeeds with zero errors

### Browser Compatibility & Performance

- Requires modern browsers (import maps, `backdrop-filter` CSS)
- Tailwind loaded via CDN (consider bundling for production)
- Background images from Unsplash CDN (pre-sized 1920px)
- `setInterval` cleanup prevents memory leaks

## Dependencies

See `package.json` for current versions. Key: React 19.2, TypeScript 5.3, Vite 7.2, Gemini AI.

## Deployment

- **Platform**: Cloudflare Workers via Wrangler (`npm run deploy`)
- **Note**: Set Gemini API key as environment variable in production

## Git Workflow

**Branches**: `claude/<feature>-<session-id>` | **Commits**: `<type>: <description>` (feat, fix, refactor, chore, docs) | **Before push**: `npm run build`

## Frequently Used Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build           # TypeScript compile + Vite build
npm run preview         # Preview production build locally

# Deployment
npm run deploy          # Deploy to Cloudflare Workers

# Debugging
npm install             # Reinstall dependencies if types are missing
npx tsc --noEmit        # Check TypeScript errors without building
```

## Resources

**Official Documentation**:
- Claude Code: https://code.claude.com/docs (query via `claude-code-guide` agent)
- React 19: https://react.dev (use WebFetch/WebSearch)
- TypeScript: https://www.typescriptlang.org/docs (use WebFetch/WebSearch)
- Vite: https://vitejs.dev/guide (use WebFetch/WebSearch)

**Project Technical Documentation**:
- [PiP Architecture](../docs/pip-architecture.md) - Hybrid Picture-in-Picture implementation design
- [Timer Precision](../docs/timer-precision.md) - High-precision timestamp-based timer algorithm

## Team Notes

- This project prioritizes **code simplicity over premature optimization**
- **ALWAYS verify against official documentation** - don't rely on assumptions. Use `claude-code-guide` agent for Claude Code docs, WebFetch/WebSearch for other tech stacks
- Follow React official documentation for best practices, not blog posts or outdated tutorials
- When in doubt about a pattern or convention, query the official docs first
- Avoid over-engineering; keep solutions focused and minimal
- Review CLAUDE.md when starting new features to stay aligned

---

**Last Updated**: 2025-12-02 (React Compiler Integration)
**Project Version**: 1.0.0
**Maintained By**: Team (via Claude Code Agent)
