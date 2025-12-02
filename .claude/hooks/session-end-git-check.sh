#!/bin/bash
# SessionEnd Hook: Git状态检查
#
# 触发时机：Claude Code会话结束时
# 作用：提醒开发者未提交的更改
#
# 注意：SessionEnd在退出后执行，无法交互，仅用于提醒

set -e

# 切换到项目目录
cd "$CLAUDE_PROJECT_DIR" || exit 0

# 检查是否是git仓库
if [ ! -d ".git" ]; then
  exit 0
fi

# 检查是否有未提交的更改
CHANGES=$(git status --porcelain 2>/dev/null || echo "")

if [ -n "$CHANGES" ]; then
  echo ""
  echo "════════════════════════════════════════"
  echo "⚠️  会话结束，检测到未提交的更改："
  echo "════════════════════════════════════════"
  echo ""
  git status --short
  echo ""
  echo "📋 更改统计："

  # 统计各类更改
  MODIFIED=$(echo "$CHANGES" | grep -c "^ M" || echo "0")
  ADDED=$(echo "$CHANGES" | grep -c "^A " || echo "0")
  DELETED=$(echo "$CHANGES" | grep -c "^D " || echo "0")
  UNTRACKED=$(echo "$CHANGES" | grep -c "^??" || echo "0")

  [ "$MODIFIED" -gt 0 ] && echo "   - 已修改: $MODIFIED 个文件"
  [ "$ADDED" -gt 0 ] && echo "   - 已添加: $ADDED 个文件"
  [ "$DELETED" -gt 0 ] && echo "   - 已删除: $DELETED 个文件"
  [ "$UNTRACKED" -gt 0 ] && echo "   - 未跟踪: $UNTRACKED 个文件"

  echo ""
  echo "💡 提示："
  echo "   - 提交更改: git add . && git commit -m 'your message'"
  echo "   - 查看差异: git diff"
  echo "   - 暂存更改: git stash"
  echo ""
  echo "════════════════════════════════════════"
  echo ""
else
  echo ""
  echo "✅ 工作区干净，所有更改已提交"
  echo ""
fi

exit 0
