#!/usr/bin/env bash
# check-meetings.sh — fetch upcoming meetings from a PrimeGov public API endpoint.
#
# Default is Palo Alto. Pass --city <slug> to target a neighbor city whose
# portal also uses PrimeGov. Add new cities to the table below as their
# portals are identified.
#
# Output: pretty-printed JSON to stdout.

set -euo pipefail

CITY="palo-alto"
RAW=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --city) CITY="$2"; shift 2 ;;
    --raw)  RAW=1; shift ;;
    --list) shift; LIST=1 ;;
    -h|--help)
      cat <<EOF
Usage: check-meetings.sh [--city <slug>] [--raw]
       check-meetings.sh --list

Fetches the upcoming-meetings JSON from a city's PrimeGov public API.

Options:
  --city <slug>   City to query (default: palo-alto)
  --raw           Print the raw JSON without jq formatting
  --list          List the cities this script knows about and exit

Known cities are defined in the BASE_URL_FOR_CITY function. Extend it as
new PrimeGov endpoints are identified.
EOF
      exit 0 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

# Map city slug -> PrimeGov subdomain. Add neighbor cities here as their
# PrimeGov endpoints are confirmed.
base_url_for_city() {
  case "$1" in
    palo-alto)  echo "https://cityofpaloalto.primegov.com" ;;
    # Add as confirmed:
    # mountain-view) echo "https://..." ;;
    # menlo-park)    echo "https://..." ;;
    # sunnyvale)     echo "https://..." ;;
    *) return 1 ;;
  esac
}

if [[ "${LIST:-0}" == "1" ]]; then
  echo "Known cities:"
  echo "  palo-alto      https://cityofpaloalto.primegov.com"
  echo ""
  echo "Add new cities by editing the base_url_for_city function in this script."
  exit 0
fi

BASE="$(base_url_for_city "$CITY")" || {
  echo "Unknown city slug: $CITY" >&2
  echo "Run with --list to see known cities." >&2
  exit 1
}

URL="$BASE/api/v2/PublicPortal/ListUpcomingMeetings"

RESPONSE="$(curl -fsS -H 'Accept: application/json' "$URL")"

if [[ $RAW -eq 1 ]]; then
  echo "$RESPONSE"
else
  echo "$RESPONSE" | jq '.'
fi
