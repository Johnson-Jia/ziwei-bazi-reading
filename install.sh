#!/bin/bash
# ═══════════════════════════════════════════════════════════
# install.sh — 一键安装 紫微斗数 × 八字命理 推理技能
# ═══════════════════════════════════════════════════════════
# 使用:
#   curl 安装: curl -sL https://raw.githubusercontent.com/Johnson-Jia/ziwei-bazi-reading/main/install.sh | bash
#   clone 安装: git clone 后在仓库目录执行 ./install.sh [--global|--project|--copy-only]
#   纯复制:    ./install.sh --copy-only（跳过 npm 依赖安装）

set -e

MODE="${1:---global}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_URL="https://github.com/Johnson-Jia/ziwei-bazi-reading.git"
SKILL_NAME="ziwei-bazi-reading"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo ""
echo "═══════════════════════════════════════════"
echo " 紫微斗数 × 八字命理 — 一键安装器"
echo "═══════════════════════════════════════════"
echo ""

# ── Step 1: 确定来源目录 ──
if [ -f "$SCRIPT_DIR/SKILL.md" ]; then
  # 从 git clone 目录执行
  SRC_DIR="$SCRIPT_DIR"
  echo "📦 使用本地仓库: $SRC_DIR"
else
  # curl 管道执行，需要先 clone
  echo "📦 下载技能文件..."
  git clone --depth 1 "$REPO_URL" "$TMP_DIR" 2>/dev/null || {
    echo "❌ 克隆失败，请检查网络或手动 git clone $REPO_URL"
    exit 1
  }
  SRC_DIR="$TMP_DIR"
fi

# ── Step 2: 确定目标目录 ──
case "$MODE" in
  --project)
    TARGET_DIR=".claude/skills"
    echo "📁 安装模式: 项目级 ($TARGET_DIR/$SKILL_NAME)"
    ;;
  --copy-only)
    TARGET_DIR="$HOME/.claude/skills"
    echo "📋 安装模式: 仅复制文件，跳过依赖安装"
    ;;
  --global|*)
    TARGET_DIR="$HOME/.claude/skills"
    echo "🌍 安装模式: 全局 ($TARGET_DIR/$SKILL_NAME)"
    ;;
esac

mkdir -p "$TARGET_DIR/$SKILL_NAME"

# ── Step 3: 复制技能文件 ──
echo "📋 复制技能文件..."
cp -r "$SRC_DIR"/SKILL.md "$SRC_DIR"/methods "$SRC_DIR"/scripts "$SRC_DIR"/templates "$SRC_DIR"/data "$TARGET_DIR/$SKILL_NAME/" 2>/dev/null
# 确保不带入 node_modules（保持轻量）
rm -rf "$TARGET_DIR/$SKILL_NAME/scripts/vendor/node_modules"
echo "✅ 技能文件已复制到 $TARGET_DIR/$SKILL_NAME"

SKILL_PATH="$TARGET_DIR/$SKILL_NAME"

# ── copy-only 提前退出 ──
if [ "$MODE" = "--copy-only" ]; then
  echo ""
  echo "═══════════════════════════════════════════"
  echo " ✅ 安装完成（仅文件复制）"
  echo " 提示: 后续需手动 cd $SKILL_PATH/scripts/vendor/iztro && npm install"
  echo " 使用: 在 Claude Code 中直接对话（给生辰，说「批八字/排紫微」）"
  echo "═══════════════════════════════════════════"
  exit 0
fi

# ── Step 4: 依赖检测 ──
echo ""
echo "── 依赖检测 ──"
ERRORS=()

NODE_VER=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -n "$NODE_VER" ] && [ "$NODE_VER" -ge 16 ]; then
  echo "✅ Node.js $(node -v)"
else
  echo "❌ Node.js >= 16 未安装（排盘脚本依赖 Node）"
  ERRORS+=("Node.js: winget install OpenJS.NodeJS.LTS (Win) / brew install node (Mac)")
fi

# ── Step 5: 安装 iztro 运行时依赖 ──
if [ ${#ERRORS[@]} -eq 0 ]; then
  IZTRO_DIR="$SKILL_PATH/scripts/vendor/iztro"
  if [ -f "$IZTRO_DIR/package.json" ]; then
    echo "⏳ 安装 iztro 运行时依赖（紫微排盘）..."
    (cd "$IZTRO_DIR" && npm install --production --no-audit --no-fund --ignore-scripts 2>/dev/null) && echo "✅ iztro 依赖安装完成" || {
      echo "❌ npm install 失败"
      ERRORS+=("手动执行: cd \"$IZTRO_DIR\" && npm install")
    }
  fi
fi

# ── Step 6: 排盘验证 ──
if [ ${#ERRORS[@]} -eq 0 ]; then
  echo "🔍 排盘验证..."
  if node "$SKILL_PATH/scripts/bazi.js" 1993 10 20 19 10 男 >/dev/null 2>&1; then
    echo "✅ 八字排盘验证通过"
  else
    echo "⚠ 八字排盘异常（技能可用，建议检查 tyme4ts vendor）"
  fi
  if node "$SKILL_PATH/scripts/paipan_ziwei.js" 1993-10-20 10 男 >/dev/null 2>&1; then
    echo "✅ 紫微排盘验证通过"
  else
    echo "⚠ 紫微排盘异常（技能可用，建议检查 iztro 依赖）"
  fi
fi

# ── 结果汇总 ──
echo ""
echo "═══════════════════════════════════════════"
if [ ${#ERRORS[@]} -eq 0 ]; then
  echo " ✅ 安装完成，所有依赖就绪"
else
  echo " ⚠️ 以下需手动处理："
  for err in "${ERRORS[@]}"; do echo "   • $err"; done
  echo " 处理后重跑此脚本即可"
fi
echo ""
echo " 技能目录: $SKILL_PATH"
echo ""
echo " 使用方式:"
echo "   1. Claude Code 中直接对话（给生辰，说「批八字 / 排紫微盘」）"
echo "   2. 命令行: node \"$SKILL_PATH/scripts/gen_bazi_full_html.js\" <Y> <M> <D> <H> <MIN> <男|女>"
echo ""
echo " ⚠ 命理属传统文化，非实证科学，仅供研究/娱乐参考"
echo "═══════════════════════════════════════════"
