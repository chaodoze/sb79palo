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
- **Accela Citizen Access — planning/building permit records** (⚠️ *candidate route, verified 2026-07-30*)
  https://aca-prod.accela.com/PALOALTO/Cap/CapHome.aspx?module=Planning
  The city's permit record, and the primary source for **which SB 79 applications were filed and
  when** — the question the 384-vs-341 unit conflict and PR #4 turn on. Publicly reachable with
  **no login wall**; the "General Search" form takes Application Number, Start/End Date and Street.
  **Not yet queryable headlessly:** a flat ASP.NET postback (harvesting `__VIEWSTATE` +
  `__VIEWSTATEGENERATOR`, POSTing `txtGSStartDate`/`txtGSEndDate` with `btnNewSearch`) 302s to
  `Error.aspx` — the form needs session/ScriptManager state. *Re-probed 2026-08-01 by a second,
  different route:* `Cap/GlobalSearchResults.aspx?QueryText=…` returns **HTTP 200 with a ~93 KB
  shell and zero result rows** — same class of failure as the postback, and the same shape as the
  Accusoft and Power BI shells (a success status carrying no data). Two distinct routes have now
  failed; **stop re-probing headlessly** and treat this as a human-only route until someone finds a
  session-bearing client. A human can run the date-range search in a browser in under a minute.
  The portal names **PDSdata@paloalto.gov** for data questions.
- City of Palo Alto Council legislation library
  https://www.paloalto.gov/Departments/City-Clerk/City-Council
- Council Committee Meetings page
  https://www.paloalto.gov/Departments/City-Clerk/City-Council/City-Council-Committee-Meetings
- Weekly City Manager Updates (status digest)
  https://www.paloalto.gov/News-Articles/City-Manager (search "Weekly City Manager Updates")

### Specific council records we've cited

| Date | Item | Status | Link |
|---|---|---|---|
| 2026-05-04 | Council meeting where SB 79 was on agenda but **deferred due to late hour** | Video posted; transcript pulled; **minutes now posted** (*2026-07-19:* action minutes record "Agenda Item Number 14 not heard and deferred to a date uncertain" — corroborates the video account) | [YouTube](https://www.youtube.com/watch?v=vM0GY2Rdnow) (deferral exchange 4:58:43–5:00:24) · [action minutes](https://cityofpaloalto.primegov.com/Public/CompiledDocument/20952) · [summary minutes](https://cityofpaloalto.primegov.com/Public/CompiledDocument/20923) |
| 2026-05-18 | Regular meeting — **SB 79 was NOT on the agenda** (Cubberley master plan, 156 California Ave builder's remedy, retail-vitality ordinance). The City Manager's floated May 18 reschedule did not happen. | Confirmed via PrimeGov agenda | [May 18 agenda](https://cityofpaloalto.primegov.com/Portal/Meeting?meetingTemplateId=18721) |
| 2026-06-01 | SB 79 implementation = **Item 17**. Staff + SB 79 Ad Hoc Committee recommend adopting two temporary ordinances — historic-resource exemption + 50% rezone ("TOD Combining District") — with interim urgency versions on June 15. | Agenda + staff report #2605-6397 + draft ordinances posted | [June 1 agenda](https://cityofpaloalto.primegov.com/Portal/Meeting?meetingTemplateId=18727) |
| 2026-06-01 | **OUTCOME: first reading PASSED 5–0** (vote ~12:30 a.m. June 2). Adopted the B+C package with friendly amendments; Reckdahl & Lu recused. Second reading + urgency ordinance set for June 15. | Verified against meeting video; **approved action minutes now posted** (approved June 15 Item 4; DocuSigned) record "MOTION PASSED: 5-0-2, Lu, Reckdahl Recused" — matches | [YouTube](https://www.youtube.com/watch?v=Cczy-CGO8IE) · [action minutes PDF](https://cityofpaloalto.primegov.com/Public/CompiledDocument/21004) |
| 2026-06-15 | SB 79 = **Item 23** (staff report #2606-6432), split into 23A (two temporary ordinances, 2nd reading), 23B (historic-site urgency ordinance), 23C (50% citywide urgency ordinance). **Item 4** approves the June 1 draft action minutes. Agenda posted 2026-06-05. | Agenda + staff report + 4 ordinance attachments posted; verified via PrimeGov agenda HTML | [June 15 agenda](https://cityofpaloalto.primegov.com/Portal/Meeting?meetingTemplateId=18739) |
| 2026-06-15 | **OUTCOME: temporary ordinances (23A) adopted 2nd reading → effective July 16; historic urgency ordinance (23B) adopted → effective ~July 1; the 50% citywide urgency ordinance (23C) DID NOT PASS.** 23C needed 4 of 5 eligible votes (Reckdahl & Lu recused); Lythcott-Haims, Stone, Veenker declined the required "immediate threat" finding, so it never reached a motion to adopt. Council directed staff not to proceed (5–0) and to study Cal Ave/ECR upzoning (4–1, Burt no). Net effect: **full-strength SB 79 applied citywide July 1–15 except historic sites; the 50% reduction took effect July 16.** | Verified against meeting video; **draft action + summary minutes now posted** (published 6/18 and 7/1; not yet council-approved — *2026-07-31:* now **calendared** for approval on the 2026-08-10 consent calendar) and corroborate the 23C record: "not proceed" motion 5-0-2, staff-direction motion 4-1-2 Burt no | [YouTube](https://www.youtube.com/watch?v=GMwh6c4IIZc) · [draft action minutes](https://cityofpaloalto.primegov.com/Public/CompiledDocument/20981) · [summary minutes](https://cityofpaloalto.primegov.com/Public/CompiledDocument/21023) |
| 2026-08-10 | Regular meeting — **SB 79 is NOT on the agenda.** This is the first Council meeting since June 15: the Aug 3 regular meeting was canceled, and the Aug 10 agenda's own information reports include a "City Council Summer Recess Report." The consent calendar does carry **"Approval of Minutes from June 8 and June 15, 2026 Meetings,"** whose Attachment B is the *June 15, 2026 Draft Action Minutes* — so the June 15 minutes are **calendared** for approval, not approved. Whether that approval happens (and in what form) is a meeting-record question, not an agenda one. | Agenda published 2026-07-31; all item text read via the PrimeGov agenda-HTML route | [Aug 10 agenda](https://cityofpaloalto.primegov.com/Portal/Meeting?meetingTemplateId=18773) |

#### June 1, 2026 — Item 17 staff proposal (key facts)

From the Item 17 staff report (#2605-6397) and the two draft ordinances (Attachments B and C):

- Staff and the Council's SB 79 / Downtown Housing Plan Ad Hoc Committee (Councilmembers Burt and Lauing) recommend a **combination of Approach 2 (historic exemption) + Approach 3 (rezone all TOD-eligible sites to 50% of SB 79 capacity)**.
- Each is a **temporary ordinance** (first reading June 1) plus a matching **interim urgency ordinance** (adopted June 15) — urgency ordinances take effect immediately, so the exclusions are in force before SB 79's July 1 effective date. Permanent ordinances follow via the Planning & Transportation Commission.
- The 50% ordinance creates a new **TOD Combining District** (PAMC §18.14.070). It sets **FAR at exactly half of SB 79** (1.75 / 1.5 / 2.25 vs 3.5 / 3.0 / 4.5), sets **no density cap** ("Maximum density: None"), and **does not set height** — height reverts to underlying local zoning, with a daylight plane (16 ft at the property line, 45°) where a parcel abuts a low-density residential district.
- Exclusion runs until one year after the 7th-cycle Housing Element (staff: ≈January 31, 2032).
- **Verified against statute** (see citations below): the 50% exclusion is self-executing under §65912.161(b)(1)(A); no HCD pre-approval is required — §65912.160 is notice (14 days before adoption) + post-adoption review (within 90 days). No substantive error found in the staff approach.

#### June 1, 2026 — Item 17 OUTCOME (verified against meeting video)

Source: [meeting video](https://www.youtube.com/watch?v=Cczy-CGO8IE), final ~20 minutes (transcribed via `mcp__transcriber__transcribe`, start_minutes 395). *Update 2026-07-18:* the [approved action minutes](https://cityofpaloalto.primegov.com/Public/CompiledDocument/21004) (approved June 15, Item 4) are now posted and record the Item 17 motion passing **5–0–2, Lu & Reckdahl recused**, with the friendly amendments (PA Forward letter consideration; Cal Ave/ECR focus, return in 6–12 months) incorporated — consistent with the video account below.

- **First reading PASSED 5–0.** Roll call (verbatim from the video): Burt — Yes; Vice Mayor Stone — Yes; Lythcott-Haims — Yes; Lauing — Yes; Mayor Veenker — Yes. "Motion carries." Vote taken ~12:30 a.m. June 2, closing out the meeting.
- **Recusals:** Councilmembers Keith Reckdahl and George Lu recused (each owns property within the SB 79 station areas / "splash zone"), leaving five voting. On the record, staff noted Lu's conflict is limited to the San Antonio corridor and he has sought FPPC advice that may let him participate in a future, segmented discussion.
- **What passed:** the staff/Ad Hoc recommendation — the **B+C** interim ordinance (historic exemption + 50% TOD rezone) — on first reading, *as drafted* (50% FAR figure and daylight-plane standards unchanged).
- **Friendly amendments folded in (3A and Item 7):** (1) direct staff to consider the **Palo Alto Forward letter** when developing the permanent ordinance before the PTC; (2) have the PTC study **focused upzoning of identified corridors — with particular focus on the Cal Ave area, including El Camino Real in the vicinity of Cal Ave**, which Council has identified as suitable for higher density — returning a recommendation to Council in **6–12 months**. Staff (Director Lait) was explicit this is *not* a TOD Alternative Plan (Option D), and *not* an all-or-nothing list.
- **Next step:** second reading + matching **interim urgency ordinance on June 15** (stated on the record by staff during the discussion), so the rules take effect before SB 79's July 1 date.
- **The urgency-findings exchange (verified in transcript, 2026-06-09):** at ~5:51:30 a councilmember asked how SB 79 presents "a current and immediate threat to the public health, safety or welfare." Staff's examples (~5:52:00–5:53:30): the city needs more time to study whether the water network delivers "enough water pressure … to support development," and more 7–8-story buildings "may put a strain on our fire resources apparatus necessary to provide emergency services to taller buildings." Staff then deferred legal framing to the City Attorney's office (Assistant City Attorney Albert Yang, ~5:53:40). At ~5:55:30 staff added that recent housing projects "grappled in each case with being able to handle storm water loads." At ~6:19:20 a councilmember pushed back that infrastructure "may not be a big huge thing" given well-aligned zoning. Basis for the editorial note on council-watch.html.

> ⚠️ **Note on press accounts.** Two June 2 articles diverged: Palo Alto Online correctly reported the B+C approval but said the item "heads to the PTC on June 10" (not supported by the video — staff said 6–12 months); the Daily Post framed it as a 5–0 deferral to the PTC for 6–12 months, conflating the *separate* permanent-ordinance/Cal-Ave track with the interim vote. The video reconciles both: the interim B+C ordinance passed first reading (→ June 15), *and* a permanent/focused-upzoning track goes to the PTC for 6–12 months. Always go to the video.
>
> **Receipt (2026-06-09):** the [PTC's June 10 agenda](https://cityofpaloalto.primegov.com/Portal/Meeting?meetingTemplateId=20312) contains **no SB 79 item** — only a Hansen Way special-setback amendment and April 29 minutes approval. PA Online's "heads to the PTC on June 10" claim is now definitively contradicted by the posted agenda.

#### June 15, 2026 — Item 23 staff report (#2606-6432) key facts

- **Consent calendar.** Second reading + adoption of both temporary ordinances, plus introduction AND adoption of both companion interim urgency ordinances, in one item.
- **Why urgency:** regular ordinances are subject to a 30-day referendum period → effective **July 16, 2026**, leaving a July 1–16 gap with no local measures in force. Urgency ordinances (PAMC Ch. 2.04 + Gov. Code §65858) take effect immediately. The urgency versions "substantially mirror" the temporary ordinances.
- **One change since first reading:** clarifies **maximum site coverage = 70%** in the TOD Combining District; staff: "does not substantively change the intensity of development permitted."
- Other standards spelled out: FAR 1.75 / 1.5 / 2.25 (adjacent = **within 200 feet** of a transit stop); minimum setbacks 10 ft front/rear, 4 ft sides unless underlying zone differs; daylight plane 16 ft / 45° adjacent to low-density residential.
- **Next steps if adopted:** submit ordinances to HCD; update zoning maps; over **6–12 months** prepare codifying ordinances "while exploring opportunities to accelerate housing production on California Avenue and adjacent areas on El Camino Real"; continue Downtown Housing Plan work with the Ad Hoc.
- CEQA: exempt under Gov. Code §65912.160(c)(2).

#### June 15, 2026 — Item 23 OUTCOME (verified against meeting video)

Source: [June 15 meeting video](https://www.youtube.com/watch?v=GMwh6c4IIZc) (video ID pulled from the PrimeGov Item 23 agenda page, not a web-search result — see the learnings note about a mis-identified video). Auto-transcript, no diarization. *Update 2026-07-18:* [draft action minutes](https://cityofpaloalto.primegov.com/Public/CompiledDocument/20981) (published 6/18) and [summary minutes](https://cityofpaloalto.primegov.com/Public/CompiledDocument/21023) (published 7/1) are now posted — still drafts pending council approval (*2026-07-31:* calendared for approval on the [2026-08-10 consent calendar](https://cityofpaloalto.primegov.com/Portal/Meeting?meetingTemplateId=18773)) — and corroborate the account below on the 23C motions and recusals. What the staff report *proposed* (adopt all four ordinances in one consent item) is **not** what happened.

- The city attorney split Item 23 into **23A** (the two temporary/non-urgency ordinances, second reading), **23B** (interim urgency ordinance on **historic sites**), **23C** (interim urgency ordinance applying the **50% reduction citywide**).
- **23A adopted** on second reading → **effective July 16, 2026** (after the 30-day referendum period). City attorney on the record: "the two that you voted on the second reading will take effect on July 16th."
- **23B (historic urgency) adopted** → **effective immediately (~July 1)**. Mayor: "we also just passed an urgency ordinance that exempts historic sites starting now… effective on July 1 when SB79 comes into effect."
- **23C (50% citywide urgency) DID NOT PASS.** An urgency ordinance needs **4 yes votes**; with Reckdahl and Lu recused only 5 could vote, and Lythcott-Haims, Stone, and Veenker declined to make the required "current and immediate threat to the public health, safety or welfare" finding — so four yeses were impossible and no member ever moved to adopt it. Council instead passed a two-part substitute (Veenker moved, Lythcott-Haims seconded): (1) direct staff **not** to proceed with 23C — **5–0**; (2) explore/​bring back Cal Ave + El Camino zoning revisions within 6–12 months — **4–1, Burt dissenting**.
- **Recusals (Item 23):** Lu ("I own a condo in the SB 79 radius") and Reckdahl ("my home's proximity to the San Antonio station").
- **23A/23B consent vote (from the draft minutes; needs a video check):** both adopted via the consent-calendar motion — "MOTION PASSED ITEM 23a-b: 4-1-2, Lythcott-Haims no, Lu and Reckdahl recused." Lythcott-Haims had pulled 23a and 23b to register opposition; the summary minutes give her reasons (the 50% standard "would reduce housing capacity in areas planned for additional growth" and may be inconsistent with the Prohousing Designation pursuit; the record "does not appear to contain findings supporting" the 23B urgency ordinance). The video pass had not captured this vote geometry — verify against the consent-calendar segment of the meeting video before treating it as settled.
- **Net effect:** from **July 1 through July 15**, full-strength SB 79 applied in all three station areas **except historic sites** (protected by 23B); the **50% reduction took effect July 16** via 23A. City attorney: "there's a 15-day gap where SB79 would take effect to its full extent."
- **Reasons on the record** (verbatim): Stone — the findings "acknowledge that there are no pending project applications that would be affected… these findings are just difficult to reconcile"; Veenker — "I believe that our legal risk outweighs the risk associated with having one or maybe a couple of applications that get filed in that short window," and passing it would "risk our pro housing designation"; Lythcott-Haims — "if we make emergency findings to warrant this urgency, it is highly doubtful we'll get our pro-ousing designation that we just approved in item 7."

> ⚠️ **Note on press accounts (June 15).** Both [PA Online (6/16)](https://www.paloaltoonline.com/housing/2026/06/16/palo-alto-nixes-urgency-measure-to-limit-impact-of-housing-law/) and [Daily Post (6/15)](https://padailypost.com/2026/06/15/council-backs-off-of-rule-to-block-tall-buildings-near-caltrain/) got the headline right (the 50% urgency measure failed; historic exemption in force; two-week gap) but framed it as a **3–2 roll call with "Burt and Lauing in favor."** The video does not support that: **no member voted to adopt 23C** — it died for lack of the four required votes, and the recorded votes were on the substitute motion to *not* proceed (5–0) and to direct staff (4–1, Burt the lone **no** on the staff direction). Go to the video.

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

**The three other SB 79 surfaces HCD links from that page** (indexed 2026-08-01; each
fetched and confirmed to resolve). Twelve daily runs checked the TOD page's *last-updated
stamp* and never read its *link list*, so none of these were in this index:

- **Submit an SB 79 Ordinance or TOD Alternative Plan** — the §65912.160 filing channel.
  HCD's wording: draft and enacted ordinances and TOD alternative plans "must be submitted
  to HCD's Portal as a 'Housing Law Request'," with the submittal form attached as a cover
  sheet, "within 60 calendar days of enactment."
  https://calhcd.service-now.com/csp?id=sc_cat_item&sys_id=91e19b8ac31955109a97251ce0013105
- **SB 79 Local Enactment Submittal Form** (PDF, 328 KB; server `last-modified`
  2026-05-07) — the required cover sheet for the above.
  https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/sb-79-local-enactment-submittal-form.pdf
- **Guidance to Include SB 79 Sites in Housing Elements** — technical assistance for
  counting SB 79 capacity in a housing-element sites inventory under §65912.155: sites must
  be listed parcel-specifically by APN, must satisfy every §65583.2 site requirement, and
  capacity must be justified against the "likelihood that developers will utilize SB 79"
  rather than assumed, with a monitoring program. Bears on any future Palo Alto or
  neighbor-city claim that SB 79 zoning does RHNA work.
  https://www.hcd.ca.gov/planning-and-research/sb79-tod/housing-element-sites

⚠️ A fourth link, **"HCD Technical Assistance and SB 79 Ordinance Review Letters,"** is
treated separately below — it is the per-jurisdiction letter register, and it is not
headless-readable.

**Link-set diff, 2026-08-03 — closed.** The TOD page's outbound links were re-enumerated
(stamp still **06/30/2026**; link set unchanged from 08-01). Every SB 79 link above is now
indexed. The one page link that was not is **"Housing Accountability Unit Portal"** →
https://www.hcd.ca.gov/hau/portal. Fetched: a wrapper page, no date stamp, **no occurrence
of "SB 79" / "Senate Bill 79" / "65912,"** and its single functional link is the **same
ServiceNow catalog item** (`sys_id=91e19b8ac31955109a97251ce0013105`) already indexed above
as "Submit an SB 79 Ordinance or TOD Alternative Plan." So the §65912.160 filing channel and
the HAU's general intake — where, in HCD's own description of that page, any party may file a
potential housing-law violation complaint — are **one queue**, not two.

### ⚠️ Newsom/HCD housing enforcement actions are **Housing Element Law**, not SB 79

Checked 2026-08-02 because trade press headlines the March action as SB 79 enforcement.
Both Governor's Office releases were fetched and searched: **each contains zero occurrences
of "SB 79" / "Senate Bill 79,"** and the grounds in both are the **housing element** (6th
cycle), a separate statute from §§65912.155–65912.162.

- **2026-03-25 — final warning / Notices of Violation to 15 cities and counties.** All
  "more than two years behind schedule" and more than 60 days from a certified housing
  element; 30 days to respond before referral to the Attorney General.
  https://www.gov.ca.gov/2026/03/25/governor-newsom-issues-final-warning-to-15-communities-violating-state-housing-laws/
  (HCD mirror, also zero SB 79 mentions: https://www.hcd.ca.gov/about-hcd/newsroom/HAU-15-NOV)
- **2026-07-16 — AG suits filed against five cities**: Calexico, Costa Mesa, Half Moon Bay,
  Ridgecrest, Turlock. Same housing-element grounds; not SB 79.
  https://www.gov.ca.gov/2026/07/16/no-more-excuses-newsom-administration-takes-legal-action-against-five-california-local-governments-for-defying-state-housing-law/
- ⚠️ **Do not cite for SB 79 enforcement:** HousingWire, "Newsom warns cities of lawsuits
  over California SB 79 law" (2026-03-26). It reports the 3/25 *housing-element* action
  under an SB 79 headline and splices in Los Angeles's separate SB 79 density ordinance.
  https://www.housingwire.com/articles/los-angeles-sb79-density/

**Exactly what this establishes:** neither release names Palo Alto or any tracked neighbor
city, and HCD's newsroom index (https://www.hcd.ca.gov/about-hcd/newsroom) carried no SB 79
news item when enumerated 2026-08-02. It does **not** establish that no SB 79 enforcement
exists anywhere — the per-jurisdiction SB 79 letter register is the Power BI embed noted
below, still not headless-readable, so an absence cannot be read off it.

### Key statute citations we've used

Verbatim text verified at the codified Government Code sections on LegInfo (`codes_displaySection.xhtml?lawCode=GOV&sectionNum=...`).

> ⚠️ **`65912` alone is not an SB 79 token — do not grep for it as one.** SB 79 is
> **§§65912.155–65912.162**; **AB 2011** (Affordable Housing and High Road Jobs Act, 2022) is
> **§65912.100 et seq.** — §§65912.121–65912.124 are its streamlining provisions. The two share
> the `65912.` prefix and are different articles. Found the hard way 2026-08-04: Menlo Park's
> 80 Willow Road response letter matches `65912` **19 times** and SB 79 **zero** times; a bare
> `grep 65912` would have logged an AB 2011 dispute as an SB 79 finding. **Match on
> `65912.15`/`65912.16`, or on "SB 79"/"Senate Bill 79," and confirm the article before citing.**

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
| 4/27/2026 Planning Commission **approved minutes** (approved 6/8/2026; fetched + verified 2026-07-20) | ACTION verbatim: "Motion and second (Silverstein/Ehrich) to not adopt the draft resolution and instead recommend that the City Council not adopt an ordinance exempting sites from SB 79 and instead let SB 79 go into full effect, and recommend that the City Council direct staff to study the effects of SB 79 on the City at some point in the future; passes 5-1 with Commissioner Ferrick dissenting and Commissioner Do absent." Matches the staff-report recitation we had cited. One public commenter (Paul Roberts, pro-SB 79). | [PDF](https://www.menlopark.gov/files/sharedassets/public/v/1/agendas-and-minutes/planning-commission/2026-meetings/minutes/20260427pc-approved-minutes.pdf) |
| 5/12/2026 City Council **approved minutes** (approved 6/9/2026; fetched + verified 2026-07-20) | Item H3 record: public hearing, then "No action." — corroborates the video account. Also formally records "The City Council directed staff to keep City Council advised of applications submitted pursuant to SB 79." ⚠️ Lists **three** public speakers on H3 (June Shin, Adina Levin, Katherine Dumont — all supporting the PC's no-action recommendation); neighbors.html had said "both public speakers" (two). Correction routed to a PR for verification against the meeting video per the minutes-are-tier-(a)-for-new-detail rule. | [PDF](https://www.menlopark.gov/files/sharedassets/public/v/1/agendas-and-minutes/city-council/2026-meetings/minutes/20260512-city-council-regular-minutes-approved.pdf) |

**Outcome (confirmed):** No exemption ordinance introduced. SB 79 will apply in Menlo Park by default on July 1, 2026. Tentative May 19 second reading is moot. *Update 2026-07-20:* approved minutes for both meetings are now posted (PC approved 6/8, Council approved 6/9) and corroborate the 5–1 PC vote and the Council "No action." record.

### Atherton

| Source | What it gives us | Link |
|---|---|---|
| Town of Atherton — Multi-Family Housing page (fetched 2026-07-19) | Official Town statement: Council adopted zoning amendments 3/18/2026 adding AMC Ch. 17.59 ("Regulations and Objective Standards for Development Projects sought Pursuant to Government Code Section 65912.157 (SB 79)"); submitted to the state 3/26/2026; Town "has received notification from HCD that Atherton is in substantial compliance with SB 79." Standards floor: height ≥75 ft, density ≥120 du/ac, FAR ≥3.5 on seven properties (Glenwood Ave, Laurel St, Victoria Dr) inside the Menlo Park Caltrain ¼-mi band. | https://www.athertonca.gov/672/Multi-Family-Housing |
| SB 79 ordinance text — AMC Chapter 17.59 (PDF; administrative draft) | The ordinance text (26 pp., read in full 2026-07-19). ⚠️ The Town's posted copy is the **March 2026 administrative draft** — ordinance number and the "Passed and adopted… by the following vote" block are blank. Recitals confirm the path: PC hearing 1/28, Council first reading 2/18 (continued to second reading), second-reading hearing 3/18. Substance verified: pure §65912.157 objective-standards chapter (ministerial approval; maximums set exactly at the state floors — 75 ft height, 120 du/ac, 3.5 FAR — plus setback/design/screening standards); **no §65912.161(b) exclusion language anywhere**. Effective clause ties to HCD approval and SB 79's effective date. | https://www.athertonca.gov/DocumentCenter/View/12538 |
| Town of Atherton — "That's A Wrap!" council recap, March 18, 2026 | Town's own same-week recap of the 3/18 meeting: consent agenda included "2nd Reading and Adoption of the Objective Design Standards for SB 79 affected parcels" — independent Town corroboration that adoption happened 3/18 (on consent). No vote count or ordinance number given. | https://athertonca.gov/Blog.aspx?ARC=105&IID=207 |
| **PrimeGov public API — `atherton.primegov.com`** (identified 2026-07-29) | Atherton *does* run a machine-readable portal — five earlier scans logged the Town's records as "checked, inaccessible (404/JS)" and were looking at the wrong surface. Same access pattern as San Carlos (see below): `…/api/v2/PublicPortal/ListArchivedMeetings?year=2026` for the calendar, `…/Portal/Meeting?meetingTemplateId=<tid>` for agenda item text. Sweeping all 51 Atherton meetings of 2026 for SB 79 gives the Town's own agenda language for the whole path — PC 1/28 (`tid2475`, "Attachment 3 - Administrative Draft Chapter 17.59 SB 79 Ordinance"); Council 2/18 (`tid2505`) "INTRODUCTION AND FIRST READING OF AN ORDINANCE THAT AMENDS THE ATHERTON MUNICIPAL CODE TO ADDRESS POTENTIAL DEVELOPMENT UNDER SENATE BILL 79"; Council 3/18 (`tid2515`) "SECOND READING AND ADOPTION OF AN ORDINANCE TO ADD CHAPTER 17.59 AND AMEND CHAPTER 17.60 … TO ADDRESS POTENTIAL DEVELOPMENT UNDER SENATE BILL 79", staff recommendation "that the City Council adopt the attached ordinance". **No SB 79 item appears on any Atherton agenda after 3/18 through 7/22/2026** — the 7/15 regular meeting has none. | https://atherton.primegov.com/api/v2/PublicPortal/ListArchivedMeetings?year=2026 |

**Status: verified 2026-07-19 (adoption); agenda path re-confirmed from the Town's own portal 2026-07-29; HCD claim remains self-reported.** A 3/18 **Minutes** document does exist in the portal (doc id 7244) but is not headless-retrievable — compiled minutes only render through the Accusoft JS viewer, and the `historyattachment` download route that works for *attachments* does not serve compiled documents. So the vote count is still unread. The 3/18 adoption is corroborated by two independent Town sources (Multi-Family Housing page + meeting recap blog) plus the draft's recitals; the signed ordinance/vote count is not yet public (the Town's minutes archive lags — re-check for final minutes and an ordinance number later). The HCD substantial-compliance statement is the Town's own, and the site keeps its "The Town reports…" attribution — but the reason recorded here through 2026-07-31 was wrong. **Corrected 2026-08-01:** a public per-jurisdiction register *does* exist and HCD names it on the SB 79 TOD page itself, as **"HCD Technical Assistance and SB 79 Ordinance Review Letters,"** with the blurb "All letters issued are available to the public and organized by jurisdiction, date and subject" → https://www.hcd.ca.gov/hau/enforcement-letters. The earlier note ("no HCD letter or per-city HCD determination list is public … HCD's SB 79 page lists none") read the page's last-updated stamp and not its link list. What is actually true is narrower and is an *access* limit, not an absence: that page is the **Power BI Gov embed** already logged as not headless-reachable (see `learnings.md` 2026-07-27) — its H1 is still the generic "Technical Assistance and Enforcement Letters Dashboard" and the page markup contains no SB 79 text, so only HCD's own link label ties it to SB 79. **Route for a human:** open the dashboard in a real browser and filter by jurisdiction = Atherton; a letter there would convert the Town's self-report into a state record. Atherton's status is unchanged and unverified either way. Timing is plausible: submitted 3/26, §65912.160(d) 90-day review ≈ late June.

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
| Public hearing notice — Murphy Station heritage carve-out (PLNG-2026-0118) | Amends Zoning Code Ch. 19.96 to exclude the 100 block of S. Murphy Ave + surrounding heritage parcels from Gov. Code §65912.157. **The notice's dates (PC 4/27, Council first reading 6/2) turned out stale** — see Legistar row below. | [PDF](https://www.sunnyvale.ca.gov/home/showpublisheddocument/878/637907364053900000) |
| Sunnyvale Legistar (web API, verified 2026-06-09) | Actual carve-out timeline: PC recommendation **4/13/2026** (file 26-0354, passed); Council **first reading passed 5/5/2026** (file 26-0481, history shows approved/Pass); **adoption as Ordinance No. 3253-26 on the 5/19/2026 consent calendar, Item 1.L** (file 26-0518). May 19 minutes still draft as of 6/9 — adoption vote not yet independently verifiable, but Ord. No. 3254-26 (next in sequence) was adopted 6/2, consistent with 3253-26 adopting 5/19. The 6/2 Council agenda has **no Murphy item**. No further Council meetings on the Legistar calendar June 8–July 1. | [Legistar](https://sunnyvaleca.legistar.com/Legislation.aspx) |
| 5/19/2026 City Council regular-meeting **final minutes** (fetched + verified 2026-07-22) | Adoption now independently verified. Identity-checked per the 2026-07-19 learning: this is the **7 PM regular meeting (Legistar event 4514)**, not the same-day 11 AM budget-workshop special (event 4515). Item 1.L (file 26-0518) reads "Adopt Ordinance No. 3253-26 … Temporarily Excluding the Murphy Station Heritage Landmark District … from Applicability of SB 79 Provisions"; the consent-calendar motion covering 1.A–1.D and 1.F–1.L (Mehlinger/Chang) **carried 7–0**, all seven councilmembers voting yes. Flips the "not independently verifiable" caveat above. | [PDF](https://legistar.granicus.com/Sunnyvale/meetings/2026/5/4514_M_City_Council_26-05-19_Meeting_Minutes.pdf) |
| Silicon Valley Voice, 2026-02-24 | 2026 Legislative Platform adoption (2/10/2026 meeting); discussed SB 79 but no specific support/oppose position reported. | https://www.svvoice.com/sunnyvale-establishes-stances-on-state-laws/ |
| San José Spotlight, 2025-11-06 | Mayor Larry Klein on mobile-home-park displacement risk under SB 79. | https://sanjosespotlight.com/state-bill-could-displace-sunnyvale-mobile-home-residents/ |

### Redwood City

| Source | What it gives us | Link |
|---|---|---|
| RWC Pulse, 2026-01-13 | 2026 state legislative platform adoption; no SB 79 position reported. | https://www.rwcpulse.com/city-government/2026/01/13/redwood-city-council-defines-state-level-priorities/ |
| Greater Downtown Area Plan resources | Active long-range planning vehicle; preferred alternative estimated fall 2026, final adoption late 2027 — after SB 79 effective date. | https://rwcgreaterdowntown.com/resources/ |
| San Mateo Daily Journal, 2026-06-18 (updated 6/30) | **Preview, not a record** — reports the Council "will consider directing staff to develop an alternative plan at its **July 13 meeting**." Independently fixes the agenda date ahead of the meeting. Senior Planner **Ellen Yau** on why near-term impact may be limited: developments between the Caltrain station and El Camino Real "already reach 80 feet tall and are between 180 and 215 dwelling units per acre," against SB 79's 160 du/ac within 200 feet. | https://www.smdailyjournal.com/news/local/housing-law-will-have-little-change-for-redwood-city-existing-laws-align-closely-with-goals/article_ed3a153e-fff0-4408-a0ed-75a21a6a544e.html |
| Local News Matters, 2026-07-14 | Recap: Council "voted unanimously Monday" (7/13) to abide by SB 79. Councilmember **Isabella Chu** quoted that cities which historically resisted housing "may be caught flat-footed." No vote tally, motion text, or item number. | https://localnewsmatters.org/2026/07/14/redwood-city-council-embraces-new-state-law-promoting-housing-near-transit/ |
| RWC Pulse, 2026-07-15 | Recap: Council approved the Planning Commission's dual recommendation — adopt SB 79 standards as-is **and** concurrently create a local TOD alternative plan targeted for **spring 2027**. Vice Mayor **Kaia Eakin** quoted. No ordinance number given. | https://www.rwcpulse.com/housing/2026/07/15/redwood-city-adopts-state-transit-housing-standards/ |
| Patch, 2026-07-20 | Recap carrying the fullest motion language of the four: "On a motion by **Gee**, seconded by **Howard**, the council directed staff to allow SB 79's baseline obligations to remain in effect and to prepare an SB 79-compliant transit-oriented development alternative plan in coordination with the Greater Downtown Area Plan and regional policies, with added emphasis on community outreach." Direction to staff, **not** an adopted ordinance. | https://patch.com/california/redwoodcity-woodside/new-state-transit-housing-law-take-effect-around-caltrain-following |

> ⚠️ **The 2026-07-13 Redwood City action is press-sourced only and is NOT independently verified.** All four rows above are leads, not the record. The primary record was checked on 2026-07-28 and is **not headless-reachable**: `redwoodcity.org` 403s (also with a browser UA), the city's **CivicClerk** portal (`redwoodcity.civicclerk.com`) is a JS shell whose OData API 404s, the Legistar web API is not provisioned for the `redwoodcity` client, and `redwoodcity.granicus.com` 404s. **Re-checked 2026-07-29:** `redwoodcity.primegov.com` now answers 200 — but it is a *brand-new* instance, not an archive. `ListArchivedMeetings?year=2026` returns exactly one record, "TEST City Council agenda" dated 2026-07-18, and the only upcoming item is 2026-08-01. The city appears to be migrating to PrimeGov; that will make **future** Redwood City meetings machine-readable, but it does not surface the July 13 record. Do not read the 200 as access to the past. The two recaps also disagree on framing (RWC Pulse: "adopts state standards"; Patch: "directed staff") — a human must read the July 13 agenda/minutes/video before the site asserts what happened.

### San Carlos

| Source | What it gives us | Link |
|---|---|---|
| San Carlos 2026 Strategic Agenda | City Council priorities; no SB 79-specific item. | https://www.cityofsancarlos.org/city_hall/city_council/strategic_plan.php |
| Northeast Area Specific Plan project page | Planning Commission recommended adoption 5/18/2026; tentative council adoption 6/8/2026. Draft does not mention SB 79. (The NEASP adoption ordinances 1636/1637 appear on the **6/22/2026** council agenda, not 6/8.) | https://www.sancarlosnortheastplan.com/ |
| **PrimeGov public API — `cityofsancarlos.primegov.com`** (identified 2026-07-29) | The city **does** run a machine-readable meeting portal; earlier scans treated San Carlos as unsearchable. `…/api/v2/PublicPortal/ListArchivedMeetings?year=2026` returns 61 meetings with `videoUrl` and per-document ids. Agenda **item text** is readable at `…/Portal/Meeting?meetingTemplateId=<templateId of the compileOutputType==3 doc>`; attachment PDFs download from `…/api/compilemeetingattachmenthistory/historyattachment/?historyId=<guid>` (the `Portal/viewer` route is an Accusoft JS shell and is **not** readable — that is what made this look silent). | https://cityofsancarlos.primegov.com/api/v2/PublicPortal/ListArchivedMeetings?year=2026 |
| PTC agenda, 2026-03-02 (item: Resolution PTC2026-01) | Planning & Transportation Commission public hearing on a resolution **recommending the City Council adopt** an ordinance temporarily excluding sites in the MU-DC-100, MU-D-120, MU-SC-120 and RM-100 districts within 0.25 mile of San Carlos Caltrain. Attachments include "03 - Timeline for SB 79 Sites Exclusion". Video: `youtube.com/watch?v=ba3UWWbUp-8`. | https://cityofsancarlos.primegov.com/Portal/Meeting?meetingTemplateId=17276 |
| City Council agenda, 2026-03-23 (Public Hearing item 10.a) | "Consideration of **Introducing** an Ordinance … Temporarily Excluding Sites Within the MU-DC-100 …, MU-D-120 …, MU-SC-120 … and RM-100 … Zoning Districts that are Within 0.25 Miles of the San Carlos Caltrain Station, Pursuant to [SB] 79." Attachments: "Staff Report - SB 79", "Attachment 1 - Ordinance with Exhibits A and B", "Attachment 2 - SB 79 Timeline for Sites Exclusion", "Attachment 3 - Resolution PTC2026-01". Video: `youtube.com/watch?v=yO6lXpAECCE`. | https://cityofsancarlos.primegov.com/Portal/Meeting?meetingTemplateId=17134 |
| City Council agenda, 2026-04-13 (Consent item n) | "**Adopt Ordinance 1634** …" — the second reading, on the consent calendar. The portal tags the item with `data-videolocation="2243"`, i.e. **≈0:37:23** into the meeting video `youtube.com/watch?v=em8JeA887AY` — the timestamp a human should use to verify the vote. | https://cityofsancarlos.primegov.com/Portal/Meeting?meetingTemplateId=17028 |
| Staff report — "Adopt Ordinance 1634 SB 79", 4/13/2026 (PDF, 3 pp., read in full 2026-07-29) | States the mechanism explicitly: "Per Government Code Section 65912.161(b), local jurisdictions may temporarily exclude sites that currently permit density and FAR at no less than 50 percent of Section 65912.157 allowances. Eligible exclusions apply until one year following the adoption of the seventh revision of that jurisdiction's housing element." Confirms first reading 3/23/2026; adds a new **Chapter 18.25A**; "If adopted, Ordinance 1634 would become effective 30 days thereafter, or on **May 13, 2026**." Next steps: "The temporary ordinance will be replaced by a comprehensive SB 79-compliant **Transit-Oriented Development (TOD) Alternative Plan** developed in conjunction with the next housing element update." | [PDF](https://cityofsancarlos.primegov.com/api/compilemeetingattachmenthistory/historyattachment/?historyId=a9e4c376-85ae-42cc-8a4c-e64901b82997) |
| Ordinance No. 1634 text with Exhibits A and B (PDF, 8 pp., read 2026-07-29) | Recitals: "consistent with Government Code Section 65912.161(b)(1)(A), the City desires to amend the San Carlos Municipal Code to temporarily exclude from SB 79 sites that currently permit no less than 50 percent of residential density and FAR standards specified in Government Code Section 65912.157(a)"; "the proposed amendment would not change existing MU-DC-100, MU-D-120, MU-SC-120, or RM-100 development standards." Records the PTC hearing 3/2/2026 and the Council hearing + introduction 3/23/2026. ⚠️ This is the **introduced** version — it carries no adoption vote block. | [PDF](https://cityofsancarlos.primegov.com/api/compilemeetingattachmenthistory/historyattachment/?historyId=fac0590f-7de0-45a8-b9b4-d22178f8f8cc) |
| **Codified SCMC Chapter 18.25A** — "Applicability of Government Code Section 65912.157 (Senate Bill 79)" (Code Publishing, marked "Revised 6/26") | The strongest evidence that 1634 was in fact enacted: the chapter is in the codified municipal code, every section stamped "**(Ord. 1634 § 4 (Exh. A), 2026)**". 18.25A.030 verbatim: "Pursuant to Government Code Section 65912.161(b)(1), the sites identified in Section 18.25A.020 are excluded from the applicability of Government Code Section 65912.157, or successor section, **until one (1) year following the adoption of the seventh revision of the housing element**. The sites identified in Section 18.25A.020 remain subject to applicable local standards, including, but not limited to, General Plan and zoning standards." 18.25A.020 scopes it to sites "(A) zoned MU-DC-100, MU-D-120, MU-SC-120, and RM-100; and (B) located within one-quarter mile of the San Carlos Caltrain Station." | https://www.codepublishing.com/CA/SanCarlos/html/SanCarlos18/SanCarlos1825A.html |

> ⚠️ **The 4/13/2026 adoption vote itself is not yet verified against minutes or video.** The chain above is strong — PTC recommendation (3/2) → Council introduction (3/23) → second reading on consent (4/13) → codified as SCMC Ch. 18.25A crediting "Ord. 1634 … 2026" — but a codifier's history note is not the meeting record. San Carlos posts council minutes only as attachments inside a *later* meeting's agenda packet, and those PDFs sit behind the Accusoft viewer. A human should confirm the consent-calendar motion and vote count at **≈37:23** of `youtube.com/watch?v=em8JeA887AY`. Note also the mechanism distinction this site has to keep straight: San Carlos used §65912.161**(b)** (*exclude* sites that already permit ≥50% of the state standards), **not** the §65912.161(a)-style *reduction* to 50% that Palo Alto and Menlo Park staff proposed. Both are "50 percent," and they are not the same thing.

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
| MTC SB 79 Regional Map | Authoritative half-mile-buffer overlay on city boundaries. **Official as of July 1, 2026** (was preliminary draft). Our independent GTFS tier computation is now a cross-check, not the primary basis — see usage note #2. | https://mtc.ca.gov/planning/land-use/senate-bill-79-regional-map |
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
| 2026-08-03 | California YIMBY (advocacy blog — the bill's sponsor; JSON-LD `datePublished` **2026-08-03T21:41:51+00:00**) | "SB 79, One Month In: Taking Stock of California YIMBY's Signature Bill" — first statewide implementation survey since the July 1 effective date. Indexed facts: by end of July, filings for "at least several hundred new homes across **15 projects in 5 cities** — Palo Alto, San Mateo, Atherton, South Pasadena, and Santa Monica"; **most cities are passing no SB 79 implementing ordinance at all**; historic deferrals in Mountain View and Sunnyvale and fire-hazard deferrals in Glendale described as the common, modest pattern; the §65912.161(b) 50%-capacity deferral characterized as lasting only "until the next RHNA cycle (starting in the early 2030s)." Names **Beverly Hills** (alleged net-zoned-capacity miscount in the first TOD alternative / "Eckhouse" plan), **Burlingame** (capacity stacked on a high school, a park and Caltrain right-of-way), **Oceanside** (expansive "no walking path" exclusions) and **Burbank** (attempting to cancel the BRT project). ⚠️ **Advocacy source — the bill's own sponsor; every characterization here is a lead, not a citation**, and its legal conclusions are contested by construction. ⚠️ Two claims about tracked cities are **not** adopted by this site: (1) it says **Palo Alto** retains SB 79's density-bonus height limitation in its local plan and is thereby "in clear violation of state housing law" — routed to **PR #10**, unverified; (2) it describes **Menlo Park's** May 12 outcome as declining to defer *because downtown zoning already exceeded the 50% threshold*, which is the §65912.161**(b)** *exclusion* rationale (the San Carlos mechanism) and **not** what this site's verified record shows — the Council declined to introduce staff's recommended temporary exemption ordinance and reached consensus on "no action." Do not let this row overwrite the video-and-minutes record. ⚠️ **Does not contain** the "cities under 35,000 / standards stop at a quarter mile" sentence that a search summary attributed to it — zero occurrences of "35,000," "quarter mile," "Belmont," "Millbrae," "San Carlos" or "Redwood City" (see `learnings.md` 2026-08-05). | https://cayimby.org/blog/sb-79-one-month-in-taking-stock-of-california-yimbys-signature-bill/ |
| 2026-07-29 | Palo Alto Online (Riley Cooke) | Housing project with 98 units proposed for Park Boulevard office site — the **first SB 79 filing reported after the July 1–15 window closed**. Seven stories, 98 units (13 low-income), replacing three office buildings at 2151 / 2181 / 2211 Park Blvd., ~733–880 ft from the California Ave Caltrain stop; proposes **2.7:1 FAR** where the local ordinance caps residential FAR at **1.75:1** (SB 79 as written allows 3.5:1). The applicant "requests that the City process the proposed project pursuant to the applicable SB 79 standards in effect as of the preliminary application submittal date" and the application signatures are dated **July 16**; city spokesperson **Meghan Horrigan-Taylor** says it "will be processed through the city's local SB 79 ordinance because it was received after the local restrictions went into effect," the permit portal showing plans uploaded **July 28**. 180 days to file a formal application. ⚠️ Press account — the filing date, the portal upload date, and the city's applicability determination are **not** verified against city permit records; see PR #9. (Article's photo caption says "2181 El Camino Real," inconsistent with the 2181 Park Blvd. address in the body.) | https://www.paloaltoonline.com/housing/2026/07/29/housing-project-with-98-units-proposed-for-park-boulevard-office-site/ |
| 2026-07-23 (updated 2026-07-24) | San José Spotlight (syndicating Riley Cooke / Palo Alto Weekly) | Final housing projects round out Palo Alto's SB 79 window — syndication of the 7/22 PA Online piece, but adds attribution: Planning and Development Director **Jonathan Lait** is the source for "the nine SB 79 projects include **341** homes and approximately 395,310 square feet," and is reported to expect no further full-strength filings. Also splits the nine as **four** near California Ave Caltrain, **five** near downtown, **none** near San Antonio. Relevant to the 384-vs-341 discrepancy flagged on the 7/23 row — a city-staff attribution for 341, but still a press account, not the city's application record. Does not resolve the conflict; see PR #4. | https://sanjosespotlight.com/final-housing-projects-round-out-palo-altos-sb-79-window/ |
| 2026-07-23 | Palo Alto Online | How developers exploited a delay in Palo Alto housing regulations (analysis/recap of the July 1–15 window: agenda-timeline of the deferred hearings, council dynamics; states "Nine project developers… proposing **384** new homes" — ⚠️ conflicts with the 7/22 article's 341-unit total; both are press counts, application list not yet verified against city planning records — see PR #4) | https://www.paloaltoonline.com/housing/2026/07/23/how-developers-exploited-a-delay-in-palo-alto-housing-regulations/ |
| 2026-07-22 | Palo Alto Online | Final 2 housing projects round out Palo Alto's SB 79 window (total now **nine** SB 79 filings, 341 units / ~395,310 sq ft per the article; the last two: "Forest Commons," 69 apts incl. 9 affordable at 332 & 350 Forest Ave. downtown, Vittoria Management + Sares Regis; and 19 units incl. 3 affordable at 2497 High St., 71 ft, near Cal Ave Caltrain. ⚠️ Press count — application list not yet verified against city planning records) | https://www.paloaltoonline.com/housing/2026/07/22/final-2-housing-projects-round-out-palo-altos-sb-79-window/ |
| 2026-07-14 | Palo Alto Online | Downtown North condo proposal is 7th to use new state housing law (340 Palo Alto Ave., 4-story / 48 ft, 6 for-sale condos, Chapman owners / Heather Young Architects; filed in the July 1–15 full-strength window) | https://www.paloaltoonline.com/housing/2026/07/14/downtown-north-condo-proposal-is-7th-to-use-new-state-housing-law/ |
| 2026-07-14 | Palo Alto Daily Post | Seventh project proposed before window for tall building plans close | https://padailypost.com/2026/07/14/seventh-project-proposed-before-window-for-tall-building-plans-close/ |
| n.d. | San José Spotlight | Palo Alto condo proposal is 7th to use new state housing law | https://sanjosespotlight.com/palo-alto-condo-proposal-is-7th-to-use-new-state-housing-law/ |
| 2026-07-10 | Palo Alto Online | Downtown housing proposal becomes the sixth to lean on new state law (135 University Ave, 7-story, Minority Television Project; Tier 1, ¼-mi of PA Caltrain) | https://www.paloaltoonline.com/housing/2026/07/10/downtown-housing-proposal-becomes-the-sixth-to-lean-on-new-state-law/ |
| 2026-07-10 | YIMBY Law (advocacy blog; surfaced 2026-07-20) | "Coalition Victory in Palo Alto — SB 79 units are already on the way." Discloses YIMBY Law sent legal letters to the PA Planning Commission and City Council arguing the urgency ordinances lacked the Gov. Code §65858(c) "current and immediate threat" findings; links the letters. ⚠️ Advocacy framing — says the coalition "convinced the Council to deny" the urgency measures; the video record shows no member ever moved to adopt 23C. Lead for the stakeholder-letters table (letters not yet pulled/verified against the agenda-packet correspondence). | https://www.yimbylaw.org/law-journal/coalition-victory-in-palo-alto-sb-79-units-are-already-on-the-way |
| 2026-07-08 | Palo Alto Online | Palo Alto sees wave of housing projects as state law kicks in | https://www.paloaltoonline.com/housing/2026/07/08/palo-alto-sees-wave-of-housing-projects-as-state-law-kicks-in/ |
| 2026-07-07 | Palo Alto Online | Basket-inspired project on Cal Ave. returns, aided by state law — **414 California Ave.**: five residential stories over ground-floor retail/restaurant, **39 units**, two underground parking levels (75 stalls), **72 ft** at its tallest, invoking SB 79's 75-ft ¼-mile Tier 1 standard. Replaces an earlier **planned home zoning (PHZ)** request for a similar six-story, 37-apartment, 78-ft building. Per the article, the PHZ version drew a **7–0** prescreening rebuke in **September 2025** — then-Mayor Ed Lauing, verbatim: "Your vote tonight is 7-0 that this building needs some work" — with Lythcott-Haims and Lu objecting that all affordable units sat on one floor; under the SB 79 application the low-income count drops **7 → 6** but spreads across the first four residential floors. Architect Zoltan Pali (SPF Architects). ⚠️ Press account — the filing is not verified against city permit records, the Sept 2025 prescreening vote is the article's characterization and not checked against that meeting's record, and whether this project is one of the nine in the 7/22 running count is **not** established here (see PR #4). | https://www.paloaltoonline.com/housing/2026/07/07/basket-inspired-project-on-cal-ave-returns-invokes-new-state-law/ |
| 2026-07-07 | Palo Alto Daily Post | Three developers have taken advantage of two-week gap in housing law | https://padailypost.com/2026/07/07/three-developers-have-taken-advantage-of-two-week-gap-in-housing-law/ |
| 2026-07-02 | Palo Alto Online | Housing advocates don't expect onrush of projects as SB 79 kicks in | https://www.paloaltoonline.com/housing/2026/07/02/housing-advocates-dont-expect-onrush-of-projects-as-sb-79-kicks-in/ |
| 2026-07-02 | Davis Vanguard (statewide) | SB 79 Takes Effect, Opening New Era for Transit-Oriented Housing as Cities Split over Compliance — statewide day-one survey. Useful for one indexed fact: the law "applies immediately in **Alameda, Los Angeles, Sacramento, San Diego, San Francisco, San Mateo and Santa Clara counties**," plus Orange County once the OC Streetcar begins operating (consistent with this site's Santa Clara/San Mateo scope). Carries Wiener's framing ("The era of brazen obstruction of new homes is over") and YIMBY Law's stated intent to monitor implementation and challenge circumvention. ⚠️ Advocacy-heavy sourcing; the 1.5-million-homes figure is the author's/sponsor's estimate, not an agency projection. | https://davisvanguard.org/2026/07/california-housing-law-sb79-2/ |
| 2026-06-16 | Palo Alto Online | Palo Alto nixes 'urgency' measure to limit impact of housing law (June 15 recap; ⚠️ "Burt and Lauing in favor" framing not supported by the video — see the June 15 outcome note above) | https://www.paloaltoonline.com/housing/2026/06/16/palo-alto-nixes-urgency-measure-to-limit-impact-of-housing-law/ |
| 2026-06-15 | Palo Alto Daily Post | Council backs off of rule to block tall buildings near Caltrain (June 15 recap; same ⚠️ vote-framing caveat) | https://padailypost.com/2026/06/15/council-backs-off-of-rule-to-block-tall-buildings-near-caltrain/ |
| 2026-06-02 | Palo Alto Online | Council spars over strategies to limit impact of contentious housing law (June 1 recap; ⚠️ "heads to the PTC on June 10" claim contradicted by the posted PTC agenda) | https://www.paloaltoonline.com/housing/2026/06/02/council-spars-over-strategies-to-limit-impact-of-contentious-housing-law/ |
| 2026-06-02 | Palo Alto Daily Post | Council divided on tall buildings along Cal Ave. (June 1 recap; ⚠️ conflates the PTC permanent-ordinance track with the interim vote) | https://padailypost.com/2026/06/02/council-divided-on-tall-buildings-along-cal-ave/ |
| 2026-04-27 | Palo Alto Online | Palo Alto looks to exemptions, rezoning to limit SB 79 impacts | https://www.paloaltoonline.com/housing/2026/04/27/palo-alto-looks-to-exemptions-rezoning-to-limit-sb-79-impacts/ |
| 2026-04-15 | Palo Alto Online (CalMatters) | Cities scramble to comply with or fight major state housing law | https://www.paloaltoonline.com/calmatters/2026/04/15/cities-scramble-to-comply-with-or-fight-major-state-housing-law/ |
| 2025-11-11 | Palo Alto Online | Palo Alto pauses downtown plan as state housing law upends local rules | https://www.paloaltoonline.com/housing/2025/11/11/palo-alto-pauses-downtown-plan-as-state-housing-law-upends-local-rules/ |
| 2025-10-13 | Palo Alto Online | Housing bill jolts Palo Alto's plans for downtown, San Antonio | https://www.paloaltoonline.com/housing/2025/10/13/housing-bill-jolts-palo-altos-plans-for-downtown-san-antonio/ |
| n.d. | San José Spotlight | Palo Alto looks to rezoning to limit impacts of state bill | https://sanjosespotlight.com/palo-alto-looks-to-rezoning-to-limit-impacts-of-state-bill/ |

### ⚠️ Recurring search hits that are **not** an in-window SB 79 story

The queries this scan runs daily ("Palo Alto SB 79," "SB 79 lawsuit") keep surfacing items
that turn out to be a different statute, a different subject, or a different year. Each below
was **fetched and checked**; recording *why* it fails is cheaper than re-deriving it monthly.
Companion to the ⚠️ Newsom/HCD housing-element block above, which is the same pattern.

| Surfaced as | What it actually is | Link |
|---|---|---|
| "Stanford Terrace Inn owners sue city to halt demolition order" (Palo Alto Online, JSON-LD `datePublished` **2026-08-03T14:06:08+00:00**) — reads as a new Palo Alto housing lawsuit | A **federal selective-enforcement and discrimination suit**, filed **July 16** in what the article calls "the U.S. District Court of Northern California," by owner **Stanford Orion** over the demolition order the City Council approved **April 20** for **531 Stanford Ave.** (College Terrace). The article contains **zero** occurrences of "SB 79" / "Senate Bill 79" / "65912" / "Caltrain." The owners' pending application is **22 three-story homes**; the only housing-policy language in the complaint is its allegation that enforcement was retaliation against the city's "preferred high-density housing agenda." **Not an SB 79 matter** — do not log it as one. | https://www.paloaltoonline.com/land-use/2026/08/03/stanford-terrace-inn-owners-sue-city-to-halt-demolition-order/ |
| "California housing reform faces new test as LA Metro resists transit zoning law" (HousingWire) — surfaced undated in an SB 79 search | Genuine SB 79 coverage, but JSON-LD `datePublished` **2026-01-23** — six months pre-watermark and predating SB 79's July 1 effective date. Rejected on the **fetched** date, not on the snippet, per the 2026-08-02 rule. | https://www.housingwire.com/articles/la-transit-housing-reform/ |
| "Developer threatens city over Sunset project" (Palo Alto Daily Post, byline **2026-08-03 11:32 pm**; sourced to an SF Chronicle story the same day) — a threatened housing lawsuit against **Menlo Park**, a tracked city, days after an AG warning letter | **AB 2011 + Housing Accountability Act, not SB 79.** The article contains **zero** occurrences of "SB 79" / "Senate Bill 79" / "65912." It concerns **80 Willow Road** (the former Sunset HQ): developer **Oisín Heneghan / N17 Development** threatening suit if the city does not approve **665 apartments + hotel + office + preschool in three towers, tallest 461 ft**, leaning on a **July 2026 warning letter from AG Rob Bonta** that the city improperly changed its reasons for rejection. The city's own primary record confirms the statutory frame: its **2026-02-10 "Response to Challenged Conduct Letter"** is captioned **Gov. Code §65589.5(h)(6)(D)(iv)** (Housing Accountability Act) and turns entirely on whether the project qualifies for **AB 2011** streamlining — the letter invokes "**Government Code section 65912.100 et seq. ('AB 2011')**" and §§65912.121–65912.124. **Not an SB 79 matter.** ✅ **Open thread CLOSED 2026-08-05 — the unnamed "new state law" is AB 712 (Gov. Code §65914.2), not SB 79.** The city's **own** 80 Willow project page states it verbatim: "On July 29, 2026, the California Attorney General's ('AG') office sent the City written notice **pursuant to AB 712 (Government Code section 65914.2)** regarding the 80 Willow project. The AG notice states the City has violated **AB 2011 and the Housing Accountability Act** in its processing of the project. AB 712 requires courts to penalize cities that fail to follow state housing laws if the AG warns the city that it violated such laws." That page matches **AB 2011 eighteen times** and **SB 79 / §65912.15 / §65912.16 zero times**; the RWC Pulse recap is the same (AB 2011 ×4, SB 79 ×0). The earlier search-summary guess of the **Permit Streamlining Act** is **refuted** — zero occurrences in either source. Note the section-number trap this makes explicit: **§65914.2 (AB 712), §65912.100 et seq. (AB 2011), §65589.5 (HAA) and §§65912.155–.162 (SB 79) are four different statutes in the same Government Code neighborhood.** ⚠️ Still unread: the AG's 10-page July 29 notice itself. *Route for a human:* request it from the city or the AG's office if the exact allegations ever matter — but nothing in it changes this row's conclusion, which now rests on the city's own characterization. | https://padailypost.com/2026/08/03/developer-threatens-city-over-sunset-project/ · [city 80 Willow project page](https://www.menlopark.gov/80willow) · [RWC Pulse 2026-08-04](https://www.rwcpulse.com/news/2026/08/04/state-backs-controversial-skyscraper-proposal-at-old-sunset-magazine-campus-in-menlo-park/) · [city response letter (PDF)](https://www.menlopark.gov/files/sharedassets/public/v/1/community-development/documents/projects/under-review/80-willow-rd/20260210-challenged-conduct-response-letter.pdf) |
| "New California housing law challenged in court by Los Angeles nonprofit" — surfaced on an *SB 79 lawsuit* query | **Unresolved: checked, inaccessible — no claim made either way.** `news.yahoo.com` 308s to `yahoo.com`, which 308s to SacBee `.../capitol-alert/article254476462.html`; SacBee refuses both `curl` (exit 92, HTTP/2 protocol error) and WebFetch, so neither its date nor the bill number it names has been read. Scoped negative from what *was* read: nothing else in the 08-03 sweep reports a filed court challenge to SB 79, and **YIMBY Law's own law-journal index** carries no such post (latest entries 2026-07-10 and earlier — titles only, posts not opened). **Route for a human:** open the SacBee URL in a real browser once and settle which bill it names. | https://www.sacbee.com/news/politics-government/capitol-alert/article254476462.html |

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
