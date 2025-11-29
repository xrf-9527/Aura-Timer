# Aura Timer - Project Memory

## Project Overview

Aura Timer is a macOS-inspired floating timer widget built with React 19.2, TypeScript, and Tailwind CSS. The application features:
- A draggable glassmorphism timer widget
- AI-powered time editing via Google Gemini
- Automatic rotating eye-friendly HD background images (12 curated nature photos)
- Keyboard shortcuts (Space: Play/Pause, R: Reset)
- Smooth fade transitions and modern UI

**Tech Stack:**
- React 19.2.0
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

## SessionStart Hook (Auto-Initialization)

**Purpose**: Automatically install npm dependencies in Claude Code web/remote sessions

**Configuration**: `.claude/settings.json` → runs `scripts/install_deps.sh` on startup

**How it works**:
- Only runs in web/remote environments (`$CLAUDE_CODE_REMOTE == "true"`)
- Skips if dependencies already exist (React, Vite, TypeScript)
- Prefers `npm ci` (~30s) with fallback to `npm install` (~60s)
- Local development is unaffected (hook skips automatically)

**Key features**:
- Uses `npm ci` to enforce exact versions from `package-lock.json`
- Subsequent runs are fast (~1s detection skip)
- Persists `NODE_ENV=development` to session

**Troubleshooting**: See detailed comments in `scripts/install_deps.sh`
**Disable**: Empty the `SessionStart` array in `.claude/settings.json`

## Working with Claude Code Agent

**IMPORTANT**: Always verify against official documentation using the `claude-code-guide` agent when uncertain about React, Claude Code, or TypeScript best practices. Don't rely on assumptions—official docs change frequently (especially React 19.2 patterns).

## Custom Slash Commands

This project includes custom slash commands for common workflows. All commands are in `.claude/commands/`.

### Available Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `/tighten-docs` | Optimize CLAUDE.md to reduce token usage while preserving essential information | `/tighten-docs` |
| `/review-best-practices` | Review code against project best practices defined in CLAUDE.md | `/review-best-practices [file-path]` |
| `/check-build` | Run TypeScript and Vite build checks, analyze and fix any errors | `/check-build` |
| `/update-memory` | Update CLAUDE.md with new lessons learned or guidelines | `/update-memory <section> <guideline>` |

### Workflow Pattern

**Best practice workflow** (inspired by high-performing teams):

1. **Spot an issue**: Find code that could be better or a repeated mistake
2. **Update memory**: Use `/update-memory` to add guideline to CLAUDE.md
3. **Tighten rules**: Run `/tighten-docs` to ensure documentation stays concise
4. **Review code**: Use `/review-best-practices` to check compliance

This creates **clear guardrails** for future development and prevents repeating the same issues.

### Command Details

**`/tighten-docs`** - Token Optimizer
- Analyzes CLAUDE.md for redundancy and verbosity
- Follows official "navigation hub" philosophy
- Proposes optimizations with before/after examples
- Asks for approval before making changes

**`/review-best-practices [file-path]`** - Code Quality Checker
- Reviews code against React 19.2 best practices
- Flags `useCallback` misuse, accessibility issues, type errors
- Provides compliance score and actionable fixes
- Can review specific file or recent git changes

**`/check-build`** - Build Validator
- Runs TypeScript type check and Vite build
- Analyzes errors with context-specific explanations
- Proposes fixes for common Aura Timer build issues
- Verifies bundle size and build output

**`/update-memory <section> <guideline>`** - Knowledge Capture
- Adds new guidelines to CLAUDE.md based on discoveries
- Validates for specificity, conciseness, and uniqueness
- Formats according to section standards
- Prevents duplicate or outdated information

## Build & Test Procedures

### Before Committing Code
1. **Always run build**: `npm run build`
2. **Fix all TypeScript errors**: The build uses strict mode
3. **Check for unused imports**: TypeScript will flag them as errors
4. **Test in browser**: Run `npm run dev` and manually verify functionality

### Build Configuration
- TypeScript strict mode is enabled
- `noUnusedLocals` and `noUnusedParameters` are enforced
- Build output: `dist/` directory (excluded from git)
- Vite bundle analyzer shows ~217KB main bundle (68KB gzipped)

## Coding Conventions

### React 19.2 Best Practices (CRITICAL)

- **DO NOT use `useCallback` by default** - Move functions inside `useEffect` when only used there ([official guidance](https://react.dev/reference/react/useCallback))
- **DO** use primitive dependencies in `useEffect` dependency arrays, not function references
- **DO** use named exports for components, default export only for App.tsx

### TypeScript Configuration

**tsconfig.json settings:**
- `jsx: "react-jsx"` - Use automatic JSX runtime (React 19.2)
- `esModuleInterop: true` - Proper module compatibility
- `allowSyntheticDefaultImports: true` - Import flexibility
- `types: ["node"]` - Include Node.js types for process, etc.
- `typeRoots: ["./node_modules/@types"]` - Explicit type resolution

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

### Glassmorphism Design

- macOS-style backdrop blur with semi-transparent backgrounds, subtle shadows
- Pointer events disabled on background layer to allow widget dragging

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

## Dependencies & Versions

**Production Dependencies:**
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "@google/genai": "^1.30.0"
}
```

**Dev Dependencies:**
```json
{
  "typescript": "^5.3.0",
  "vite": "^7.2.4",
  "@vitejs/plugin-react": "^5.1.1",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3",
  "@types/node": "^24.10.1",
  "wrangler": "^4.51.0"
}
```

## Deployment

- **Platform**: Cloudflare Workers via Wrangler (`npm run deploy`)
- **Note**: Set Gemini API key as environment variable in production

## Git Workflow

**Branch Naming Convention:**
- Feature branches: `claude/<feature-description>-<session-id>`
- Example: `claude/rotating-background-images-01E4U4YBpojJ7DGtUG4jYmFJ`

**Commit Message Format:**
```
<type>: <description>

<body with details>

Types: feat, fix, refactor, chore, docs, style, test
```

**Before Pushing:**
1. Always test build: `npm run build`
2. Push to feature branch with session ID
3. Use `git push -u origin <branch-name>` for new branches

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

## Best Practices Checklist

Before committing code, ensure:
- [ ] `npm run build` succeeds with zero errors
- [ ] No unused imports or variables (TypeScript will error)
- [ ] Functions are NOT wrapped in unnecessary `useCallback`
- [ ] All `useEffect` hooks have proper dependency arrays
- [ ] Components have TypeScript interfaces for props
- [ ] Accessibility attributes are present where needed
- [ ] Code follows React 19.2 official guidelines
- [ ] **When uncertain, used `claude-code-guide` agent to verify against official docs**

## Resources

**Official Documentation** (query via `claude-code-guide` agent):
- Claude Code: https://code.claude.com/docs
- React 19: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- Vite: https://vitejs.dev/guide

## Team Notes

- This project prioritizes **code simplicity over premature optimization**
- **ALWAYS verify against official documentation** using `claude-code-guide` agent - don't rely on assumptions
- Follow React official documentation for best practices, not blog posts or outdated tutorials
- When in doubt about a pattern or convention, query the official docs first
- Avoid over-engineering; keep solutions focused and minimal
- Review CLAUDE.md when starting new features to stay aligned

---

**Last Updated**: 2025-11-29
**Project Version**: 1.0.0
**Maintained By**: Team (via Claude Code Agent)
