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

## Working with Claude Code Agent

### Querying Official Documentation (IMPORTANT)

**When you need to check React, Claude Code, or other official documentation:**

❌ **DO NOT** rely on memory or assumptions
✅ **DO** use the Task tool with `claude-code-guide` agent to query official docs

**Example - Checking React Best Practices:**
```typescript
// Use this pattern when uncertain about React conventions
Task({
  subagent_type: "claude-code-guide",
  prompt: "Look up the official React documentation about useCallback best practices.
          I need to verify when it should and shouldn't be used."
})
```

**Example - Claude Code Features:**
```typescript
// Query Claude Code capabilities
Task({
  subagent_type: "claude-code-guide",
  prompt: "Check the official Claude Code documentation about CLAUDE.md files.
          What should be included and what's the recommended structure?"
})
```

**Why This Matters:**
- Official documentation changes frequently (React 19.2 has new patterns)
- Avoids implementing outdated or incorrect patterns
- Ensures code follows current best practices
- Prevents technical debt from wrong assumptions

**Common Documentation to Verify:**
- React hooks usage patterns → `claude-code-guide` agent
- TypeScript configuration → `claude-code-guide` agent
- Claude Code features (hooks, slash commands, MCP) → `claude-code-guide` agent
- Vite configuration → Web search or official docs
- Tailwind CSS classes → Web search

**Documentation Sources Priority:**
1. **Official React Docs**: https://react.dev (use claude-code-guide agent)
2. **Claude Code Docs**: https://code.claude.com/docs (use claude-code-guide agent)
3. **TypeScript Handbook**: https://www.typescriptlang.org/docs/
4. **Vite Guide**: https://vitejs.dev/guide/

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

**DO NOT use `useCallback` unless absolutely necessary**
- ❌ **AVOID**: Wrapping functions in `useCallback` by default
- ✅ **DO**: Move functions inside `useEffect` when they're only used there
- **Reference**: https://react.dev/reference/react/useCallback
- **Principle**: "Moving functions inside Effects when possible"

Example (CORRECT):
```typescript
useEffect(() => {
  const handleEvent = () => { /* logic */ };
  const timer = setInterval(handleEvent, 1000);
  return () => clearInterval(timer);
}, [dependency1, dependency2]); // Only primitive dependencies
```

Example (INCORRECT - over-memoization):
```typescript
const handleEvent = useCallback(() => { /* logic */ }, [dep1, dep2]);
useEffect(() => {
  const timer = setInterval(handleEvent, 1000);
  return () => clearInterval(timer);
}, [handleEvent]); // Function dependency creates complexity
```

### TypeScript Configuration

**tsconfig.json settings:**
- `jsx: "react-jsx"` - Use automatic JSX runtime (React 19.2)
- `esModuleInterop: true` - Proper module compatibility
- `allowSyntheticDefaultImports: true` - Import flexibility
- `types: ["node"]` - Include Node.js types for process, etc.
- `typeRoots: ["./node_modules/@types"]` - Explicit type resolution

### Component Patterns

**Function Components:**
- Use named exports for components: `export function ComponentName() {}`
- Use default export only for App.tsx
- Add TypeScript interfaces for all props
- Include JSDoc comments with examples for reusable components

**Accessibility:**
- Add `role="presentation"` for decorative elements
- Use `aria-hidden="true"` for non-interactive backgrounds
- Ensure keyboard navigation works (Space, R keys for timer)

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

**Design Decision**: Use automatic background rotation with eye-friendly images
- **12 curated images** from Unsplash (nature themes: forests, mountains, lakes)
- **5-minute rotation interval** by default (configurable)
- **2-second fade transition** for smooth visual experience
- **Preloading strategy**: Preload next image to prevent loading flashes

**Implementation** (`hooks/useBackgroundRotation.ts`):
```typescript
// Pattern: Functions inside useEffect (React 19.2 best practice)
useEffect(() => {
  const preloadImage = (index: number) => { /* ... */ };
  const switchToNext = () => { /* ... */ };
  const timer = setInterval(switchToNext, interval);
  return () => clearInterval(timer);
}, [enabled, interval, transitionDuration]); // Primitive dependencies only
```

**Color Psychology for Eye Health:**
- Green tones (forests, fields) - optimal for reducing eye strain
- Blue tones (sky, water) - calming and visually relaxing
- Avoid high-contrast or overly bright images
- All images are 1920px width, quality=80 for optimal loading

### Glassmorphism Design

The timer widget uses macOS-style glassmorphism:
- Backdrop blur with semi-transparent backgrounds
- Subtle shadows for depth perception
- Smooth hover transitions
- Pointer events disabled on background layer to allow dragging

## Known Issues & Considerations

### TypeScript Build Errors

**Previous Issue** (RESOLVED): TypeScript couldn't find React type definitions
- **Root Cause**: Missing `esModuleInterop` and explicit `typeRoots` configuration
- **Solution**: Updated tsconfig.json with proper module resolution settings
- **Status**: ✅ Build now succeeds with zero errors

### Browser Compatibility

- **Import Maps**: Uses browser-native import maps (requires modern browsers)
- **Tailwind CDN**: Loaded via CDN for simplicity (consider bundling for production)
- **CSS Properties**: Uses modern CSS like `backdrop-filter` (check caniuse.com)

### Performance Considerations

- Background images are loaded from Unsplash CDN
- Images are pre-sized (1920px) to avoid loading huge files
- Consider adding loading states if network is slow
- setInterval is cleared on component unmount (no memory leaks)

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

**Platform**: Cloudflare Workers
- Uses Wrangler for deployment: `npm run deploy`
- CDN-based asset delivery for optimal performance
- Consider environment variables for Gemini API key in production

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

### Official Documentation (Query via claude-code-guide agent)
- **Claude Code Documentation**: https://code.claude.com/docs
- **Claude Code Memory Guide**: https://code.claude.com/docs/en/memory.md
- **React 19 Documentation**: https://react.dev/blog/2024/04/25/react-19
- **useCallback Best Practices**: https://react.dev/reference/react/useCallback
- **React Hooks Reference**: https://react.dev/reference/react

### Additional Resources
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Guide**: https://vitejs.dev/guide/
- **Unsplash API**: https://unsplash.com/developers (for background images)
- **Tailwind CSS**: https://tailwindcss.com/docs

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
