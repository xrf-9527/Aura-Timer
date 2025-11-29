---
description: Update CLAUDE.md with new lessons learned, patterns, or guidelines
argument-hint: <section> <guideline>
allowed-tools: Read(.claude/CLAUDE.md), Edit(.claude/CLAUDE.md)
model: sonnet
---

# Update Project Memory

Add new guidelines, lessons learned, or best practices to `.claude/CLAUDE.md` based on recent discoveries.

## Usage Pattern

This command helps capture knowledge when you discover:
- A bug that could have been prevented with a guideline
- A better pattern or approach for this project
- A common mistake to avoid
- A new architectural decision
- Updated dependencies or configuration

## Arguments

**Section**: Which CLAUDE.md section to update
- `best-practices` - Add to coding conventions
- `architecture` - Document design decisions
- `known-issues` - Add gotchas and workarounds
- `build` - Update build procedures
- `troubleshooting` - Add common problems and solutions

**Guideline**: What to add (can be multi-line)

Example: `/update-memory best-practices "Always use primitive dependencies in useEffect arrays"`

## Current CLAUDE.md

@.claude/CLAUDE.md

## Update Guidelines

When adding new content:

1. **Be Specific**: "Use X pattern" is better than "Write good code"
2. **Be Concise**: One clear sentence > paragraph of explanation
3. **Include Why**: Brief context on why this matters
4. **Add Example**: Code snippet if it clarifies (but keep it short)
5. **Link, Don't Duplicate**: Reference official docs rather than copy

### Format Standards

**For Best Practices:**
```markdown
- **DO** / **DON'T**: Clear directive with brief reason
- Link to official docs for details
```

**For Architecture Decisions:**
```markdown
### Component/Feature Name
**Decision**: What was chosen
**Reason**: Why this approach (1-2 sentences)
**Pattern**: Key implementation detail
```

**For Known Issues:**
```markdown
**Issue**: Brief description
- **Cause**: Root cause
- **Solution**: How to fix
- **Status**: ✅ Resolved | ⚠️ Workaround needed
```

## Validation Checklist

Before adding, verify:
- [ ] Is this project-specific? (Not generic programming advice)
- [ ] Is this actionable? (Concrete enough to follow)
- [ ] Is this still relevant? (Not outdated or deprecated)
- [ ] Is this unique? (Not already documented elsewhere in CLAUDE.md)
- [ ] Is this concise? (Could it be shorter without losing meaning?)

## Process

1. **Read current section**: Understand existing content
2. **Check for duplicates**: Ensure not already covered
3. **Format appropriately**: Follow section's style
4. **Place correctly**: Add in logical location (not just at end)
5. **Verify build**: Ensure markdown is valid
6. **Preview change**: Show before/after diff

## Output Format

```markdown
## Proposed Addition to [Section Name]

### Location: After line X

**Before:**
[existing content if relevant]

**After:**
[existing content]
+ [new guideline in proper format]

### Rationale
- Why: [brief explanation]
- Impact: [who this helps/what it prevents]
- Token cost: +X lines

Proceed with update? (yes/no)
```

## Anti-Patterns to Avoid

❌ **Don't add**:
- Generic advice ("Write clean code")
- Temporary workarounds (use git commit message instead)
- Verbose explanations (link to docs)
- Personal preferences without team consensus
- Duplicate information already in CLAUDE.md

✅ **Do add**:
- Project-specific patterns
- Lessons from actual bugs
- Team-agreed conventions
- Critical gotchas
- Unique architecture decisions

## After Update

Suggest running `/tighten-docs` if:
- Multiple updates added recently
- Section is getting verbose
- Token count is growing significantly
