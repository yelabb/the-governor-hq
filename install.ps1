# Governor HQ Constitutional Framework — cross-platform installer (PowerShell)
# Works on Windows, macOS, and Linux (PowerShell Core 7+)
#
# Usage:
#   irm https://raw.githubusercontent.com/the-governor-hq/constitution/main/install.ps1 | iex
#   iex "& { $(irm https://raw.githubusercontent.com/the-governor-hq/constitution/main/install.ps1) } --domain bci"
#
# Options:
#   -Domain    wearables | bci | therapy | core    Default: core
#   -Dir       Target project directory             Default: current dir
#   -CloneOnly Clone repo only, skip config files

param(
    [ValidateSet("wearables","bci","therapy","core")]
    [string]$Domain = "core",
    [string]$Dir = (Get-Location).Path,
    [switch]$CloneOnly
)

$ErrorActionPreference = "Stop"

$RepoUrl    = "https://github.com/the-governor-hq/constitution.git"
$InstallDir = Join-Path $Dir ".governor-hq"

# ── helpers ───────────────────────────────────────────────────────────────────
function Write-Blue  { param($m) Write-Host $m -ForegroundColor Blue }
function Write-Green { param($m) Write-Host $m -ForegroundColor Green }
function Write-Warn  { param($m) Write-Host $m -ForegroundColor Yellow }
function Write-Err   { param($m) Write-Host $m -ForegroundColor Red }
function Write-Bold  { param($m) Write-Host $m -ForegroundColor White }

function Test-Command {
    param($Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

# ── banner ────────────────────────────────────────────────────────────────────
Write-Blue  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Bold  "   Governor HQ Constitutional Framework"
Write-Blue  "   AI Safety Constraints — language-agnostic install"
Write-Blue  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# ── require git ───────────────────────────────────────────────────────────────
if (-not (Test-Command "git")) {
    Write-Err "✗ git is required but was not found."
    Write-Host "  Install git from https://git-scm.com and re-run."
    exit 1
}

# ── clone or update ───────────────────────────────────────────────────────────
if (Test-Path (Join-Path $InstallDir ".git")) {
    Write-Warn "⟳  Updating existing clone at $InstallDir …"
    git -C $InstallDir pull --ff-only --quiet
    Write-Green "✓  Repository updated"
} else {
    Write-Blue "⬇  Cloning constitution repository …"
    git clone --depth 1 --quiet $RepoUrl $InstallDir
    Write-Green "✓  Repository cloned to $InstallDir"
}

if ($CloneOnly) {
    Write-Green "✓  Done (clone-only mode). Constraints are at: $InstallDir"
    Write-Host ""
    Write-Host "  Point your AI assistant to the relevant docs:"
    Write-Host "    $InstallDir\pages\constraints\hard-rules.mdx"
    Write-Host "    $InstallDir\pages\constraints\language-rules.mdx"
    Write-Host "    $InstallDir\packages\$Domain\pages\ (domain rules)"
    exit 0
}

# ── .cursorrules ──────────────────────────────────────────────────────────────
$CursorRules = Join-Path $Dir ".cursorrules"
$GovernorBlock = @"

# ── Governor HQ Constitutional Framework ($Domain) ──────────────────────────
# Constraints are sourced from .governor-hq\packages\$Domain\pages\
# and .governor-hq\pages\constraints\
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
# Full rules: .governor-hq\pages\constraints\hard-rules.mdx
# Language rules: .governor-hq\pages\constraints\language-rules.mdx
# Domain rules: .governor-hq\packages\$Domain\pages\
# ────────────────────────────────────────────────────────────────────────────
"@

if (Test-Path $CursorRules) {
    $existing = Get-Content $CursorRules -Raw -ErrorAction SilentlyContinue
    if ($existing -match "Governor HQ") {
        Write-Warn "⚠  .cursorrules already has Governor HQ section — skipping"
    } else {
        Add-Content $CursorRules $GovernorBlock
        Write-Green "✓  .cursorrules updated"
    }
} else {
    Set-Content $CursorRules $GovernorBlock
    Write-Green "✓  .cursorrules created"
}

# ── .vscode/settings.json ─────────────────────────────────────────────────────
$VscodeDir    = Join-Path $Dir ".vscode"
$SettingsFile = Join-Path $VscodeDir "settings.json"

if (-not (Test-Path $VscodeDir)) {
    New-Item -ItemType Directory -Path $VscodeDir | Out-Null
}

if (Test-Path $SettingsFile) {
    $content = Get-Content $SettingsFile -Raw
    if ($content -match "Governor HQ") {
        Write-Warn "⚠  .vscode\settings.json already configured — skipping"
    } else {
        Write-Warn "⚠  .vscode\settings.json exists — manually add the Copilot instruction:"
        Write-Host ""
        Write-Host '  "github.copilot.chat.codeGeneration.instructions": ['
        Write-Host "    { `"text`": `"Follow Governor HQ safety constraints at .governor-hq\packages\$Domain\pages\`" }"
        Write-Host '  ]'
        Write-Host ""
    }
} else {
    $settings = @{
        "github.copilot.chat.codeGeneration.instructions" = @(
            @{
                text = "Follow the Governor HQ Constitutional Framework at .governor-hq\packages\$Domain\pages\ for safety constraints. Hard rules at .governor-hq\pages\constraints\hard-rules.mdx. Never generate code that makes medical diagnoses, recommends supplements, names diseases, uses treatment language, or uses imperative directives."
            }
        )
    }
    $settings | ConvertTo-Json -Depth 5 | Set-Content $SettingsFile
    Write-Green "✓  .vscode\settings.json configured"
}

# ── .mcp-config.json ──────────────────────────────────────────────────────────
$McpConfig = Join-Path $Dir ".mcp-config.json"
if (Test-Path $McpConfig) {
    Write-Warn "⚠  .mcp-config.json already exists — skipping"
} elseif (Test-Command "node") {
    $NodePath  = (Get-Command node).Source
    $McpServer = Join-Path $InstallDir "packages\$Domain\dist\mcp-server.js"
    $mcp = @{
        mcpServers = @{
            "governor-hq-$Domain" = @{
                command     = $NodePath
                args        = @($McpServer)
                description = "Governor HQ safety constraints for $Domain data"
            }
        }
    }
    $mcp | ConvertTo-Json -Depth 5 | Set-Content $McpConfig
    Write-Green "✓  .mcp-config.json configured (MCP server requires Node.js)"
    Write-Warn "  Note: Run 'cd $InstallDir; npm ci; npm run build' to build MCP server binaries"
} else {
    Write-Warn "⚠  Node.js not found — skipping .mcp-config.json (MCP server requires Node)"
    Write-Warn "   You can still use .cursorrules and .vscode\settings.json"
}

# ── done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Green "✅  Governor HQ ($Domain) installation complete!"
Write-Host ""
Write-Bold "What was configured:"
Write-Host "  .governor-hq\           ← constraint rules & documentation"
Write-Host "  .cursorrules            ← Cursor AI safety context"
Write-Host "  .vscode\settings.json   ← GitHub Copilot instructions"
if (Test-Path $McpConfig) {
    Write-Host "  .mcp-config.json        ← Claude Desktop / MCP integration"
}
Write-Host ""
Write-Bold "Next steps:"
Write-Host "  1. Restart your AI coding assistant"
Write-Host "  2. Read domain docs: $InstallDir\packages\$Domain\pages\"
Write-Host "  3. Read hard rules:  $InstallDir\pages\constraints\hard-rules.mdx"
Write-Host ""
Write-Blue "  Works with Python, Go, Rust, or any language project."
Write-Blue "  The constraint files are plain Markdown — language-agnostic."
Write-Host ""
