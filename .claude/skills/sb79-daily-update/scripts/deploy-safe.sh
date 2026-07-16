#!/usr/bin/env bash
# deploy-safe.sh — commit named files and push to main (Cloudflare auto-deploys).
#
# For tier-(b) SAFE facts only — never call this for an outcome claim. Rebases on
# origin/main first and retries once if the push races another commit. Never
# force-pushes; on a second failure it leaves the commit local for a human/PR.
#
# Usage: deploy-safe.sh -m "commit message" file1 [file2 ...]
set -euo pipefail
msg=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m) msg="$2"; shift 2 ;;
    --) shift; break ;;
    -*) echo "deploy-safe: unknown flag $1" >&2; exit 2 ;;
    *) break ;;
  esac
done
[[ -n "$msg" ]] || { echo "deploy-safe: -m message required" >&2; exit 2; }
[[ $# -gt 0 ]] || { echo "deploy-safe: at least one file required" >&2; exit 2; }

git add -- "$@"
if git diff --cached --quiet; then
  echo "deploy-safe: nothing staged (no changes) — skipping"
  exit 0
fi

git commit -q -m "$msg" \
  -m "Auto-deployed by sb79-daily-update (tier-b safe fact)." \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"

push() { git pull -q --rebase --autostash origin main && git push -q origin main; }

if push; then
  echo "deploy-safe: pushed $(git rev-parse --short HEAD)"
else
  echo "deploy-safe: push raced another commit; re-syncing and retrying once" >&2
  if push; then
    echo "deploy-safe: pushed on retry $(git rev-parse --short HEAD)"
  else
    echo "deploy-safe: push failed twice — commit left local; escalate to PR/manual" >&2
    exit 1
  fi
fi
