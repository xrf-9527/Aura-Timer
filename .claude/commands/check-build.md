---
description: Run TypeScript and Vite build checks, analyze and fix any errors
allowed-tools: Bash(npm run build:*), Bash(npm run:*), Bash(npx tsc:*)
model: sonnet
---

# Build Validation & Error Resolution

Run comprehensive build checks and provide actionable fixes for any errors.

## Step 1: TypeScript Type Check

!`npx tsc --noEmit`

## Step 2: Full Production Build

!`npm run build`

## Error Analysis Framework

If errors found, analyze each error:

### TypeScript Errors
- **TS2304** (Cannot find name): Missing import or typo
- **TS2322** (Type not assignable): Type mismatch, need type assertion or interface fix
- **TS2339** (Property does not exist): Incorrect property access or missing type definition
- **TS6133** (Unused variable): Remove or prefix with `_`
- **TS6192** (All imports are unused): Remove entire import statement

### Vite Build Errors
- **Module not found**: Missing dependency or incorrect import path
- **Parse error**: Syntax error in source file
- **Transform error**: Issue with JSX/TSX transformation
- **Circular dependency**: Refactor to break cycle

### Common Aura Timer Issues
1. **React import style**: Should use automatic JSX runtime (no need to import React in React 19.2)
2. **Missing types for @google/genai**: May need type assertion or ambient declaration
3. **Unsplash URLs**: Ensure background image URLs are properly escaped in strings
4. **Import maps**: Browser-specific features may confuse bundler

## Resolution Strategy

For each error:

1. **Identify root cause**
   - Read error message carefully
   - Check file and line number
   - Understand what TypeScript/Vite expects

2. **Propose fix**
   - Show specific code change
   - Explain why this fixes the issue
   - Consider side effects

3. **Implement fix (if authorized)**
   - Use Edit tool to make changes
   - Re-run build to verify
   - Confirm zero errors

## Success Criteria

Build passes when:
- ✅ `npx tsc --noEmit` returns 0 errors
- ✅ `npm run build` completes successfully
- ✅ Output shows bundle size (~217KB expected)
- ✅ No warnings about unused code or circular deps

## Output Format

### Build Status
```
TypeScript: ✅ 0 errors | ❌ N errors
Vite Build: ✅ Success | ❌ Failed
Bundle Size: 217KB (68KB gzipped)
```

### Error Details
```
Error 1: [TS2304] Cannot find name 'React'
  File: src/components/TimerWidget.tsx:1
  Cause: Unnecessary React import in React 19.2
  Fix: Remove import statement (automatic JSX runtime handles it)
```

### Action Plan
1. Fix critical errors (prevent build)
2. Address warnings (improve code quality)
3. Verify bundle size hasn't inflated

## Post-Build Verification

After successful build:
- Check `dist/` output structure
- Verify `index.html` and asset bundle generated
- Confirm no unexpected bundle bloat
- Ready for `npm run preview` or `npm run deploy`
