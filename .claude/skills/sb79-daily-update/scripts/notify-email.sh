#!/usr/bin/env bash
# notify-email.sh — send a notification email for SUBSTANTIAL auto-deploys.
#
# Called only when the daily agent auto-deploys a tier-(b) change it judges
# substantial (a new meeting-log entry, a status flip, a framing-changing source).
# Minor edits (stamp bumps, single link adds) do NOT call this.
#
# Provider-agnostic and non-fatal: a missing transport logs a warning and exits 0
# so it never breaks a run (the agent then falls back to a push notification).
#
# Usage: notify-email.sh "subject" "body text"
# Config via env:
#   SB79_NOTIFY_TO       recipient           (default: chaolam@gmail.com)
#   SB79_EMAIL_FROM      sender              (default: sb79-daily-update@users.noreply.github.com)
#   SB79_EMAIL_API_URL   transactional POST endpoint (Resend/Postmark/SendGrid-style JSON)
#   SB79_EMAIL_API_KEY   bearer token for the endpoint
# Fallbacks if the API vars are unset: msmtp, then mail.
set -euo pipefail
subject="${1:?notify-email: subject required}"
body="${2:-}"
to="${SB79_NOTIFY_TO:-chaolam@gmail.com}"
from="${SB79_EMAIL_FROM:-sb79-daily-update@users.noreply.github.com}"

if [[ -n "${SB79_EMAIL_API_URL:-}" && -n "${SB79_EMAIL_API_KEY:-}" ]]; then
  payload=$(jq -n --arg from "$from" --arg to "$to" --arg subject "$subject" --arg text "$body" \
    '{from:$from, to:[$to], subject:$subject, text:$text}')
  if curl -fsS -X POST "$SB79_EMAIL_API_URL" \
       -H "Authorization: Bearer $SB79_EMAIL_API_KEY" \
       -H "Content-Type: application/json" \
       -d "$payload" >/dev/null; then
    echo "notify-email: sent via API to $to"
    exit 0
  fi
  echo "notify-email: API send failed, trying local transports" >&2
fi

if command -v msmtp >/dev/null 2>&1; then
  if printf 'To: %s\nFrom: %s\nSubject: %s\n\n%s\n' "$to" "$from" "$subject" "$body" | msmtp "$to"; then
    echo "notify-email: sent via msmtp to $to"; exit 0
  fi
  echo "notify-email: msmtp failed" >&2
fi

if command -v mail >/dev/null 2>&1; then
  if printf '%s\n' "$body" | mail -s "$subject" "$to"; then
    echo "notify-email: sent via mail to $to"; exit 0
  fi
  echo "notify-email: mail failed" >&2
fi

echo "notify-email: no transport configured — logging only (set SB79_EMAIL_API_URL/KEY or install msmtp/mail)" >&2
echo "notify-email: [$subject] $body"
exit 0
