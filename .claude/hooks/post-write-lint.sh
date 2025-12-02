#!/bin/bash
# PostToolUse Hook: 自动修复lint问题
#
# 触发时机：Write或Edit工具执行后
# 作用：运行 ESLint --fix 自动修复代码风格问题
#
# 退出码：
# - 0: 成功（非阻塞）
# - 其他：错误（非阻塞，仅在debug模式显示）

set -e

# 切换到项目目录
cd "$CLAUDE_PROJECT_DIR" || exit 0

# 仅在web/remote环境执行（本地开发者有自己的编辑器lint）
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

echo ""
echo "🔍 运行 ESLint 自动修复..."

# 运行 lint:fix（捕获输出）
LINT_OUTPUT=$(npm run lint:fix --silent 2>&1 || true)

# 检查是否有实际修复
if echo "$LINT_OUTPUT" | grep -qE "(✔|✓|fixed|Fixed)"; then
  echo "✅ ESLint 自动修复完成"
  # 可选：显示修复的文件数量
  FIXED_COUNT=$(echo "$LINT_OUTPUT" | grep -oE "[0-9]+ (problem|error|warning)" | head -1 || echo "")
  if [ -n "$FIXED_COUNT" ]; then
    echo "   修复了 $FIXED_COUNT"
  fi
elif echo "$LINT_OUTPUT" | grep -qE "(error|Error|failed|Failed)"; then
  echo "⚠️  ESLint 检测到无法自动修复的问题"
  echo "$LINT_OUTPUT" | grep -E "(error|warning)" | head -5
else
  echo "✅ 代码已符合规范，无需修复"
fi

echo ""
exit 0  # 非阻塞，仅报告
