#!/usr/bin/env bash
set -euo pipefail

# File hygiene linting script for the Identus project.
# Requires: Node.js (npx) — all linters are installed automatically.
#
# Usage:
#   ./scripts/lint.sh          # check only (CI mode)
#   ./scripts/lint.sh --fix    # auto-fix what can be fixed

FIX=false
if [[ "${1:-}" == "--fix" ]]; then
  FIX=true
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

EXIT_CODE=0

echo "=== Markdown Lint ==="
if $FIX; then
  npx --yes markdownlint-cli2 "**/*.md" --fix || EXIT_CODE=$?
  echo "(auto-fixed what was possible)"
else
  npx --yes markdownlint-cli2 "**/*.md" || EXIT_CODE=$?
fi

echo ""
echo "=== YAML Lint ==="
yaml_files=()
while IFS= read -r -d '' f; do
  yaml_files+=("$f")
done < <(find . \( -name "*.yml" -o -name "*.yaml" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.claude/*" \
  -not -path "*/.git/*" \
  -print0)
if [[ ${#yaml_files[@]} -gt 0 ]]; then
  npx --yes yamllint-ts -c .yamllint.yml "${yaml_files[@]}" || EXIT_CODE=$?
else
  echo "No YAML files found."
fi

echo ""
echo "=== EditorConfig Check ==="
npx --yes editorconfig-checker \
  -exclude '\.git|node_modules|\.claude' \
  || EXIT_CODE=$?

echo ""
echo "=== ShellCheck ==="
find . -name "*.sh" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.claude/*" \
  -print0 | xargs -0 npx --yes shellcheck --severity=warning \
  || EXIT_CODE=$?

exit $EXIT_CODE
