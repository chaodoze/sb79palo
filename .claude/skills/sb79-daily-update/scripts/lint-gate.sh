#!/usr/bin/env bash
# lint-gate.sh — block a deploy unless the site passes its checks.
#
#   1) htmlhint on all root HTML (the project's lint discipline)
#   2) glossary data-def drift: each glossary term must use ONE canonical tooltip
#      string across the whole site (CLAUDE.md rule)
#   3) local .html link targets exist
#
# Nonzero exit means: do NOT deploy. The caller should revert the edit and route
# the finding to a PR instead.
#
# Usage: lint-gate.sh [repo_dir]
set -euo pipefail
repo="${1:-$(pwd)}"
cd "$repo"
fail=0

echo "== htmlhint =="
if ! npx --yes htmlhint *.html; then fail=1; fi

echo "== data-def drift =="
# Map each glossary anchor to the tooltip string(s) used with it; flag any anchor
# that appears with more than one distinct string.
drift=$(grep -ohE 'href="glossary\.html#[a-z-]+"[^>]*data-def="[^"]*"' *.html 2>/dev/null \
  | sed -E 's/.*glossary\.html#([a-z-]+)"[^>]*data-def="([^"]*)".*/\1\t\2/' \
  | sort -u | cut -f1 | uniq -d || true)
if [[ -n "$drift" ]]; then
  echo "data-def drift: these glossary terms have >1 distinct tooltip string:" >&2
  echo "$drift" >&2
  fail=1
else
  echo "no data-def drift"
fi

echo "== local link sanity =="
missing=0
for f in *.html; do
  for tgt in $(grep -oE 'href="[a-z0-9._-]+\.html' "$f" | sed 's/href="//' | sort -u); do
    [[ -f "$tgt" ]] || { echo "  $f -> missing target: $tgt" >&2; missing=1; }
  done
done
[[ $missing -eq 1 ]] && fail=1 || echo "local links OK"

if [[ $fail -ne 0 ]]; then
  echo "lint-gate: FAIL — deploy blocked" >&2
  exit 1
fi
echo "lint-gate: PASS"
