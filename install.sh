#!/usr/bin/env sh
# Governor HQ Constitutional Framework — cross-platform installer
# Works on macOS, Linux, and WSL (no npm required in the target project)
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/the-governor-hq/constitution/main/install.sh | sh
#   curl -fsSL https://raw.githubusercontent.com/the-governor-hq/constitution/main/install.sh | sh -s -- --domain bci
#
# Options:
#   --domain  <wearables|bci|therapy|core>   Default: core
#   --dir     <path>                          Target project dir. Default: current dir
#   --clone-only                              Clone repo, skip config file generation
#   --help

set -e

REPO_URL="https://github.com/the-governor-hq/constitution.git"
DOMAIN="core"
TARGET_DIR="$(pwd)"
CLONE_ONLY=0
INSTALL_DIR=""

# ── parse args ────────────────────────────────────────────────────────────────
while [ "$#" -gt 0 ]; do
  case "$1" in
    --domain)  DOMAIN="$2";     shift 2 ;;
    --dir)     TARGET_DIR="$2"; shift 2 ;;
    --clone-only) CLONE_ONLY=1; shift ;;
    --help)
      echo "Usage: install.sh [--domain <wearables|bci|therapy|core>] [--dir <path>] [--clone-only]"
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ── helpers ───────────────────────────────────────────────────────────────────
blue()  { printf '\033[34m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$1"; }
red()   { printf '\033[31m%s\033[0m\n' "$1"; }
bold()  { printf '\033[1m%s\033[0m\n'  "$1"; }

banner() {
  blue "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  bold "   Governor HQ Constitutional Framework"
  blue "   AI Safety Constraints — language-agnostic install"
  blue "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    red "✗ Required command not found: $1"
    echo "  Install it and re-run this script."
    exit 1
  fi
}

# ── validate domain ───────────────────────────────────────────────────────────
case "$DOMAIN" in
  wearables|bci|therapy|core) ;;
  *)
    red "✗ Unknown domain: $DOMAIN"
    echo "  Choose one of: wearables, bci, therapy, core"
    exit 1 ;;
esac

# ── main ──────────────────────────────────────────────────────────────────────
banner

require_cmd git

# Clone the repo into a hidden .governor-hq directory inside the target project
INSTALL_DIR="$TARGET_DIR/.governor-hq"

if [ -d "$INSTALL_DIR/.git" ]; then
  yellow "⟳  Updating existing clone at $INSTALL_DIR …"
  git -C "$INSTALL_DIR" pull --ff-only --quiet
  green "✓  Repository updated"
else
  blue "⬇  Cloning constitution repository …"
  git clone --depth 1 --quiet "$REPO_URL" "$INSTALL_DIR"
  green "✓  Repository cloned to $INSTALL_DIR"
fi

if [ "$CLONE_ONLY" = "1" ]; then
  green "✓  Done (clone-only mode). Constraints are at: $INSTALL_DIR"
  echo ""
  echo "  Point your AI assistant to the relevant docs:"
  echo "    $INSTALL_DIR/pages/constraints/hard-rules.mdx"
  echo "    $INSTALL_DIR/pages/constraints/language-rules.mdx"
  echo "    $INSTALL_DIR/packages/$DOMAIN/pages/ (domain rules)"
  exit 0
fi

# ── write .cursorrules ────────────────────────────────────────────────────────
CURSOR_RULES="$TARGET_DIR/.cursorrules"
if [ -f "$CURSOR_RULES" ]; then
  yellow "⚠  .cursorrules already exists — appending Governor HQ section"
  echo "" >> "$CURSOR_RULES"
else
  : > "$CURSOR_RULES"
fi

cat >> "$CURSOR_RULES" << EOF
# ── Governor HQ Constitutional Framework ($DOMAIN) ──────────────────────────
# Constraints are sourced from .governor-hq/packages/$DOMAIN/pages/
# and .governor-hq/pages/constraints/
#
# ABSOLUTE CONSTRAINTS (all domains):
# ❌ No medical diagnoses or clinical assessments
# ❌ No supplement / pharmacological advice
# ❌ No disease naming (ICD/DSM classifications)
# ❌ No treatment language (cure, treat, prevent, remedy)
# ❌ No imperative directives (must, should, need to)
#
# ✅ Intra-individual baseline comparison only
# ✅ Optional framing: "consider", "might", "when you're ready"
# ✅ Explicit non-medical disclaimer on all user-facing text
#
# Full rules: .governor-hq/pages/constraints/hard-rules.mdx
# Language rules: .governor-hq/pages/constraints/language-rules.mdx
# Domain rules: .governor-hq/packages/$DOMAIN/pages/
# ────────────────────────────────────────────────────────────────────────────
EOF
green "✓  .cursorrules configured"

# ── write .vscode/settings.json ───────────────────────────────────────────────
VSCODE_DIR="$TARGET_DIR/.vscode"
SETTINGS_FILE="$VSCODE_DIR/settings.json"

mkdir -p "$VSCODE_DIR"

if [ -f "$SETTINGS_FILE" ]; then
  # Best-effort: check if already configured
  if grep -q "Governor HQ" "$SETTINGS_FILE" 2>/dev/null; then
    yellow "⚠  .vscode/settings.json already has Governor HQ instructions — skipping"
  else
    yellow "⚠  .vscode/settings.json exists — manually add the Copilot instruction:"
    echo ""
    echo '  "github.copilot.chat.codeGeneration.instructions": ['
    echo '    { "text": "Follow Governor HQ safety constraints at .governor-hq/packages/'"$DOMAIN"'/pages/" }'
    echo '  ]'
    echo ""
  fi
else
  cat > "$SETTINGS_FILE" << EOF
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "Follow the Governor HQ Constitutional Framework at .governor-hq/packages/$DOMAIN/pages/ for safety constraints. Hard rules at .governor-hq/pages/constraints/hard-rules.mdx. Never generate code that makes medical diagnoses, recommends supplements, names diseases, uses treatment language, or uses imperative directives."
    }
  ]
}
EOF
  green "✓  .vscode/settings.json configured"
fi

# ── write .mcp-config.json ────────────────────────────────────────────────────
MCP_CONFIG="$TARGET_DIR/.mcp-config.json"
if [ ! -f "$MCP_CONFIG" ]; then
  # Only write if Node.js is available (MCP server requires Node)
  if command -v node >/dev/null 2>&1; then
    NODE_PATH="$(command -v node)"
    MCP_SERVER="$INSTALL_DIR/packages/$DOMAIN/dist/mcp-server.js"
    cat > "$MCP_CONFIG" << EOF
{
  "mcpServers": {
    "governor-hq-$DOMAIN": {
      "command": "$NODE_PATH",
      "args": ["$MCP_SERVER"],
      "description": "Governor HQ safety constraints for $DOMAIN data"
    }
  }
}
EOF
    green "✓  .mcp-config.json configured (MCP server requires Node.js)"
    yellow "  Note: Run 'cd $INSTALL_DIR && npm ci && npm run build' to build MCP server binaries"
  else
    yellow "⚠  Node.js not found — skipping .mcp-config.json (MCP server requires Node)"
    yellow "  You can still use .cursorrules and .vscode/settings.json"
  fi
else
  yellow "⚠  .mcp-config.json already exists — skipping"
fi

# ── done ──────────────────────────────────────────────────────────────────────
echo ""
green "✅  Governor HQ ($DOMAIN) installation complete!"
echo ""
bold "What was configured:"
echo "  .governor-hq/          ← constraint rules & documentation"
echo "  .cursorrules           ← Cursor AI safety context"
echo "  .vscode/settings.json  ← GitHub Copilot instructions"
[ -f "$MCP_CONFIG" ] && echo "  .mcp-config.json       ← Claude Desktop / MCP integration"
echo ""
bold "Next steps:"
echo "  1. Restart your AI coding assistant"
echo "  2. Read domain docs: $INSTALL_DIR/packages/$DOMAIN/pages/"
echo "  3. Read hard rules:  $INSTALL_DIR/pages/constraints/hard-rules.mdx"
echo ""
blue "  Works with Python, Go, Rust, or any language project."
blue "  The constraint files are plain Markdown — language-agnostic."
echo ""
