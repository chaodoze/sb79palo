#!/usr/bin/env bash
# open-pr.sh — stage a proposed (tier-a) change on a branch and open a PR.
#
# For OUTCOME findings that an unattended run cannot verify (a vote, an adoption,
# a lawsuit — anything needing the meeting video/minutes). The agent makes its
# proposal edits in the working tree, then calls this to branch + push + open a PR
# whose body tells a human exactly what to verify before merging. Nothing deploys.
#
# Usage: open-pr.sh --slug <slug> --title <title> --body-file <path> file1 [file2 ...]
set -euo pipefail
slug=""; title=""; bodyfile=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug) slug="$2"; shift 2 ;;
    --title) title="$2"; shift 2 ;;
    --body-file) bodyfile="$2"; shift 2 ;;
    --) shift; break ;;
    -*) echo "open-pr: unknown flag $1" >&2; exit 2 ;;
    *) break ;;
  esac
done
[[ -n "$slug" && -n "$title" && -n "$bodyfile" ]] || { echo "open-pr: --slug/--title/--body-file required" >&2; exit 2; }
[[ -f "$bodyfile" ]] || { echo "open-pr: body file not found: $bodyfile" >&2; exit 2; }
[[ $# -gt 0 ]] || { echo "open-pr: at least one changed file required" >&2; exit 2; }

branch="auto/sb79-$(date +%Y%m%d)-${slug}"

git switch -c "$branch"
git add -- "$@"
git commit -q -m "Proposed: ${title}" \
  -m "Drafted by sb79-daily-update (tier-a outcome — human must verify against the primary record before merge)." \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push -q -u origin "$branch"

# Try with the tracking label; fall back if the label doesn't exist in the repo.
gh pr create --base main --head "$branch" --title "[auto] ${title}" --body-file "$bodyfile" --label "needs-verification" 2>/dev/null \
  || gh pr create --base main --head "$branch" --title "[auto] ${title}" --body-file "$bodyfile"

git switch -q main
url=$(gh pr view "$branch" --json url -q .url 2>/dev/null || true)
echo "open-pr: opened PR from ${branch} ${url}"
