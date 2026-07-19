# sb79-update-scan

A diligence skill for the SB 79 Palo Alto site (`/Users/chao/GitHub/sb79palo/`).
Scans known primary sources, press outlets, and state/regional pages for any
new SB 79 implementation activity since a given date, then reports findings
in a format that maps cleanly onto site-edit decisions.

## Quick start

```bash
# Confirm the next Palo Alto Council meeting (uses the PrimeGov public API)
bash ~/.claude/skills/sb79-update-scan/scripts/check-meetings.sh

# Pretty-print to JSON file
bash ~/.claude/skills/sb79-update-scan/scripts/check-meetings.sh > /tmp/pa-meetings.json

# Raw JSON (no jq formatting)
bash ~/.claude/skills/sb79-update-scan/scripts/check-meetings.sh --raw

# List cities the script knows about
bash ~/.claude/skills/sb79-update-scan/scripts/check-meetings.sh --list
```

## What's here

| File | Purpose |
|---|---|
| `SKILL.md` | Main skill spec — when to use, discipline rules, source list, reporting format |
| `scripts/check-meetings.sh` | curl + jq wrapper around the PrimeGov public API. Defaults to Palo Alto |

## The high-value technique baked in

`https://cityofpaloalto.primegov.com/api/v2/PublicPortal/ListUpcomingMeetings`
returns clean JSON. The portal page UI sometimes renders this in UTC (a
2026-06-01 5:30 PM Pacific meeting becomes "6/2 12:30 AM" in the rendered
page), so **the API is the canonical source for "when is the next meeting"** —
not the HTML page.

The script defaults to Palo Alto. Add neighbor cities by editing the
`base_url_for_city` function in `scripts/check-meetings.sh` once a city's
PrimeGov endpoint is confirmed.

## Requirements

- `curl` (preinstalled on macOS / Linux)
- `jq` (`brew install jq`)
- No additional dependencies

## See also

- `SKILL.md` — full spec, when-to-use, sources by tier, reporting format
- `/Users/chao/GitHub/sb79palo/PRIMARY-SOURCES.md` — canonical project source index
- `/Users/chao/GitHub/sb79palo/CLAUDE.md` — project discipline rules
- `~/.claude/skills/sb79-tier-determination/` — sibling skill (tier math from GTFS)
