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
| 2026-05-18 | Regular meeting — **SB 79 was NOT on the agenda** (Cubberley master plan, 156 California Ave builder's remedy, retail-vitality ordinance). The City Manager's floated May 18 reschedule did not happen. | Confirmed via PrimeGov agenda | [May 18 agenda](https://cityofpaloalto.primegov.com/Portal/Meeting?meetingTemplateId=18721) |
| 2026-06-01 | SB 79 implementation = **Item 17**. Staff + SB 79 Ad Hoc Committee recommend adopting two temporary ordinances — historic-resource exemption + 50% rezone ("TOD Combining District") — with interim urgency versions on June 15. | Agenda + staff report #2605-6397 + draft ordinances posted | [June 1 agenda](https://cityofpaloalto.primegov.com/Portal/Meeting?meetingTemplateId=18727) |

#### June 1, 2026 — Item 17 staff proposal (key facts)

From the Item 17 staff report (#2605-6397) and the two draft ordinances (Attachments B and C):

- Staff and the Council's SB 79 / Downtown Housing Plan Ad Hoc Committee (Councilmembers Burt and Lauing) recommend a **combination of Approach 2 (historic exemption) + Approach 3 (rezone all TOD-eligible sites to 50% of SB 79 capacity)**.
- Each is a **temporary ordinance** (first reading June 1) plus a matching **interim urgency ordinance** (adopted June 15) — urgency ordinances take effect immediately, so the exclusions are in force before SB 79's July 1 effective date. Permanent ordinances follow via the Planning & Transportation Commission.
- The 50% ordinance creates a new **TOD Combining District** (PAMC §18.14.070). It sets **FAR at exactly half of SB 79** (1.75 / 1.5 / 2.25 vs 3.5 / 3.0 / 4.5), sets **no density cap** ("Maximum density: None"), and **does not set height** — height reverts to underlying local zoning, with a daylight plane (16 ft at the property line, 45°) where a parcel abuts a low-density residential district.
- Exclusion runs until one year after the 7th-cycle Housing Element (staff: ≈January 31, 2032).
- **Verified against statute** (see citations below): the 50% exclusion is self-executing under §65912.161(b)(1)(A); no HCD pre-approval is required — §65912.160 is notice (14 days before adoption) + post-adoption review (within 90 days). No substantive error found in the staff approach.

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

Verbatim text verified at the codified Government Code sections on LegInfo (`codes_displaySection.xhtml?lawCode=GOV&sectionNum=...`).

| Citation | What it says |
|---|---|
| §65912.157(a) | The operative SB 79 development standards. Tier 1: within ¼ mi — 75 ft height / 120 du/ac / FAR 3.5; ¼–½ mi — 65 ft / 100 du/ac / FAR 3.0; adjacent — 95 ft / 160 du/ac / FAR 4.5. This is the section a qualifying ordinance can exclude sites from. |
| §65912.160 | Procedure for SB 79 implementing ordinances: submit draft to HCD ≥14 days before adoption; copy to HCD within 60 days after enactment; HCD reviews substantial compliance within 90 days. **Review and notice, NOT pre-approval** — the ordinance is effective on adoption. |
| §65912.161(a)(1)–(4) | TOD Alternative Plan (Option D) rules: maintain ≥ the same total net zoned capacity; local-register historic exemptions ≤10% of a TOD zone; no TOD zone's capacity cut by >50%; site capacity counted ≤200% of the chapter max. An alternative plan **does** need HCD review and approval. |
| §65912.161(b)(1) | The fast off-ramp. "Prior to one year following the adoption of the seventh revision of the housing element, Section 65912.157 shall not apply" to sites a city excludes by ordinance — including **(A)** a site that permits density **and** FAR at no less than 50% of §65912.157(a), and **(F)** a site with a historic resource on the local register as of Jan 1, 2025 (also fire/flood/sea-level-rise sites). This is the statutory basis for the June 1 temporary ordinances. |

---

## Neighboring cities — what they're doing about SB 79

Background for `neighbors.html`. Each row links to a primary source (city staff report, ordinance, meeting video) where available, with press coverage as a secondary check. Distinguishing rule: a row stays here only if it's verifiable against the official city record or a primary statutory document; preview-only sources are flagged.

### Menlo Park

| Source | What it gives us | Link |
|---|---|---|
| Staff Report #26-078-CC (5/12/2026 Council Item H-3) | Verbatim recitation of the 4/27/2026 Planning Commission 5–1 vote (Ferrick dissenting, Do absent) recommending the City Council NOT adopt the temporary exemption ordinance; describes staff's recommended 50% off-ramp under §65912.161(b)(1)(A) and the proposed MPMC Ch. 16.57 covering 130 parcels / 43.3 ac across D, SA-W, SA-E, ECR-SE, ECR-NE-R sub-districts. | [PDF](https://www.menlopark.gov/files/assets/public/v/1/h3-20260512-cc-sb-79-housing-developments.pdf) |
| 4/27/2026 Planning Commission agenda packet | The Option 1–4 framing, the parcel-by-parcel exemption maps, the draft resolution. | [PDF](https://www.menlopark.gov/files/sharedassets/public/v/2/agendas-and-minutes/planning-commission/2026-meetings/agenda/20260427-planning-commission-agenda-packet.pdf) |
| 5/12/2026 City Council meeting video | Full deliberation on Item H-3 (~4 hours in); Council reaches consensus around "no action" without a formal vote — Mayor Nash, Councilmembers Taylor, Combs, and Schmidt all on record as supporting no action. Transcribed via Transcriber MCP. | [YouTube](https://youtu.be/3jCACg8W_W0) |

**Outcome (confirmed):** No exemption ordinance introduced. SB 79 will apply in Menlo Park by default on July 1, 2026. Tentative May 19 second reading is moot. Official minutes for both 4/27 and 5/12 are pending publication at time of writing.

### Mountain View

| Source | What it gives us | Link |
|---|---|---|
| MV Voice, 2026-01-28 | Council direction on Local Alternative Plan (focused on historic downtown buildings); staff confirmed LAP will not be ready by July 1, 2026. Staff estimates SB 79 covers ~21% of MV land area. | https://www.mv-voice.com/land-use/2026/01/28/mountain-view-looks-to-mitigate-impact-of-state-housing-law-sb-79/ |
| MV Voice, 2025-12-11 | 12/9/2025 Council vote 7–0 (motion Ramirez, second Hicks) to pause historic-register expansion, declining to designate buildings as historic purely to beat the SB 79 clock. | https://www.mv-voice.com/land-use/2025/12/11/mountain-view-inches-closer-to-updating-historic-register-amid-community-pushback/ |
| MV Voice, 2025-11-10 | EPC briefing dispute — Commissioners Yin and Cranston pushed for SB 79 briefing pre-year-end; CDD Director Murdock declined. | https://www.mv-voice.com/housing/2025/11/10/mountain-view-commissioners-city-staff-clash-on-response-to-state-housing-law/ |
| mountainview.legistar.com | Underlying staff reports; 2026 Legislative Platform adopted text (referenced as containing an "SB 79 Alternative Plan Timelines" position — exact language needs to be pulled before being quoted). | https://mountainview.legistar.com/ |

### Sunnyvale

| Source | What it gives us | Link |
|---|---|---|
| Public hearing notice — Murphy Station heritage carve-out (PLNG-2026-0118) | Amends Zoning Code Ch. 19.96 to exclude the 100 block of S. Murphy Ave + surrounding heritage parcels from Gov. Code §65912.157. PC heard 4/27/2026; Council first reading noticed for 6/2/2026. | [PDF](https://www.sunnyvale.ca.gov/home/showpublisheddocument/878/637907364053900000) |
| Silicon Valley Voice, 2026-02-24 | 2026 Legislative Platform adoption (2/10/2026 meeting); discussed SB 79 but no specific support/oppose position reported. | https://www.svvoice.com/sunnyvale-establishes-stances-on-state-laws/ |
| San José Spotlight, 2025-11-06 | Mayor Larry Klein on mobile-home-park displacement risk under SB 79. | https://sanjosespotlight.com/state-bill-could-displace-sunnyvale-mobile-home-residents/ |

### Redwood City

| Source | What it gives us | Link |
|---|---|---|
| RWC Pulse, 2026-01-13 | 2026 state legislative platform adoption; no SB 79 position reported. | https://www.rwcpulse.com/city-government/2026/01/13/redwood-city-council-defines-state-level-priorities/ |
| Greater Downtown Area Plan resources | Active long-range planning vehicle; preferred alternative estimated fall 2026, final adoption late 2027 — after SB 79 effective date. | https://rwcgreaterdowntown.com/resources/ |

### San Carlos

| Source | What it gives us | Link |
|---|---|---|
| San Carlos 2026 Strategic Agenda | City Council priorities; no SB 79-specific item. | https://www.cityofsancarlos.org/city_hall/city_council/strategic_plan.php |
| Northeast Area Specific Plan project page | Planning Commission recommended adoption 5/18/2026; tentative council adoption 6/8/2026. Draft does not mention SB 79. | https://www.sancarlosnortheastplan.com/ |

### Los Altos

| Source | What it gives us | Link |
|---|---|---|
| losaltosca.gov | No SB 79-specific staff report or implementation ordinance on file as of 2026-05-23. | https://www.losaltosca.gov |
| Los Altos General Plan Update launch, 2026-01-14 | References "new State laws" generically; does not name SB 79. | https://www.losaltosca.gov/m/newsflash/home/detail/30 |
| CalMatters Digital Democracy — SB 79 page | Los Altos is not listed as a registered supporter or opponent of SB 79. | https://calmatters.digitaldemocracy.org/bills/ca_202520260sb79 |

**Geographic note:** San Antonio Caltrain (190 Showers Drive, Mountain View) sits ~0.3 mi from the Los Altos border. The half-mile SB 79 radius reaches across El Camino Real into north Los Altos. No city-issued GIS analysis confirms which Los Altos parcels are affected; the authoritative source is the MTC SB 79 Regional Map.

### Cross-cutting (regional and statutory)

| Source | What it gives us | Link |
|---|---|---|
| MTC SB 79 Regional Map | Authoritative half-mile-buffer overlay on city boundaries. Preliminary draft; becomes official July 1, 2026. | https://mtc.ca.gov/planning/land-use/senate-bill-79-regional-map |
| ABAG SB 79 Summary, 2026-04-08 | Tier definitions, train-count thresholds, Caltrain station classifications. | https://abag.ca.gov/sites/default/files/documents/2026-04/SB79-Summary-040826.pdf |

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

## Stakeholder / public-comment letters

Public submissions filed with Council in connection with specific agenda items. These are *primary* documents (they enter the official record) but reflect each submitter's advocacy position — not neutral analysis. Track positions across the housing-politics spectrum as letters surface.

| Date | Submitter | Agenda item | Position summary | Link |
|---|---|---|---|---|
| 2026-04-30 | Palo Alto Forward (Jeremy Levine, Executive Director) — pro-housing advocacy | May 4, 2026 / Agenda Item 14 — Implementation of SB 79 (deferred at the meeting) | Supports **Approach 4 (TOD Alternative Plan)** as best path. Endorses pairing with **Approach 2 (emergency historic ordinance)** as interim bridge if A4 takes too long. Opposes **Approach 3 (50% Now, Rest in 2032)** — calls it the worst of both worlds on cost, massing, and RHNA. Includes detailed 8-factor scoring table comparing all four approaches. | [Google Doc](https://docs.google.com/document/d/174bUSfEBp4lBXXMvxMJGiiSa4zD9nEGT9eX-i6i-spE/edit) |

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
