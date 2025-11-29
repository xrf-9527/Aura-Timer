---
description: Optimize and tighten CLAUDE.md to reduce token usage while preserving essential information
allowed-tools: Read(.claude/CLAUDE.md), Edit(.claude/CLAUDE.md)
model: sonnet
---

# Tighten Documentation - Token Optimizer

**Mission**: Analyze `.claude/CLAUDE.md` and optimize it following official Claude Code best practices.

## Current CLAUDE.md Content

@.claude/CLAUDE.md

## Optimization Goals

According to official Claude Code documentation, CLAUDE.md should be a **"navigation hub" not an encyclopedia**:

1. **Remove Redundancy**
   - Eliminate duplicate information
   - Remove verbose examples when a concise bullet point suffices
   - Replace detailed explanations with links to official docs

2. **Quality Over Quantity**
   - Keep project-specific information (architecture decisions, conventions)
   - Remove generic knowledge (standard library usage, common patterns)
   - Focus on what's unique to THIS project

3. **Structure & Navigation**
   - Ensure sections are clearly organized with descriptive headings
   - Group related items under bullet points
   - Use tables for comparison data, not prose

4. **Token Efficiency**
   - Each line should provide actionable value
   - Prefer "what" and "why" over lengthy "how" (link to external docs for "how")
   - Remove outdated or deprecated information

## Analysis Instructions

1. **Identify Redundancy**: Find sections that repeat information already documented elsewhere
2. **Assess Relevance**: Flag generic content that doesn't provide project-specific value
3. **Measure Token Efficiency**: Estimate current vs optimized token count
4. **Propose Edits**: Suggest specific sections to condense, remove, or restructure

## Output Format

Provide:
- Current token estimate (approximate line count analysis)
- List of redundant sections with specific line numbers
- Proposed optimizations with before/after examples
- Estimated token savings
- **Ask for approval** before making any changes

## Guidelines

- **DO**: Preserve critical project-specific information (architecture decisions, build procedures, conventions)
- **DO**: Keep links to official documentation
- **DO**: Maintain section structure for navigation
- **DON'T**: Remove information just because it's detailed—assess if it's project-specific
- **DON'T**: Edit without showing proposed changes first
- **DON'T**: Sacrifice clarity for brevity

## Success Criteria

After optimization, CLAUDE.md should:
- ✅ Be 30-50% shorter while preserving all essential information
- ✅ Follow "navigation hub" philosophy
- ✅ Have zero redundant sections
- ✅ Be faster to read and reference
- ✅ Still cover all 15 major project areas
