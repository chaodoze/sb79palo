# Primary sources — SB 79 Palo Alto

Running list of authoritative source material for the SB 79 / Palo Alto coverage on this site. Always check or quote these directly rather than relying on summaries (including AI summaries — see the May 4 incident below).

**Format:** primary sources first (city, statute, official records), then secondary (press), then tooling/data we built. Keep this list short, well-organized, and current.

---

## City of Palo Alto — official records

- City Clerk — Meeting Agendas and Minutes
  https://www.paloalto.gov/Departments/City-Clerk/City-Meeting-Groups/Meeting-Agendas-and-Minutes
- PrimeGov portal (full meeting packets, attachments, video archive)
  https://cityofpaloalto.primegov.com/
- City of Palo Alto YouTube channel (livestream archive)
  https://www.youtube.com/c/cityofpaloalto
- Midpen Media — City of Palo Alto archive (meeting recordings)
  https://midpenmedia.org/category/government/city-of-palo-alto/
- Planning & Development Services — Housing Policies & Projects
  https://www.paloalto.gov/Departments/Planning-Development-Services/Housing-Policies-Projects
- City of Palo Alto Council legislation library
  https://www.paloalto.gov/Departments/City-Clerk/City-Council
- Council Committee Meetings page
  https://www.paloalto.gov/Departments/City-Clerk/City-Council/City-Council-Committee-Meetings
- Weekly City Manager Updates (status digest)
  https://www.paloalto.gov/News-Articles/City-Manager (search "Weekly City Manager Updates")

### Specific council records we've cited

| Date | Item | Status | Link |
|---|---|---|---|
| 2026-05-04 | Council meeting where SB 79 was on agenda but **deferred due to late hour** | Video posted; transcript pulled; minutes pending | [YouTube](https://www.youtube.com/watch?v=vM0GY2Rdnow) (deferral exchange 4:58:43–5:00:24) |
| 2026-05-18 | Possible SB 79 reschedule (per City Manager's on-the-record statement May 4) | Agenda not yet posted as of 2026-05-07 | [city clerk page](https://www.paloalto.gov/Departments/City-Clerk/City-Meeting-Groups/Meeting-Agendas-and-Minutes) |

#### May 4, 2026 deferral — verbatim from YouTube auto-transcript

(Auto-generated; minor wording artifacts possible. Underlying recording is authoritative.)

- **4:58:43 — Mayor:** "So colleagues it is 10:15… because some of our early items took a little longer than expected… I would suggest we think about deferring the last item on SB 79."
- **4:59:15 — City Manager:** "Clearly this is a time-sensitive item, SB 79. So as such I think we'll look to bumping one of your other scheduled items in an upcoming agenda so that we can bring it back. There is a possibility for it to come back on the 18th of May, which would require us to defer an item that was already scheduled, but at this point that's our current thinking."
- **4:59:42 — Mayor:** "We can't let it go very long but it is quite late… I would apologize to [public commenters] that we are going to defer this but I think that'll allow greater participation."
- **5:00:15 — Mayor:** "Seeing no objections to deferring this item from my colleagues, I think we will do that, and we will stand adjourned this evening."

#### How we pulled the transcript (in case YouTube changes their UI)

YouTube's auto-generated captions for this video are accessible via the "Show transcript" button in the description. The transcript panel uses `transcript-segment-view-model` custom elements (not the older `ytd-transcript-segment-renderer`). Each segment's `innerText` starts with a `H:MM:SS` timestamp. The `mcp__transcriber__transcribe` tool will normally pull these directly, but on this run yt-dlp hit YouTube's "Sign in to confirm you're not a bot" gate — likely network-dependent (we were on shared conference WiFi). The fallback that worked: use Chrome MCP to open the video, click "Show transcript," and read the DOM via `mcp__claude-in-chrome__javascript_tool`. Repo memory `reference_primary_sources_tracker.md` has the JS snippet.

---

## State of California — statute and HCD

- SB 79 bill text (LegInfo, navigable view)
  https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB79
- SB 79 full text (LegInfo, single-page)
  https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB79
- Government Code §§65912.155–65912.162 (the operative SB 79 sections)
- HCD — SB 79 TOD page
  https://www.hcd.ca.gov/planning-and-research/sb79-tod
- HCD MPO advisory (PDF, March 20, 2026) — tier definitions, train-count thresholds
  https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/sb-79-mpo-advisory.pdf

### Key statute citations we've used

| Citation | What it says |
|---|---|
| §65912.157 | The operative core of SB 79 — height/density floors, ministerial path. The provision that gets deferred or replaced. |
| §65912.161(a)(1) | Alternative plan must "maintain at least the same total net zoned capacity." |
| §65912.161(a)(2)(C) | Local-register historic exemptions cannot exceed **10%** of the eligible area in any TOD zone. |
| §65912.161(a)(3) | Plan shall not reduce capacity in any TOD zone by more than 50%. |
| §65912.161(a)(4) | Site-level density capped at 200% of the chapter's maximum. |
| §65912.161(b)(1) | Delay trigger — §65912.157 is deferred until one year after 7th-cycle housing element if the city's 6th-cycle rezoning meets the ≥50% bar. |

---

## Press coverage

- Palo Alto Online — housing tag (primary local beat reporter)
  https://www.paloaltoonline.com/housing/
- Palo Alto Daily Post
  https://padailypost.com/
- San José Spotlight
  https://sanjosespotlight.com/
- The Almanac
  https://www.almanacnews.com/
- Mountain View Voice (relevant for San Antonio band)
  https://www.mv-voice.com/

### Specific articles cited

| Date | Outlet | Title | Link |
|---|---|---|---|
| 2026-04-27 | Palo Alto Online | Palo Alto looks to exemptions, rezoning to limit SB 79 impacts | https://www.paloaltoonline.com/housing/2026/04/27/palo-alto-looks-to-exemptions-rezoning-to-limit-sb-79-impacts/ |
| 2026-04-15 | Palo Alto Online (CalMatters) | Cities scramble to comply with or fight major state housing law | https://www.paloaltoonline.com/calmatters/2026/04/15/cities-scramble-to-comply-with-or-fight-major-state-housing-law/ |
| 2025-11-11 | Palo Alto Online | Palo Alto pauses downtown plan as state housing law upends local rules | https://www.paloaltoonline.com/housing/2025/11/11/palo-alto-pauses-downtown-plan-as-state-housing-law-upends-local-rules/ |
| 2025-10-13 | Palo Alto Online | Housing bill jolts Palo Alto's plans for downtown, San Antonio | https://www.paloaltoonline.com/housing/2025/10/13/housing-bill-jolts-palo-altos-plans-for-downtown-san-antonio/ |
| n.d. | San José Spotlight | Palo Alto looks to rezoning to limit impacts of state bill | https://sanjosespotlight.com/palo-alto-looks-to-rezoning-to-limit-impacts-of-state-bill/ |

---

## Legal / policy analysis

- Holland & Knight — SB 79 signed analysis
  https://www.hklaw.com/en/insights/publications/2025/10/california-gov-gavin-newsom-signs-sb-79
- Allen Matkins — SB 79 alert
  https://www.allenmatkins.com/real-ideas/governor-newsom-approves-sb-79-high-density-transit-oriented-housing-development-projects.html
- Manatt — SB 79 transformative upzoning client alert
  https://www.manatt.com/insights/newsletters/client-alert/sb-79-transformative-upzoning-near-transit-in-california
- Lozano Smith — 2025 housing legislation roundup
  https://www.lozanosmith.com/news-clientnewsbriefdetail.php?news_id=3460

---

## Data sources / our own outputs

- Caltrain GTFS feed (Trillium mirror)
  https://data.trilliumtransit.com/gtfs/caltrain-ca-us/caltrain-ca-us.zip
- Caltrain developer resources
  https://www.caltrain.com/developer-resources
- 511.org Bay Area transit data
  https://511.org/open-data/transit
- ABAG / MTC (regional TOD-stop tier map forthcoming)
  https://abag.ca.gov/

### On this site

- `assets/data/sources.json` — machine-readable mirror of this list (for future automation)
- `assets/data/station-tiers.json` — Caltrain GTFS tier computation output (input to `tier-analysis.html`)
- `assets/data/sb79-parcels.csv` / `.json` — per-parcel SB 79 band membership for Palo Alto's three stations

---

## Notes on usage

**1. Verify decisions in primary sources before publishing.** The April 27 PA Online article previewed the May 4 council meeting as if SB 79 would be decided that night. We took that at face value and published a "Council picked X" page on May 7. The actual May 4 video showed Council **deferred** the SB 79 item due to the late hour — no decision was made. We had to walk back the entire framing. **Lesson: a preview article describes what's planned, not what happened. Always wait for or check the actual record (video, minutes, or post-meeting reporting) before describing a decision as final.**

**2. Sources go stale.** When the 7th-cycle housing element is adopted (~2031), the §65912.161(b)(1) delay-trigger dates change. When HCD publishes the regional tier map (mid-2026), our independent tier computation becomes a cross-check rather than the primary basis. Refresh the relevant pages when those events happen.

**3. AI summaries are not primary sources.** YouTube's Gemini summary helped us realize we were wrong about May 4 — but the actual quote and timing should be verified in the recording or transcript before the page quotes anything verbatim.
