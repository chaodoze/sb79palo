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
Confirmed PrimeGov cities: **Palo Alto, San Carlos, Atherton, Redwood City** (the last is a
new instance with no 2026 archive yet). Mountain View and Sunnyvale are Legistar; no
PrimeGov subdomain resolves for Menlo Park or Los Altos.

### Reading PrimeGov agenda *text* (not just the calendar)

`Portal/viewer?id=<docId>` is an **Accusoft JS shell** — it returns ~225 KB of markup and
zero content, which is why several cities looked "silent" when they were not (2026-07-29:
San Carlos had adopted an SB 79 exclusion ordinance in April). Three routes that *do* work
headlessly:

```
# 1. The calendar (ids, dateTime, videoUrl, per-document ids and templateIds)
GET /api/v2/PublicPortal/ListArchivedMeetings?year=2026
GET /api/v2/PublicPortal/ListUpcomingMeetings

# 2. Full agenda ITEM TEXT — use the templateId of the document whose
#    compileOutputType == 3 (the "HTML Agenda"/"HTML Packet" entry)
GET /Portal/Meeting?meetingTemplateId=<templateId>

# 3. Attachment PDFs (staff reports, ordinance text) — hrefs are in the page from (2)
GET /api/compilemeetingattachmenthistory/historyattachment/?historyId=<guid>

# 4. COMPILED documents (Minutes, Agenda, Packet — compileOutputType == 1)
#    Use the document's `id` from the calendar's documentList. MUST use curl -L.
GET /Public/CompiledDocument/<document id>
```

Two bonuses in the route-2 HTML: each item carries `data-videolocation="<seconds>"`, the
offset into that meeting's `videoUrl` — hand it to a human as `…&t=<seconds>` so they can
verify a vote directly. And the page header renders the meeting time in **UTC** (a 7 PM
meeting shows as next-day 2:00 AM); trust the API's `dateTime`, per the caveat below.

**Corrected 2026-08-06 — compiled documents ARE retrievable, via route 4.** This file
previously recorded a "known limit" that Minutes/Agenda/Packet could not be fetched and
that "a city whose minutes are compiled documents (Atherton) still needs a human." That was
wrong, and it blocked Atherton's minutes for five weeks. The correct route is
`/Public/CompiledDocument/<document id>` — the same endpoint already documented for Palo
Alto in `learnings.md` (2026-07-18), which nobody generalized to the other PrimeGov
instances. Confirmed live on 2026-08-06 against three documents on two instances:
`atherton.primegov.com` doc **7244** (3/18/2026 approved Minutes, 310,853 B, 4 pp.) and doc
**7311** (4/15/2026 Minutes, 340,093 B), plus `cityofsancarlos.primegov.com` doc **17632**
(8/10/2026 special-meeting Agenda, 466,179 B, 2 pp.). Note the id is the document's `id`
from the calendar's `documentList`, **not** its `templateId`, and `-L` is required (without
it you get a ~494-byte redirect stub that `file` reports as HTML).

The genuine limit is narrower: `Portal/viewer?id=<docId>` (the Accusoft shell) is useless,
and `historyattachment` serves attachments only. Neither of those implies the compiled
document itself is unreachable. Sweep the agendas anyway — an agenda item title tells you an
ordinance *exists* — but now pull the Minutes too, and check the templateName is `Minutes`
and whether a later meeting approved them before treating them as the approved record.

A fourth, out-of-band confirmation for "was this ordinance actually adopted?": check the
**codified** municipal code (Code Publishing / Municode). Codifiers only publish enacted
ordinances and stamp each section with its ordinance number — e.g. San Carlos SCMC
Ch. 18.25A carries "(Ord. 1634 § 4 (Exh. A), 2026)". Strong evidence, but it is still not
the meeting record: it shows the ordinance was enacted, not how the vote went.

### HCD §65912.160 review letters: check the *city's* site, not just HCD's register

HCD's own per-jurisdiction register ("HCD Technical Assistance and SB 79 Ordinance Review
Letters," `https://www.hcd.ca.gov/hau/enforcement-letters`) is a **Power BI Gov embed** and is
genuinely not headless-reachable — that much has been re-confirmed repeatedly. **But that is a
fact about one surface, not about the document.** Cities routinely post their own copy of the
letter they received. Confirmed 2026-08-07: Atherton's HCD substantial-compliance letter
(2026-06-10, §65912.160(d)(3), signed by the Housing Accountability Unit Chief) is a plain PDF
at `https://www.athertonca.gov/DocumentCenter/View/12731`, linked from the Town's
Multi-Family Housing page under the label "SB 79 - Zoning Ordinance Approved" — a page this
project had already fetched four times while recording the letter as "needs a human with a
real browser."

**So: enumerate the link list of the city page you just fetched.** Grepping a page for "SB 79"
and reading its last-updated stamp is not the same as listing its `href`s; a document whose
label never says "HCD" will not match a topic grep. This is the same false-negative shape as
the compiled-document one recorded above (2026-08-06) — an access limit verified on one
surface, then generalized into a property of the record itself. **Before writing down that a
state-agency document is unreachable, check whether the subject jurisdiction publishes it.**
These letters are worth the trouble: they carry the statutory finding, its exact date, *which
documents the city actually submitted*, and HCD's own caveats.

### paloalto.gov: start from `sitemap.xml`, not from a listing page

**Confirmed 2026-08-13.** `https://www.paloalto.gov/sitemap.xml` returns **1.1 MB, HTTP 200**, and
enumerates **4,369 URLs — every one carrying a `<lastmod>` timestamp**. This is the cheapest
change-detector the project has: one request answers "what on the city's site changed since
`last_run`?" as a sort, across every department page, project page and news article.

```bash
curl -sL https://www.paloalto.gov/sitemap.xml -o /tmp/pa_sitemap.xml
# everything touched since the watermark:
python3 - <<'PY'
import re
s=open('/tmp/pa_sitemap.xml',encoding='utf-8',errors='replace').read()
for e in re.findall(r'<url>(.*?)</url>', s, flags=re.S):
    loc=re.search(r'<loc>(.*?)</loc>',e,re.S); lm=re.search(r'<lastmod>(.*?)</lastmod>',e,re.S)
    if loc and lm and lm.group(1) >= '2026-08-12': print(lm.group(1), loc.group(1))
PY
```

**Why this matters more than convenience: the City Manager news index is a JS shell.**
`paloalto.gov/News-Articles/City-Manager` answers **200 with 270 KB** and contains **zero article
links** — all 543 of its anchors are nav chrome and language switchers. Grepping it for "SB 79"
therefore *always* returns nothing, on a large, healthy-looking 200. The sitemap lists **723** City
Manager articles by URL and settles the question directly. Article *bodies* are static and fetch
fine (the 2026-08-04 SB 79 status article greps 236 hits) — **it is only the index that is blind.**

Same trap shape as the compiled-document (8/06), HCD-letter (8/07) and agenda-sweep (8/10) entries:
a check correctly performed on one surface standing in for the question. **If a listing page yields
zero items of the kind it exists to list, the parse failed — regardless of status code.**

### Read an agenda's attachments, not just its text

The documentList diff tells you a meeting's document set changed. It does **not** tell you what is in
it, and **an agenda's SB 79 content is almost never in the agenda text** — agendas carry item
*titles*; the substance is in the linked `historyattachment` PDFs.

Confirmed 2026-08-13 on Palo Alto PTC **8/12** (meeting 3079). The agenda text greps **zero** "SB 79".
Its attachments carry: a staff report whose "Senate Bill (SB) 79" section describes an SB 330
preliminary application for a 69-unit alternative under **§65912.155**, and a **73-page** public-comment
packet with **26** "SB 79" occurrences. Extract and grep them:

```bash
# 1. pair each attachment with its label
python3 -c "
import re,html; s=open('agenda.html',encoding='utf-8',errors='replace').read()
for m in re.finditer(r'<a[^>]*historyId=([a-f0-9-]{36})[^>]*>(.*?)</a>', s, flags=re.S|re.I):
    print(m.group(1), '|', html.unescape(re.sub(r'<[^>]+>','',m.group(2))).strip())"
# 2. fetch each and grep the extracted text (pypdf is available; pdftotext is NOT)
curl -sL "https://cityofpaloalto.primegov.com/api/compilemeetingattachmenthistory/historyattachment/?historyId=<guid>" -o att.pdf
```

**Agendas are re-compiled mid-meeting.** Meeting 3079's HTML Agenda moved from doc **21237** to
**21239** at `publishDate` **2026-08-12T20:01:17** — during the meeting — as late correspondence
landed. A sweep that reads an agenda the morning of a meeting has not read that meeting's
correspondence. **Re-check the documentList the day after.**

### Verifying a long meeting: the transcriber will not do it

Budget for this before promising a verification. On a **3 h 34 m** video the transcriber timed out in
both `auto` (full) and `quick` (60–150 min window) modes — the third failure of this shape, and
consistent with the 2026-08-11 finding that **start/end minutes trim the transcript, not the fetch**.
Two fallbacks that also failed on 2026-08-13: YouTube **caption tracks** are absent from the watch
HTML and the InnerTube player endpoint returns **400**; **Midpen Media's** PTC archive is stale (latest
entry April 29, 2026). For meetings over ~3 hours, **plan on the minutes** — they post onto the same
meeting id the documentList diff already tracks — and route the outcome to a PR meanwhile.

### Backfill: a watermark scan cannot find what predates the watermark

Every run scans **since `last_run`**, which is correct for new activity and structurally blind to
anything older. If the site asserts a **bounded set** — "nine projects filed in the July 1–15
window," "seven affected parcels in Atherton," "five cities with ordinances" — the daily sweep will
report "nothing new" about that set indefinitely, whether it is complete or not.

Confirmed 2026-08-08: the **first** of Palo Alto's nine window filings (2455 El Camino Real /
Coronet Motel, Bayhill Ventures, reported 2026-07-06 by two outlets independently) was missing
from `PRIMARY-SOURCES.md` for 33 days, while the index carried detailed rows for the sixth,
seventh and last two. The press index had been built *forward* from the day scanning started;
nothing ever swept backward to the start of the window it was indexing.

Two cheap checks:

- **Enumerate a closed window once, deliberately**, from its start date — not from the day this
  project began scanning. One backward pass per bounded set.
- **Read ordinals in indexed headlines as a completeness checksum.** A row titled "the sixth to
  lean on new state law" asserts that five others exist. An index holding an *n*th and no *1st* is
  provably incomplete, and the check is a property of the file — no fetch, no network, no window.
  `grep -oiE "\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|[0-9]+(st|nd|rd|th))\b"`
  over the press table, then account for each ordinal.

**Closed 2026-08-09 — and the backfill needed no searching.** All nine Palo Alto window filings are
now enumerated in `PRIMARY-SOURCES.md`. Filings #2–#5 were not out on the web; they were inside
**three articles the index had already cited**, two of which had sat in the press table for a month
as **title-only rows** (date, outlet, headline, link — no extracted content). Hence:

- **Read the index's own thin rows before searching outward.** An indexed URL is not a read source.
  A row whose description field is just a headline is a promissory note, and it is indistinguishable
  at a glance from a fully-mined row because the table shape is uniform. Cheapest first move on any
  "what am I missing" question: `awk -F'|' 'NF>3 && length($4)<120'` over the press table.
- **Check a bounded set on a second, independent dimension.** The nine summed to **341 units**
  (matching Lait's reported figure and refuting a stray 384) *and* partitioned **4 California Ave /
  5 downtown / 0 San Antonio** (matching a separately-reported split). Two orthogonal partitions
  agreeing is much stronger evidence than one, and the second dimension was already in the rows.
- Still not verification: press arithmetic **corroborates** a city figure, it does not confirm the
  filings. The site-facing count stays on PR #4 until the application record is read.

### Diff the `documentList`, not the meeting id

A meeting id goes into the watermark the first time the meeting is seen — which is when its
**agenda** posts. But the **minutes** post weeks later, onto that same id, and the minutes are
the record. Dedup on the id alone and the scan is permanently blind to the one artifact the
tier gate is built around.

Confirmed 2026-08-10, twice in one run. Palo Alto **PTC July 8** (meeting 3075, seen since early
July) gained **draft summary minutes** (doc 21152) recording staff's own count of the June 15
outcome — "approval of **3** SB 79 ordinances" — and a **6–0** motion naming "the layering of
various State laws, including the State Density Bonus Law and SB 79." Atherton **PC July 22**
(meeting 539, swept as an agenda on 7/29) carries in its **packet** (doc 7507) the **June 24 draft
minutes**, where the Town Planner announces the **110 Glenwood** SB 79 application — the Town's own
record, **five weeks before** the first press account this index had been relying on.

- Both PrimeGov calendar endpoints already return, per meeting, each document's `id`,
  `templateName` and `compileOutputType`. **Store that set per meeting and re-check it.** A meeting
  is "unchanged" only when its *document set* is unchanged. Costs nothing — the call is already made.
- **Diff it in BOTH directions — a removal is the more urgent signal.** ⚠️ Added 2026-08-14 after a
  one-directional diff shipped a dead link to production. When Council approves minutes, PrimeGov
  **replaces** the draft with the approved document under the same template and **unpublishes the
  draft**. Meeting **2840** went from `[20949, 20951, 20955, 20981, 21023]` to
  `[20949, 20951, 20955, 21023, 21272]`: doc **21272** (approved Action Minutes) arrived and doc
  **20981** (the draft the site had cited since 7/18, in `PRIMARY-SOURCES.md` ×2 and on the deployed
  `june-15-decision.html` ×2) **vanished**. An addition means new material to read; a removal means
  an existing citation just died. Compute both:
  ```python
  added   = [d for d in now if d not in prev]
  removed = [d for d in prev if d not in now]   # <-- this is the one that breaks the live site
  ```
  Then `grep -rn "CompiledDocument/<removed id>" *.html *.md` before doing anything else.
- **But only `compileOutputType == 1` removals are link rot.** Enabling the two-way diff on
  2026-08-14 immediately flagged three removals, and **two were false alarms**: meeting **3079** lost
  doc **21237** and meeting **2839** lost doc **20943**. `21237` was an **HTML Agenda**
  (`compileOutputType == 3`) superseded by `21239` in the mid-meeting recompile already recorded on
  8/13 — type-3 documents are addressed by `templateId` via `/Portal/Meeting?meetingTemplateId=…`,
  their ids churn routinely, and `/Public/CompiledDocument/<id>` **never** served them (it returns
  the same 1,101-byte error page for a perfectly live HTML agenda, including the current one). Only
  `20943` — June 8's *draft* Action Minutes, type 1, replaced by approved doc `21271` — was genuine
  rot, and nothing cited it. **So: filter removals to `compileOutputType == 1` before alarming, and
  don't read a 1.1 KB error page on a type-3 id as evidence of anything.**
- **The dead URL returns HTTP 200.** `…/Public/CompiledDocument/20981` redirects to
  `/Public/PublishedDocumentError` and serves a ~1.1 KB "Document Not Found" **HTML** page with a
  200 status. A status-code check passes; so does `lint-gate.sh`, whose link pass validates only
  *local* `.html` targets and never fetches an external URL. Check `content_type` and size:
  `curl -sL -o /dev/null -w "%{http_code} %{content_type} %{size_download}\n" <url>` — a compiled
  minutes PDF is hundreds of KB of `application/pdf`, not 1 KB of `text/html`.
- **Treat draft→approved as a link-rot event, not just a status change.** The status flip and the
  citation repair are one task; doing only the first leaves a dead link behind a sentence that now
  reads more confident than before.
- **Read a packet for the previous meeting's minutes**, not only for its own agenda items. A packet
  is a compilation, and the approval item near its front carries the last meeting's record. Atherton
  filed June 24's minutes under July 22.
- **An agenda sweep returning zero is a fact about agenda item titles.** It is not an absence of
  record, and it must not be written down as one. Same false-negative shape as 2026-08-06 and
  2026-08-07: a check correctly performed on one surface standing in for the question.

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
- **Sunnyvale** — agendas (`https://sunnyvaleca.legistar.com/`); Murphy Avenue carve-out first reading scheduled 2026-06-02.
  ⚠️ The client is **`sunnyvaleca`**, not `sunnyvale` — `https://sunnyvale.legistar.com/Calendar.aspx`
  answers **HTTP 200 with a 19-byte body, "Invalid parameters!"** (re-confirmed 2026-08-04), which reads
  like an empty calendar rather than a bad hostname. Same trap as the web API's
  "LegistarConnectionString … is not set up" (see `scripts/check-meetings.sh`'s client table)
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

- **paloalto.gov — send an honest CLI user-agent, NOT a browser one.** ⚠️ Corrected 2026-08-12; this
  entry previously advised the opposite and that advice was the bug. The domain is behind Akamai, which
  **allows** `curl/8.x` and `Wget/1.21.4` (HTTP **200**) and **blocks** every browser-shaped UA — Chrome,
  Safari, Firefox, bare `Mozilla/5.0`, Googlebot — *and* a suppressed UA, with **403**. Verified across
  four paths, `/robots.txt` included, stable over repeats. It blocks browser *impersonation*, not
  automation. So: plain `curl -sL "<url>"` with no `-A` flag. `WebFetch` 403s and cannot be fixed.
  Cost of the old advice: the city's own 2026-08-04 SB 79 status statement — a Tier 1 source — was
  logged as unreachable for eight days. **Any past "paloalto.gov: checked, inaccessible" note deserves
  one plain-curl retry.** Exception: the **Accela** permit portal fails for an unrelated reason
  (session/postback state) and is not affected. PrimeGov / YouTube / Midpen remain good fallbacks.
- **paloaltoonline.com** rate-limits aggressive fetches (429). Use WebSearch to find specific URLs, then fetch each individually with delays if needed.
- **The PrimeGov UTC artifact**: the portal page sometimes shows the dateTime in UTC ("6/2 12:30 AM" for a 6/1 5:30 PM Pacific meeting). The API's `dateTime` field is always local. **Trust the API.**
- **Neighbor-city Legistar URLs** vary in URL structure. The script's city table is the source of truth — extend it when a new endpoint is identified.

## See also

- `/Users/chao/GitHub/sb79palo/PRIMARY-SOURCES.md` — canonical project source index (always cross-check)
- `/Users/chao/GitHub/sb79palo/CLAUDE.md` — project discipline rules
- `/Users/chao/GitHub/sb79palo/learnings.md` — incident retrospectives (read before publishing anything contentious)
- `~/.claude/skills/sb79-tier-determination/SKILL.md` — sibling skill (tier math from GTFS)
- `mcp__transcriber__transcribe` — for transcribing council meeting videos (YouTube auto-captions or full STT)
