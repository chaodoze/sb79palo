#!/usr/bin/env bash
# preflight.sh — sync the repo to origin/main before a daily run.
#
# Guarantees a clean tree on main, fast-forwarded to origin, so the daily agent
# never clobbers in-progress human edits and never diverges (the parallel-commit
# lesson from this project's history). Exits nonzero if the tree is unexpectedly
# dirty — a human may be mid-edit — so the run aborts instead of committing over it.
#
# Usage: preflight.sh [repo_dir]
set -euo pipefail
repo="${1:-$(pwd)}"
cd "$repo"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "preflight: working tree not clean — aborting so we don't clobber in-progress edits:" >&2
  git status --short >&2
  exit 1
fi

git fetch --quiet origin
git switch --quiet main 2>/dev/null || git checkout --quiet main

ahead=$(git rev-list --count origin/main..HEAD)
behind=$(git rev-list --count HEAD..origin/main)
echo "preflight: local main is ${ahead} ahead / ${behind} behind origin/main"

# Rebase keeps history linear if a local commit somehow exists; --autostash is a
# belt-and-suspenders no-op given the clean-tree check above.
git pull --quiet --rebase --autostash origin main
echo "preflight: synced to $(git rev-parse --short origin/main) on main"
