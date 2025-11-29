---
description: Review code against project best practices defined in CLAUDE.md
argument-hint: [file-path]
allowed-tools: Read(*), Grep(*.tsx), Grep(*.ts), Bash(git diff:*)
model: sonnet
---

# Best Practices Review

Review the specified file (or recent changes) against Aura Timer's coding conventions and best practices.

## Target Code

$ARGUMENTS

If no file specified, review recent changes:
!`git diff HEAD --name-only | grep -E '\.(tsx?|ts)$' | head -5`

## Project Best Practices Checklist

Reference the standards defined in `.claude/CLAUDE.md`:

### React 19.2 Patterns (CRITICAL)
- ❌ **Flag**: Any `useCallback` usage (should move functions inside `useEffect`)
- ❌ **Flag**: Function references in `useEffect` dependency arrays
- ✅ **Verify**: Functions are defined inside `useEffect` when only used there
- ✅ **Verify**: Dependency arrays only contain primitive values
- ✅ **Verify**: Named exports for components (except App.tsx)

### TypeScript Patterns
- ✅ **Verify**: All component props have TypeScript interfaces
- ✅ **Verify**: No unused imports or variables
- ✅ **Verify**: Strict mode compliance (no `any` types unless justified)

### Accessibility
- ✅ **Verify**: `role="presentation"` on decorative elements
- ✅ **Verify**: `aria-hidden="true"` on non-interactive backgrounds
- ✅ **Verify**: Keyboard navigation support where applicable

### Code Quality
- ❌ **Flag**: Over-engineering (unnecessary abstractions, premature optimization)
- ❌ **Flag**: Missing JSDoc comments on reusable components
- ❌ **Flag**: Magic numbers without explanation
- ✅ **Verify**: Clear variable/function names
- ✅ **Verify**: Single responsibility principle

### Common Anti-Patterns to Flag
1. **Over-memoization**: Unnecessary `useMemo`, `useCallback`, `React.memo`
2. **Props drilling**: Passing props through 3+ levels without context
3. **Large components**: Single component >200 lines (suggest splitting)
4. **Side effects in render**: Any mutations during render phase
5. **Missing cleanup**: `setInterval`, `addEventListener` without cleanup

## Review Output Format

Provide:

### 1. Compliance Score
- ✅ Passes: X/Y checks
- ⚠️ Warnings: Z issues
- ❌ Violations: N critical issues

### 2. Detailed Findings

For each issue:
```
Line XX: [VIOLATION] Issue description
- What: Specific problem found
- Why: Which best practice it violates
- Fix: Concrete suggestion with code example
```

### 3. Recommendations

Prioritized list:
1. **Critical** (violates React 19.2 patterns or causes bugs)
2. **Important** (technical debt, maintainability issues)
3. **Nice-to-have** (style improvements, optimizations)

### 4. Positive Observations

Highlight what's done well:
- Excellent TypeScript typing
- Clean component structure
- Good accessibility implementation

## Action Items

If violations found:
- Suggest immediate fixes for critical issues
- Propose refactoring approach for larger issues
- Offer to implement fixes if requested

If all passes:
- Acknowledge clean implementation
- Suggest optional improvements (if any)
