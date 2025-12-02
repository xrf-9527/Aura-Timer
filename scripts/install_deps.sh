#!/bin/bash
# SessionStart Hook: 智能依赖安装脚本
#
# 功能特性：
# - 仅在 Claude Code web/remote 环境执行
# - 检测依赖是否已存在，避免重复安装
# - 优先使用 npm ci（更快更可靠）
# - 失败时自动回退到 npm install
# - 持久化环境变量到会话

set -e  # 遇到错误时退出

# ============================================
# 1. 环境检查：仅在 web/remote 环境执行
# ============================================
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  echo "📍 检测到本地环境，跳过自动依赖安装"
  echo "   提示：本地开发时请手动运行 'npm install'"
  exit 0
fi

echo "🌐 检测到 Claude Code web 环境"

# ============================================
# 2. 切换到项目目录
# ============================================
cd "$CLAUDE_PROJECT_DIR" || {
  echo "❌ 错误：无法切换到项目目录"
  exit 1
}

echo "📂 工作目录：$CLAUDE_PROJECT_DIR"

# ============================================
# 3. 检查关键依赖是否已存在
# ============================================
if [ -d "node_modules/react" ] && [ -d "node_modules/vite" ] && [ -d "node_modules/typescript" ]; then
  echo "✅ 依赖已就绪，跳过安装"
  echo "   - React: $(node -e "console.log(require('./node_modules/react/package.json').version)" 2>/dev/null || echo '已安装')"
  echo "   - Vite: $(node -e "console.log(require('./node_modules/vite/package.json').version)" 2>/dev/null || echo '已安装')"
  echo "   - TypeScript: $(node -e "console.log(require('./node_modules/typescript/package.json').version)" 2>/dev/null || echo '已安装')"
  exit 0
fi

echo "🔍 检测到依赖缺失，开始安装..."

# ============================================
# 4. 智能安装：npm ci 优先，失败时回退
# ============================================
INSTALL_START=$(date +%s)

# 尝试 npm ci（更快更可靠）
if npm ci --prefer-offline --no-audit --no-fund 2>/dev/null; then
  INSTALL_END=$(date +%s)
  DURATION=$((INSTALL_END - INSTALL_START))
  echo "✅ 依赖安装成功（npm ci）"
  echo "   耗时：${DURATION}s"
else
  echo "⚠️  npm ci 失败，回退到 npm install..."

  # 回退到 npm install
  if npm install --no-audit --no-fund; then
    INSTALL_END=$(date +%s)
    DURATION=$((INSTALL_END - INSTALL_START))
    echo "✅ 依赖安装成功（npm install）"
    echo "   耗时：${DURATION}s"
  else
    echo "❌ 依赖安装失败"
    echo "   请检查网络连接或 package.json 配置"
    exit 1
  fi
fi

# ============================================
# 5. 持久化环境变量到会话
# ============================================
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo "🔧 配置环境变量..."
  echo 'export NODE_ENV=development' >> "$CLAUDE_ENV_FILE"
  echo 'export npm_config_loglevel=error' >> "$CLAUDE_ENV_FILE"
  echo "   - NODE_ENV=development"
  echo "   - npm_config_loglevel=error"
fi

# ============================================
# 6. 验证关键依赖
# ============================================
echo "🔍 验证依赖完整性..."

MISSING_DEPS=0

# 检查生产依赖
for pkg in react react-dom @google/genai motion; do
  if [ ! -d "node_modules/$(echo $pkg | tr '/' '/')" ]; then
    echo "   ❌ 缺少：$pkg"
    MISSING_DEPS=$((MISSING_DEPS + 1))
  fi
done

# 检查开发依赖
for pkg in vite typescript @vitejs/plugin-react eslint babel-plugin-react-compiler; do
  if [ ! -d "node_modules/$(echo $pkg | tr '/' '/')" ]; then
    echo "   ❌ 缺少：$pkg"
    MISSING_DEPS=$((MISSING_DEPS + 1))
  fi
done

if [ $MISSING_DEPS -gt 0 ]; then
  echo "⚠️  警告：检测到 $MISSING_DEPS 个缺失依赖"
  echo "   建议手动运行 'npm install' 进行修复"
else
  echo "✅ 所有关键依赖已就绪"
fi

# ============================================
# 7. 输出项目信息
# ============================================
echo ""
echo "📦 项目环境就绪："
echo "   - Node.js: $(node --version 2>/dev/null || echo '未检测到')"
echo "   - npm: $(npm --version 2>/dev/null || echo '未检测到')"
echo "   - 依赖数量: $(ls node_modules | wc -l 2>/dev/null || echo '0')"
echo ""
echo "🚀 现在可以开始开发了！"
echo "   - 运行开发服务器: npm run dev"
echo "   - 构建项目: npm run build"
echo "   - 部署: npm run deploy"

exit 0
