---
name: sb79-update-scan
description: Scan for new SB 79 implementation activity (Palo Alto City Council votes, staff reports, ordinances, press coverage, HCD/MTC guidance, neighboring-city decisions) since a given date. Use when a user asks to check for SB 79 updates, scan for news, verify before publishing a council-watch update, run a weekly diligence pass, or reconcile post-meeting changes for the sb79palo site.
---

# SB 79 update scan

A diligence skill for the SB 79 Palo Alto project (`/Users/chao/GitHub/sb79palo/`). It checks a known list of primary sources, press outlets, and state/regional sources for any new SB 79 activity since a given date, and reports findings in a format that maps cleanly onto site-edit decisions.

## When to use

- The user asks "anything new on SB 79?" or "check for updates" or "any new Palo Alto SB 79 news?"
- Before publishing a `council-watch.html` update — to make sure nothing has changed since the last commit
- Weekly or pre-meeting cadence (catch new agenda packets, staff memos, late-filed correspondence)
- Post-meeting reconciliation — confirm the official record now matches what was previewed
- Verifying a date or meeting time before quoting it (use the PrimeGov API, not the JS-rendered portal page)

## Core discipline (lifted from project CLAUDE.md and learnings.md)

Apply these rules to every finding before reporting:

- **Verify against primary sources.** For council decisions, check the meeting video/minutes — a preview describes what is *planned*, not what *happened*. The project has been burned by this twice; do not extend it to three.
- **Distinguish HAPPENED from PROPOSED.** A council preview, a staff report, or an agenda listing is not an outcome. Quote dates and URLs verbatim; do not paraphrase a "scheduled vote" as a "decision."
- **AI summaries are not primary sources.** YouTube Gemini summaries, news-aggregator blurbs, and search-result snippets are leads, not citations. Pull the underlying record before quoting.
- **If a URL returns 403, 429, or unintelligible JS, report "checked, inaccessible" — do not invent or speculate** about what it would have said.
- **A meeting that appears rescheduled may just be a UTC artifact.** Always cross-check the PrimeGov API (below) against any portal-page date string before flagging a reschedule.

## The PrimeGov public API (highest-leverage technique)

Palo Alto's meeting portal (PrimeGov) exposes a public JSON API that is far more reliable than scraping the JS-heavy portal pages. **Always start a scan with this.**

```
GET https://cityofpaloalto.primegov.com/api/v2/PublicPortal/ListUpcomingMeetings
```

Returns a JSON array of upcoming meetings:

```json
[
  {
    "id": 2838,
    "title": "City Council Regular Meeting",
    "date": "Jun 01, 2026",
    "time": "05:30 PM",
    "dateTime": "2026-06-01T17:30:00"
  }
]
```

The `dateTime` field is the canonical local time. The portal page UI sometimes renders this in UTC (`6/2/2026 12:30 AM`) — that's the same meeting, not a reschedule. **Trust the API field, not the rendered string.**

A one-liner check via the included helper:

```bash
bash ~/.claude/skills/sb79-update-scan/scripts/check-meetings.sh
```

Add `--city <slug>` for the neighbor cities listed in the script's city table.

## Sources to check, by tier

### Tier 1 — Palo Alto primary sources

These are authoritative. A change here usually means a real update.

| Source | URL | What it tells you |
|---|---|---|
| PrimeGov public API | `https://cityofpaloalto.primegov.com/api/v2/PublicPortal/ListUpcomingMeetings` | Upcoming meetings; reliable JSON |
| PrimeGov portal | `https://cityofpaloalto.primegov.com/` | Agenda packets, attachments, video; JS-heavy, may need direct PDF URLs |
| Current SB 79 agenda (June 1, 2026 Item 17) | `https://cityofpaloalto.primegov.com/Portal/Meeting?meetingTemplateId=18727` | The active item; check attachments + late correspondence |
| City Clerk meetings | `https://www.paloalto.gov/Departments/City-Clerk/City-Meeting-Groups/Meeting-Agendas-and-Minutes` | Official agendas + minutes (often 403s to bots — try via gh/curl with UA) |
| Council Committee Meetings | `https://www.paloalto.gov/Departments/City-Clerk/City-Council/City-Council-Committee-Meetings` | Ad Hoc Committee (Burt / Lauing on SB 79) activity |
| Weekly City Manager Updates | `https://www.paloalto.gov/News-Articles/City-Manager` (search "Weekly") | Staff status updates that may not surface elsewhere |
| Planning & Development Services | `https://www.paloalto.gov/Departments/Planning-Development-Services/Housing-Policies-Projects` | Implementation tracker |
| YouTube — City of Palo Alto | `https://www.youtube.com/c/cityofpaloalto` | Meeting recordings (use mcp__transcriber__transcribe for transcripts) |
| Midpen Media archive | `https://midpenmedia.org/category/government/city-of-palo-alto/` | Alternate meeting recording archive |

The full, current index lives in the repo at `/Users/chao/GitHub/sb79palo/PRIMARY-SOURCES.md`. **Always cross-check that file** — it's the canonical list and is updated as new sources are cited.

### Tier 2 — Local press

Leads, not citations. Use to find primary-source pointers, then verify the underlying record.

- Palo Alto Online — housing tag — `https://www.paloaltoonline.com/housing/`  *(often rate-limits WebFetch — try WebSearch as fallback)*
- Palo Alto Daily Post — `https://padailypost.com/`
- San José Spotlight — `https://sanjosespotlight.com/`
- The Almanac — `https://www.almanacnews.com/menlo-park/` (for cross-city signal)
- Mountain View Voice — `https://www.mv-voice.com/` (San Antonio band relevance)
- RWC Pulse — `https://www.rwcpulse.com/` (Redwood City)
- Silicon Valley Voice — `https://www.svvoice.com/` (Sunnyvale)

### Tier 3 — Public-comment letters and advocacy

These are *primary* records (entered into the official record) but reflect each submitter's position. Track positions across the housing-politics spectrum.

- The agenda packet's "Public Letters" / "Correspondence" attachments on PrimeGov
- Palo Alto Forward — `https://www.paloaltoforward.org/`
- Palo Altans for Sensible Zoning — search recent posts
- Neighborhood and resident-group letters (often filed late; check the packet within 48 hours of the meeting)

### Tier 4 — State and regional

- HCD SB 79 TOD page — `https://www.hcd.ca.gov/planning-and-research/sb79-tod`
- HCD MPO advisory (PDF, tier definitions) — `https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/sb-79-mpo-advisory.pdf`
- MTC SB 79 Regional Map — `https://mtc.ca.gov/planning/land-use/senate-bill-79-regional-map` *(becomes official 2026-07-01)*
- ABAG SB 79 Summary — `https://abag.ca.gov/sites/default/files/documents/2026-04/SB79-Summary-040826.pdf`
- LegInfo bill page — `https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB79`
- Codified Gov. Code §65912.161 (the off-ramp statute) — `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=65912.161`
- Any AG opinion or filed legal challenge (search "SB 79 lawsuit" / "SB 79 court")

### Tier 5 — Neighbor cities (already tracked on `neighbors.html`)

For each, the most useful primary endpoint is in parentheses. Add new ones to `scripts/check-meetings.sh`'s city table when a PrimeGov-style API is identified.

- **Menlo Park** — agendas-and-minutes (`https://www.menlopark.gov/Agendas-and-minutes`); YouTube archive at `https://www.youtube.com/@cityofmenlopark`; April 27 PC + May 12 CC minutes are **still pending** at last scan
- **Mountain View** — Legistar (`https://mountainview.legistar.com/`); MV Voice for press
- **Sunnyvale** — agendas (`https://sunnyvale.legistar.com/`); Murphy Avenue carve-out first reading scheduled 2026-06-02
- **Redwood City** — `https://www.redwoodcity.org/city-hall/agendas-minutes` (no SB 79 action on docket as of last scan)
- **San Carlos** — `https://www.cityofsancarlos.org/city_hall/city_council/agendas_and_minutes.php`
- **Los Altos** — `https://www.losaltosca.gov/agendacenter` — no city station, but San Antonio half-mile spills in

## Reporting format

For each finding, output one row:

```
Date | URL | One-line summary | Tier: (a) news-worthy | (b) page update | (c) nothing
```

End the report with a **what-to-do block** keyed to the tier:

- **(a) news-worthy** → recommend a new entry on `council-watch.html` "Meeting log" timeline (lines ~185–198) and possibly a standalone event page modeled on `may-4-decision.html`. Add to `PRIMARY-SOURCES.md`.
- **(b) page update** → identify exact file + line range that needs editing. Common destinations: `council-watch.html` (status, meeting log, stakeholder positions), `neighbors.html` (scorecard row, per-city section), `may-4-decision.html` (warning callout), `PRIMARY-SOURCES.md` (source index).
- **(c) nothing** → say so explicitly with the list of URLs checked. Receipts matter; "nothing found" without showing the checks is not useful.

## Recommendation thresholds

Treat a finding as **(a) news-worthy** if any of:

- A council formally **voted** on an SB 79 item (any city in scope)
- An ordinance was **adopted** (not just introduced) or **withdrawn**
- HCD issued **new guidance, a sample ordinance, or an FAQ update**
- A **legal challenge** was filed against SB 79 or against a city's SB 79 ordinance
- The MTC Regional Map was **revised** (the official 2026-07-01 release counts)
- A staff report or **stakeholder letter** for an active item is newly **filed** and changes the framing meaningfully

Treat a finding as **(b) page update** if it is a smaller fact-change that one of the existing pages should reflect (a date shift verified against the API, new minutes posted that confirm something we'd flagged as "pending," a new neighbor-city press article that doesn't shift the scorecard).

Treat as **(c) nothing** for: previews of upcoming items the site already covers, social-media chatter without a primary-source pointer, restated past coverage.

## Quick-start procedure

For a typical "anything new on SB 79?" prompt:

1. Run `bash ~/.claude/skills/sb79-update-scan/scripts/check-meetings.sh` — confirms next meeting date/time.
2. Fetch the current SB 79 agenda URL (`meetingTemplateId=18727` or whatever the API surfaces) and re-list the attachments. Diff against what `PRIMARY-SOURCES.md` already references.
3. WebSearch: `"Palo Alto" "SB 79"` filtered to the date window since last scan.
4. WebFetch each Tier 1 URL. If 403/429, note and move on — do not retry indefinitely.
5. Walk Tier 2/3/4/5 sources in priority order. Stop at the first 5 confirmed findings or when sources are exhausted.
6. Output the report using the format above.

## Caveats

- **paloalto.gov** pages often 403 to bot-style fetches. If you need the content, try with a browser-like User-Agent or fall back to the city's PrimeGov / YouTube / Midpen Media surfaces.
- **paloaltoonline.com** rate-limits aggressive fetches (429). Use WebSearch to find specific URLs, then fetch each individually with delays if needed.
- **The PrimeGov UTC artifact**: the portal page sometimes shows the dateTime in UTC ("6/2 12:30 AM" for a 6/1 5:30 PM Pacific meeting). The API's `dateTime` field is always local. **Trust the API.**
- **Neighbor-city Legistar URLs** vary in URL structure. The script's city table is the source of truth — extend it when a new endpoint is identified.

## See also

- `/Users/chao/GitHub/sb79palo/PRIMARY-SOURCES.md` — canonical project source index (always cross-check)
- `/Users/chao/GitHub/sb79palo/CLAUDE.md` — project discipline rules
- `/Users/chao/GitHub/sb79palo/learnings.md` — incident retrospectives (read before publishing anything contentious)
- `~/.claude/skills/sb79-tier-determination/SKILL.md` — sibling skill (tier math from GTFS)
- `mcp__transcriber__transcribe` — for transcribing council meeting videos (YouTube auto-captions or full STT)
