# Learnings

A running log of mistakes made while building this site and the practices that prevent
them. Newest first. This is an internal process doc — it is excluded from the deployed
site via `.assetsignore`.

---

## 2026-08-13 — Two surfaces that answer a different question than the one asked

### What happened

Two false negatives surfaced in one run, both from the same family as 2026-08-06, -07 and -10, and
both caught only because something *else* forced a second look.

**1. The City Manager news index is JS-rendered.** The scan skill lists "Weekly City Manager Updates"
(`paloalto.gov/News-Articles/City-Manager`) as a Tier 1 source. Fetched with the now-correct plain
`curl` UA it returns **HTTP 200 and 270 KB** — and **zero** article links. All 543 anchors on the page
are nav chrome and language switchers; the article list is injected by JavaScript. So the page grep
for "SB 79" returns nothing, indistinguishable from a genuine absence, on a **200 with a large body**.
Every prior "checked, nothing" on that index was a fact about a JS shell, not about the city's news.

The fix was available the whole time: **`paloalto.gov/sitemap.xml` is 1.1 MB, 200, and enumerates
4,369 URLs — every one with a `<lastmod>`.** It lists **723** City Manager articles, and grepping it
settles the SB 79 question in one fetch: exactly **one** SB 79 news article exists
(`Status-of-the-Citys-Temporary-SB-79-Implementation-Regulations`, `lastmod` 2026-08-04), the one
already indexed. Same fetch surfaced the **332 Forest Avenue project page** (`lastmod` 2026-08-05),
a Tier 1 city surface nothing had ever listed.

**2. Grepping an agenda is not reading its attachments.** The 8/12 run recorded PA doc **21237**
(PTC 8/12 agenda) as "read, zero SB 79." That was true of the agenda *text*. But Item 2 was
**332 Forest Avenue**, whose staff report devotes a section to the SB 79 alternative, and the
meeting's public-comment packet ran **73 pages with 26 SB 79 occurrences**. The agenda text was
clean because agendas carry *item titles*; the SB 79 content lives one level down, in the sixteen
`historyattachment` PDFs the agenda links.

### How to prevent it / what worked

- **A 200 with a big body is not evidence the content was served.** The Akamai lesson (2026-08-12)
  taught that a 403 can be self-inflicted; this is the mirror. Before recording "checked, nothing"
  on an index page, **count what you enumerated** — if a listing page yields zero items of the kind
  it exists to list, the parse failed, whatever the status code was. `grep -c '<a '` returning 543
  while the article-link pattern returns 0 is the tell.
- **Look for a sitemap before scraping a JS index.** It is the cheapest possible change-detector:
  one request, every URL, every `lastmod`. This is now the primary paloalto.gov sweep — it replaces
  grepping the news index, and its `lastmod` field turns "did anything change?" into a sort.
- **Extend the documentList diff one level down.** The 2026-08-10 rule ("a meeting is unchanged only
  when its *document set* is unchanged") worked perfectly here — it caught that meeting 3079's HTML
  agenda had been **re-compiled during the meeting**, doc 21237 → **21239**, `publishDate`
  20:01:17. But the diff points at a *document*, and the run then greps that document's *text*.
  **For an agenda, the unit of reading is the attachment set, not the agenda.** Enumerate the
  `historyattachment` hrefs and grep the PDFs — sixteen fetches, and it is where the record is.
- **Agendas get re-published mid-meeting.** Late correspondence lands hours after the packet posts,
  sometimes while the meeting is underway. A sweep that reads an agenda the morning of a meeting has
  not read that meeting's correspondence; re-check the documentList the next day.
- **The transcriber is not a verification route for long meetings.** Third timeout of this shape:
  a 3 h 34 m video failed in `auto` (full) and in `quick` (60–150 min window), confirming the
  2026-08-11 finding that windows trim the transcript, not the fetch. YouTube captions are also
  unavailable (no `captionTracks` in the watch HTML; InnerTube player 400), and Midpen Media's PTC
  archive is stale since April. **For meetings over ~3 hours, plan on the minutes**, which post onto
  the tracked meeting id — and route the outcome to a PR meanwhile. That is the gate working, not
  failing.
- One more receipt for "a search summary is a lead": queries for this project return an
  "Aug. 11 prescreening" where councilmembers gave "enthusiastic support." That is **August 11,
  2025** — the underlying articles are dated 2025, and the staff report says so. A summary that
  drops the year will drop it into your scan window.

---

## 2026-07-28 — A city with no machine-readable portal is invisible to a portal-driven sweep

### What happened

`neighbors.html` called Redwood City **`silent`** — "no SB 79-specific action on the docket," on a
snapshot stamped "As of May 23, 2026." On **July 13, 2026** the Redwood City City Council took the
question up directly and decided it: unanimously kept SB 79's standards rather than adopt an
off-ramp, and directed staff to prepare a TOD Alternative Plan for spring 2027. Four outlets
covered it (SM Daily Journal preview 6/18, Local News Matters 7/14, RWC Pulse 7/15, Patch 7/20).
The site missed it for **15 days**, across five daily runs.

Every one of those runs "checked" the neighbor cities. The checks were **portal-driven** — PrimeGov
for Palo Alto, the Legistar web API for Sunnyvale and Mountain View. Redwood City has no reachable
portal API: `redwoodcity.org` 403s even with a browser UA, the city runs **CivicClerk**
(`redwoodcity.civicclerk.com`, a JS shell whose OData API 404s), the Legistar client `redwoodcity`
is not provisioned, and `redwoodcity.granicus.com` 404s. So the sweep returned nothing for Redwood
City every day — and **"no API" produced exactly the same output as "nothing happened."**

### How to prevent it / what worked

- **An unreachable source must be recorded as a gap, not as a negative.** This is the standing
  "checked, inaccessible" rule (never speculate about what a 403 would have said) — but the rule was
  only ever applied to *one-off* fetches. Applied to a *recurring* check it has a second half: if a
  city's portal has never been machine-readable, then no run has ever actually checked that city,
  and the run log should say so rather than listing it among the quiet ones. Cities with no working
  API need a **press-first** check, since press is the only surface that reaches them.
- **"Silent" is a standing query, exactly like "pending."** The 2026-07-18 rule ("a *pending* claim
  on the site is a standing query — re-check it every run regardless of the scan window") generalizes
  further than it was written. A `silent` / `no action on the docket` status is a *stronger* claim
  than `pending` — it asserts a negative about the whole world — yet it reads as settled and so
  nobody re-checks it. Every per-city status kicker on `neighbors.html` is a claim with an expiry.
- **A dated snapshot stamp is an admission that the claim expires.** "As of May 23, 2026" sat in the
  Redwood City paragraph the whole time. Same family as the 7/25 past-due-predictions finding, but
  the inverse tense: that grep hunts *future*-dated claims going stale ("becomes official July 1").
  A stamped *past* snapshot rots just as reliably and no grep was looking for it. Cheap addition to
  the daily pass — run **both** spellings, the prose one and the ISO one:

  ```bash
  grep -rniE 'as of (january|february|march|april|may|june|july|august|september|october|november|december) [0-9]{1,2}, 20[0-9]{2}' *.html
  grep -rniE 'as of 20[0-9]{2}-[0-9]{2}-[0-9]{2}' *.html
  ```

  Anything more than ~30 days old is a re-check, not a fact. Run live on 2026-07-28 this returns
  three hits, all on `neighbors.html`, all stamped **May 23, 2026** (~9 weeks stale): the Redwood
  City paragraph (:254, the subject of this entry), the **San Carlos** paragraph (:271 — "no SB 79-specific
  staff report, ordinance, or council action has been posted to the city's PrimeGov portal as of
  May 23, 2026"), and the **scorecard's own header sentence** (:41, "What each neighbor city has done
  as of 2026-05-23" — which stamps the entire table). A July 2026 press check found no San Carlos
  action, so that claim still holds on the merits; the point is that nothing in the pipeline was
  *testing* it. The scorecard header is the highest-leverage of the three, since one stale stamp
  there silently ages all seven city rows at once.
- **The find came from a generic search, not a targeted one.** The query that surfaced it was a
  scattershot `SB 79 ordinance Menlo Park OR "Los Altos" OR "San Carlos" OR "Redwood City" council
  July 2026` — no city-specific hypothesis. Worth keeping one deliberately broad neighbor sweep in
  the pass; the targeted per-city checks are all keyed to surfaces we already know about, which is
  precisely why they can't find a city we've stopped watching.
- **Tier-split held.** The outcome (a council vote) went to PR #7 with the primary record
  unread — `redwoodcity.org` was 403 on the day. The four press links went to `PRIMARY-SOURCES.md`
  as tier-(b) leads (a86ed43) with an explicit ⚠️ row saying the action is *not* independently
  verified. Indexing a lead is safe; asserting the outcome is not.
- **The two recaps disagree, so the branch writes the weaker claim.** RWC Pulse headlines it "adopts
  state transit housing standards"; Patch says the council "directed staff to allow SB 79's baseline
  obligations to remain in effect." Adoption and direction are not the same act, and no source gives
  an ordinance number. Per the 2026-06-03 rule (when two accounts diverge, that divergence *is* the
  signal), the PR states the common denominator — "voted … and directed staff," plus an explicit "no
  ordinance number has surfaced" — and hands the discrepancy to the reviewer rather than picking the
  more authoritative-sounding outlet.
- Useful corroboration trick: the **June 18 preview** independently fixed the meeting date *before*
  the meeting, which is a cleaner date source than the recaps (RWC Pulse's own page renders "Monday,
  July 15" — but July 15, 2026 is a Wednesday). A preview can't establish that something happened,
  but it can establish *when it was scheduled*, which is a different and verifiable claim.

## 2026-07-27 — The page was updated for the event; its opening paragraph wasn't

### What happened

`palo-alto.html`'s "Specific projects in motion" section still opened with "SB 79 doesn't
kick in until July 1, 2026, so there are no SB-79-specific projects yet" — 26 days after
it kicked in, and with nine projects filed. What makes this different from the 2026-07-25
MTC entry is that **the rest of the page had already been corrected**: line 132 described
the July 16 effective date in past tense, and line 149 described the two-week window as
history. The June-15 and July-16 update passes rewrote the substantive paragraphs and
walked right past the intro sentence that framed them.

So this wasn't a sentence nobody revisited. It was a sentence in a section people
*did* revisit, that survived because editing attention goes to the paragraph carrying the
new fact, not to the lede that set up the old one.

### How to prevent it / what worked

- **When an event lands, re-read the section's first sentence, not just the paragraph you
  came to change.** Ledes, section intros, and "here's what's coming" framings are written
  in anticipatory tense by construction, which is exactly the tense that rots. Add the
  intro paragraph to the flip-sweep checklist from 2026-07-23 alongside scorecard rows and
  summary tables.
- **The past-due-predictions grep found it — on its second live run.** Worth noting that
  the 2026-07-25 grep has now caught something on both days it has run (Sunnyvale tense
  7/26, this 7/27). It is the highest-yield check in the daily pass right now.
- **Split the fix at the tier line rather than deferring the whole thing.** The stale
  sentence had two halves: a date-tense error (mechanical, self-verifiable) and "there are
  no projects yet" (an outcome claim whose replacement — nine projects, 384 vs 341 units —
  is exactly what PR #4 is pending on). Deployed the first half and *deleted* the second
  rather than restating a count, so the page now asserts no number at all. A tier-(a)
  entanglement in one clause doesn't have to block the safe correction in the other;
  removing a false claim is safe even when replacing it isn't.
- **Declining to sweep is sometimes the disciplined answer.** The same grep surfaced seven
  more stale "July 1" claims on `neighbors.html`. Not deployed: PRs #5 and #6 already
  rewrite overlapping line ranges, and the Menlo Park (33,785) and San Carlos (29,249)
  "SB 79 applies by default" cells inherit PR #6's unresolved outer-band question — their
  ¼-mile bands are unconditioned but their ¼-to-½-mile bands are not. A partial sweep that
  dodged the PR hunks would have left the page half past-tense and half future-tense,
  which is the exact self-contradiction the 7/23 rule exists to prevent. Recorded as a
  comment on #6 with a suggested merge order instead.
- Near-miss, same shape as the 7/26 §65912.161 slip: that PR comment first quoted Redwood
  City and Mountain View populations (86,684 / 82,376) **from recall**. The real DOF E-1
  figures were on PR #6's own branch — 81,809 and 88,533. Caught and the comment edited,
  but the lesson is that the conclusion being right ("both clear 35,000") is what made the
  wrong digits feel safe to type. Verified numbers live in the repo; go read them.

### Also worth recording: the HCD letters dashboard is a Power BI embed

Five runs have logged HCD's Technical Assistance and Enforcement Letters dashboard as
"JS-only, checked, inaccessible" while trying to verify Atherton's self-reported HCD
substantial-compliance notice. The underlying surface is now identified — the page embeds
`https://app.powerbigov.us/view?r=eyJrIjoiMDQ5YzI3YzQtNzBhYS00NWMwLThlYmQtNWEyMjRkNGI0NGVkIiwidCI6IjJiODI4NjQ2LWIwMzctNGZlNy04NDE1LWU5MzVjZDM0Y2Y5NiJ9`
(grep the page HTML for `<iframe`). Fetching that embed directly returns a 200 with a
~29 KB JS app shell and no letter data, so it is **not** headless-reachable either; it
needs a real browser session or the Power BI query API with a token. Rule: stop
re-probing it in the daily pass. Note also that HCD does publish some enacted SB 79
ordinances as direct PDFs under
`hcd.ca.gov/sites/default/files/docs/planning-and-community/HAU/<city>-sb79-in-<MMDDYY>.pdf`
(San Francisco's is the confirmed example) — a targeted search for that pattern is a
cheaper path than the dashboard.

## 2026-07-26 — We applied the statute's standards without checking the statute's conditions

### What happened

`neighbors.html` said SB 79's half-mile band "spills into" north Los Altos, that affected
parcels "become SB 79–eligible on July 1, 2026," and called the city's silence "the most
concerning quiet on the scorecard." The geometry was right and the conclusion was wrong.
Gov. Code **§65912.157(a)(4)** applies the Tier 1 quarter-to-half-mile floors only "within
a city with a population of at least 35,000"; **(a)(6)** carries the identical condition
for Tier 2. Los Altos is **31,921** (DOF E-1, 2026-01-01). No part of the city is within a
quarter mile of San Antonio Caltrain, and (a)(3)/(a)(5) — the bands with no population
condition — therefore never reach it. Routed to PR #6, not deployed, because whether a
sub-35,000 city's outer band is *entirely* outside SB 79 or inside it as an allowed use at
30 du/ac with local standards intact turns on reading §65912.157(a)'s chapeau against its
standards paragraphs — a city-attorney question, not an unattended-agent one.

This is a different failure from the 2026-07-25 MTC entry. That was a true sentence that
went stale. This one was **never true**: we read the parts of the statute that set numbers
and skipped the clauses that set who the numbers apply to.

### How to prevent it / what worked

- **A statutory standard has an eligibility condition attached. Read both.** We verified
  tier thresholds, height floors, FAR, and the off-ramp mechanics against codified text —
  but the phrase "within a city with a population of at least 35,000" sits in the same
  sentence as the numbers we did quote, and nobody read to the end of it. When quoting a
  standard, quote the *whole* operative sentence, including its qualifiers.
- **Per-jurisdiction pages need a per-jurisdiction eligibility check.** `neighbors.html`
  applies one statute across eight cities. Every such page needs a column for each
  statutory condition that varies by jurisdiction. The threshold check is now recorded in
  `PRIMARY-SOURCES.md`: under 35,000 → Menlo Park 33,785, Los Altos 31,921, San Carlos
  29,249, Atherton 7,086; over → Sunnyvale, Mountain View, Redwood City, Palo Alto.
  **Menlo Park is 1,215 under the line** — re-check it against each new DOF E-1.
- **Low-trust sources earn their keep as leads.** This surfaced from a *realtor blog* in a
  routine press sweep — the kind of source the discipline says never to cite. It was right,
  and it was right about something four months of primary-source work had missed. The rule
  holds (never cite it), but the corollary is worth stating: a low-trust source asserting a
  statutory condition we've never seen before is a cheap, high-value thing to go check.
- **Two surfaces before correcting, as with the MTC entry**: the codified §65912.157 text
  pulled from leginfo *and* ABAG's own SB 79 Summary, whose standards table says verbatim
  "Between ¼ and ½ mile of TOD stop in a city with at least 35,000 residents." Population
  came from the authoritative DOF E-1 spreadsheet, parsed directly — not from the
  population-aggregator site the first search returned.
- **The 2026-07-25 past-due-predictions grep works — keep running it.** Its first live run
  caught `neighbors.html`'s "SB 79 is expected to apply on July 1, 2026" (Sunnyvale), 25
  days stale; deployed as a tier-(b) tense fix (1560106).
- Near-miss worth recording: the first draft of the correction cited **§65912.161**(a)(4)
  — the *off-ramp* statute — instead of §65912.157. Caught on re-read before commit. Same
  root cause as the 2026-05-22 Option C/D entry: two adjacent sections in one chapter, and
  the wrong one is always plausible. Re-read every section number against the text you
  actually fetched.

## 2026-07-23 — A "pending → final" flip must sweep every page that repeats the claim

The 7/22 Sunnyvale minutes flip updated the per-city section header on `neighbors.html`
("carve-out adopted (minutes final)") but missed the scorecard table row 150 lines up,
which still said "(minutes pending)" — the two contradicted each other on the same page
for a day. Rule: when flipping any pending/confirmed claim, `grep -n` the whole repo for
the claim's key phrases ("minutes pending", the ordinance number, the date) and update
every occurrence in the same commit; the scorecard/summary tables are the easy ones to
miss because the flip work naturally focuses on the detailed section.

## 2026-07-22 — build-corpus can time out waiting for OpenAI indexing; the fix is just re-running it

`npm run build-corpus` aborted with "vector store file … did not finish indexing within
2 minutes" on the `site-primary-sources` upload — a transient OpenAI-side indexing delay,
not a content problem. Because the script is idempotent (it diffs hashes and re-uploads
only what changed), the recovery is simply to run it again: the second pass found the
remaining changed file, finished, and reported the full 57-file inventory. Rule for
unattended runs: **one indexing-timeout failure ⇒ retry build-corpus once before declaring
the corpus step failed.** (Postscript: the same-day Sunnyvale scan also validated the
2026-07-19 same-day-special-meeting guard — event 4514's Final minutes were grepped for
Item 1.L / Ord. No. 3253-26 before flipping the pending claim, and the item was there.)

## 2026-07-19 — Legistar "Final" minutes can belong to a same-day *special* meeting, not the one you're tracking

Checking Sunnyvale's still-pending May 19 adoption vote (Ord. No. 3253-26), the Legistar
events API showed **two City Council events on 5/19/2026**: the regular meeting (event 4514,
minutes **Draft**, no file) and an 11 AM budget-workshop special meeting (event 4515, minutes
**Final**, PDF posted). Grabbing "the 5/19 council minutes marked Final" and flipping the
site's "minutes pending" claim would have cited a budget workshop that never mentions the
ordinance. The guard that worked: **open the minutes PDF and grep for the item/ordinance
number before flipping any pending-minutes claim** — a Final status on the right date is not
identity. (Same-day special meetings are common around budget season.) Relatedly, a Legistar
*matter* record showing "Passed" (26-0518 now shows MatterPassedDate 5/19) is a lead, not the
minutes — the adoption vote stays "not independently verifiable" until the regular meeting's
minutes go Final.

## 2026-07-18 — Minutes can post *before* the scan watermark; diff against what the site claims, not just the date window

### What happened (edge case, not a mistake)

The daily-update scan window is "since `last_run`" (2026-07-14), but the June 15 council
minutes had been published **June 18 (draft action) and July 1 (summary)** — before the
watermark — while the site still said "minutes pending." A date-window sweep alone would
have skipped them forever. The finding surfaced only because the run also checked the
*site's own pending claims* against the portal's document list.

### Rules / techniques that worked

- **A "pending" claim on the site is a standing query.** Each run, re-check every claim the
  site flags as pending (minutes, HCD review, designations) regardless of the scan window.
- **PrimeGov document PDFs are directly fetchable**: `ListArchivedMeetings?year=YYYY` gives
  each meeting's `documentList` (with `templateName` like "Action Minutes" and
  `publishDate`); the file itself is at
  `https://cityofpaloalto.primegov.com/Public/CompiledDocument/<doc id>` — **use `curl -L`**
  (without `-L` you get a 494-byte redirect stub that `file` reports as HTML).
- **Minutes have approval states.** June 1 action minutes are *approved* (adopted June 15,
  Item 4, DocuSigned); June 15 minutes are still *drafts*. Cite them accordingly — a draft
  corroborates but isn't the approved record, and per Ordinance No. 5423 the action minutes
  + recording (not summary minutes) are the official record.
- Draft minutes can carry **new outcome detail** the video pass didn't capture (here: the
  23a-b consent vote geometry). New outcome detail from minutes is tier-(a) — PR it for
  human verification against the video; don't auto-deploy it just because the minutes are a
  primary text document.

## 2026-07-14 — Verify the *identity* of a meeting video before you transcribe it

### What happened

Reconciling the June 15 council vote, I asked WebSearch for the meeting video. The top
result was a YouTube link titled **"City Council Meeting - June 15, 2026"** — which I
transcribed. It was a **different city's council meeting entirely** (a "blended
neighborhood" zoning debate; councilmembers named Loz, Elliott, McKenna, Travillian —
none of them Palo Alto's; zero hits on "SB 79," "Palo Alto," or any Palo Alto member).
A whole transcription cycle wasted before the identity check caught it. The correct
video (`GMwh6c4IIZc`) was sitting in the PrimeGov Item 23 agenda page's embedded
`videoUrl` field the entire time.

Separately, the two press recaps of June 15 got the **headline** right (the 50% urgency
measure failed; historic exemption in force; a two-week gap) but the **vote geometry**
wrong: both said "3–2, Burt and Lauing in favor." The video showed no one ever moved to
adopt the 50% urgency ordinance — it died for lack of the four votes an urgency
ordinance requires (Reckdahl & Lu recused), and the recorded votes were on a substitute
"do not proceed" motion (5–0) and a staff-direction motion (4–1, Burt the lone no). The
May 4 / June 1 lesson held: **the video is the record; the press is a lead.**

### How to prevent it / what worked

- **Get meeting-video IDs from the primary portal, not a web search.** The PrimeGov
  meeting page for the agenda item embeds the canonical `videoUrl` (grep the page HTML
  for `videoUrl`, or the ListUpcomingMeetings API returns it). A search-result title is
  an assertion, not a verified identity.
- **Identity-check every transcript before extracting.** Cheap first pass: grep the
  transcript for the jurisdiction name, the agenda-item number, and the known
  councilmember surnames. Zero hits ⇒ wrong source; stop. (Auto-transcripts mangle
  names phonetically — "Burt→Bert," "Veenker→Vinker," "Reckdahl→Rectal" — so search a
  few spellings, but a *real* Palo Alto meeting still lights up "Palo Alto"/"SB 79.")
- **Press vote-counts are leads too, not just press decisions.** A named roll call in a
  recap still needs the video. Here the outlets simplified "the measure failed" into a
  clean 3–2 that the record doesn't support.

## 2026-06-10 — Plain-language rework: glossary tooltips need a single canonical string

### What happened (practice, not a mistake)

Reworked the site for everyday readers: nav cut to Palo Alto / Council watch / FAQ,
Learn's essentials folded into the home page (learn.html stays as the off-nav deep
dive), Council watch reordered to lead with "what happens next," and jargon moved
behind dotted-underline `a.term` links that show a hover definition (`data-def`
attribute, pure-CSS popover) and click through to `glossary.html#anchor`.

### The drift hazard and the guard

The same definition now lives in two places: the glossary entry's
`.gloss-one-liner` and every `data-def` attribute that references it. Rule: **the
glossary one-liner is canonical — copy it verbatim into `data-def`.** Drift check
(run before any deploy that touches terms):

```bash
grep -oh 'data-def="[^"]*"' *.html | sort | uniq -c   # same term ⇒ identical string
```

Also: tooltip only the first occurrence per page; popovers are hidden under
`(hover: none)` so phone taps go straight to the glossary (no flash); anchor
integrity for `glossary.html#…`, `faq.html#q-*`, and `council-watch.html#sb79`
is grep-checked since cross-page links depend on those ids surviving rewrites.

---

## 2026-05-27 — Forgot to bump the CSS cache-bust query string

### What happened

Deployed the chat-widget CSS additions, but `council-watch.html` still linked
`assets/css/site.css?v=2026-05-07` — the same querystring as before the change.
Browser (and the CDN edge) treated it as the same resource and served the
cached pre-widget version. Result: the floating button rendered as a default
`<button>` (inline-block, no fixed positioning, no padding, lost in the page).

### Why I didn't catch it

`wrangler deploy` reported "3 new or modified static assets uploaded" including
`assets/css/site.css`, which made me assume the new CSS was being served. It
was — under that URL with no querystring — but the HTML's `<link>` element
still referenced the stale query string, and that's the URL the browser
actually requests. The cache-bust string in the HTML is the source of truth
for which CSS *version* clients fetch, not the deploy.

### Rule

When changing CSS that's referenced via a cache-bust query string, bump that
query string in **every** HTML file that imports it. A quick grep before
deploy:

```bash
grep -rn 'site\.css?v=' *.html
```

`site.js` has the same pattern — same rule applies.

---

## 2026-05-26 — Chose OpenAI File Search over BAML for the council-watch chat widget

### Context

Adding an "Ask AI about SB 79" experiment on `council-watch.html`. Goals: grounded
answers from a curated corpus, per-turn intent classification logged to D1 for content
ideation, easy-to-edit prompts.

### What changed mid-plan

The first plan called for BAML so prompts would live in `.baml` files separate from
code. Halfway through, switched to the OpenAI SDK directly + File Search (vector store
via the Responses API) because:

- **File Search is the actual feature we want** — it pairs the model with a curated
  vector store and returns `file_citation` annotations against the output. BAML mostly
  abstracts prompts, not retrieval tools; combining it with file_search adds plumbing
  without buying much.
- **Prompts can still be easy to edit** without BAML — a single `src/prompts.ts`
  exports the system prompt and JSON schema as plain strings/objects. One file, no
  codegen step.
- **Less moving machinery** — no `baml-cli generate`, no generated `baml_client/`
  directory. The "no build step" promise for the HTML/CSS authoring side stays intact;
  only the TS Worker compiles (via wrangler/esbuild).

### Worth knowing for next time

- The Responses API supports `tools: [{ type: "file_search", vector_store_ids: [...] }]`
  **and** `text.format: { type: "json_schema", strict: true }` in the same call. You get
  the structured output you asked for, with `file_citation` annotations attached to the
  raw output text. Two birds, one call. Use the annotations (plus `cited_source_ids`
  from the structured field, as a fallback) to map back to your source manifest.
- Reproducibility of the corpus matters more than convenience. The pipeline writes every
  fetched URL into `sources/<id>.md` with frontmatter (`source_url`, `fetched_at`) and
  commits it to git, so a re-index is deterministic and PRs show exactly what content
  the AI is being grounded on.
- D1 is the right home for chat logs even though traffic will start tiny — per-turn
  intent classification produces structured rows we can later mine with plain SQL
  (`SELECT intent_category, COUNT(*) FROM chat_messages GROUP BY ...`). R2/JSONL would
  have been simpler but painful to query.

---

## 2026-05-22 — Conflated SB 79's fast 50% ordinance with the multi-year alternative plan

### What we got wrong

`council-watch.html` and `may-4-decision.html` described **Option C** ("rezone the transit
parcels to 50% of SB 79") as:

- "a multi-year project,"
- something that needs "state housing-department sign-off," and
- a path under which "until that whole package is done, the state minimums still apply."

All three were wrong. We repeated the error in conversation before catching it.

### What's actually true

- Option C is a **self-executing city ordinance** under Government Code §65912.161(b)(1)(A).
  Once the city adopts it, SB 79's §65912.157 development standards "shall not apply" to
  the covered parcels.
- It can be adopted **in weeks** via an interim urgency ordinance — not years.
- It needs **no HCD pre-approval**. §65912.160 gives HCD a 14-day pre-adoption notice and
  a 90-day post-adoption review. That is review, not a veto.
- If the ordinance is in force before SB 79's July 1, 2026 effective date, the state's
  full minimums **never apply** to those parcels — there is no interim gap.
- The "multi-year, HCD-approved, SB 79 applies in the interim" description was an accurate
  description of **Option D** (the full TOD Alternative Plan). We attached Option D's
  properties to Option C.

### Root causes

1. **Conflated two similar-sounding options.** Options C and D both reduce to "the city
   writes its own zoning." That surface similarity collapsed a real distinction in
   timeline, approval path, interim effect, and cost.
2. **Reasoned from a preview article, not the statute.** The framing traced back to a
   high-level April 27 news preview. We never opened §65912.161(b) or §65912.160 until
   asked to double-check.
3. **Asymmetric verification.** Some statutory details (the 10% local-historic cap) were
   checked against the law; the Option C timeline and "HCD sign-off" claims were asserted
   from inference and never checked.
4. **Missed a labeling signal.** The staff proposal was explicitly a "temporary" /
   "interim urgency" ordinance. That label means *fast* — it should have triggered a
   check, not an assumption.

### How to prevent it

- [ ] Any claim shaped like "until X happens, Y applies" is a claim about a **statutory
  trigger**. Find and read the operative code section before publishing it.
- [ ] When two options sound similar, write out how they differ on **every axis** —
  timeline, who approves, what applies in the interim, cost — before describing either.
- [ ] Verify against the **codified statute text**, not a bill summary, not a news
  preview, not earlier reasoning, not an AI summary.
- [ ] Treat "temporary," "interim," and "urgency" as signals to check the real timeline,
  never to assume a long one.
- [ ] Apply verification **evenly**: if one cell of a comparison table was statute-checked,
  every cell should be.

---

## 2026-05-07 — Published a "Council decided X" page from a preview article

A preview article described the May 4 council meeting as if SB 79 would be decided that
night. We published a "Council picked X" page before the meeting record was checked; the
item was actually deferred. Lesson: a preview describes what is *planned*, not what
*happened* — wait for the video, minutes, or post-event reporting. Full write-up in
`PRIMARY-SOURCES.md` → "Notes on usage."

---

## 2026-06-03 — Two news outlets disagreed on the June 1 vote; the video settled it

When checking whether the June 1, 2026 council meeting on SB 79 had results, the two
post-event articles **contradicted each other**: Palo Alto Online reported Council
*approved* the B+C package (correct) but said it "heads to the PTC on June 10";
the Daily Post framed it as a 5–0 *deferral* to the PTC for 6–12 months. Each captured
a different half of a two-track outcome. Pulling the meeting video
(`Cczy-CGO8IE`, final ~20 min) reconciled it: the **interim B+C ordinance passed first
reading 5–0** (→ second reading + urgency ordinance June 15), *and separately* Council
sent a **permanent ordinance + focused Cal-Ave upzoning study to the PTC for 6–12 months**.
Reckdahl and Lu recused.

### How to prevent it / what worked

- Post-event press is a *lead*, not the record — even reputable outlets. When two
  accounts diverge on a vote, that divergence is the signal to go to the primary source,
  not to pick the more authoritative-sounding outlet.
- The transcriber tool on the council YouTube video, targeted to the last stretch
  (`start_minutes` near the end where the motion/roll-call happens), is the fastest path
  to the actual motion language and vote — far better than scraping paywalled articles.
- A roll-call ("Burt — yes … motion carries") is the unambiguous record of what passed;
  capture it verbatim.

---

## 2026-06-09 — Editorial claims need the same verification rigor as reporting

### What happened

The first published version of the council-watch editorial on the SB 79 urgency
findings contained two claims that wouldn't survive the site's own discipline if they
appeared in a news item: an **unverified legislative-intent claim** ("a deliberate
nine-month runway for exactly this kind of preparation" — the operative date is fact;
the *purpose* was inference), and an **asserted scope claim** (that water/fire studies
are "standard pieces of the Downtown Housing Plan work" — plausible, never checked, and
the DHP covers only one of the three station areas). A third weakness was rhetorical:
the Redco/156 Cal Ave entitlement-timeline argument was rebuttable in one sentence
("SB 79 projects are ministerial — that's the point of the law"), because the
*intended* argument had drifted in drafting. The intended point — every concrete
project still passes fire/building-code and utility review at the permit stage
regardless of zoning — was both stronger and supported by staff's own on-record words
("grappled in each case," video ~5:55:30).

### How to prevent it / what worked

- **Editorial ≠ exempt.** Opinion gets the same primary-source check as reporting:
  every factual premise inside an argument is a claim to verify. Inference about
  *intent* (legislative, council, staff) must be flagged as inference or replaced with
  the verifiable fact.
- **Run the steelman before publishing.** Ask: what is the one-sentence rebuttal from
  the best-informed critic? If it lands (here: SB 79's ministerial pathway vs. an
  entitlement-timeline argument), restructure before pushing, not after.
- **Check that the argument on the page is the argument you meant.** The Redco point
  was meant to say "project-level review catches water/fire anyway" and drifted into
  "entitlement is slow." Restating the thesis in one sentence before writing prevents
  the drift.
- A fairness self-review pass immediately after publishing caught all three; cost was
  one extra commit. Cheaper than a reader catching it.

---

## 2026-07-25 — A claim written ahead of its own effective date quietly went false

### What happened

The daily scan found that seven places on the site asserted MTC's SB 79 Regional Map
"becomes official July 1, 2026" / "became final July 1, 2026" / "Official as of July 1,
2026." As of 2026-07-25 both MTC and ABAG still label that map a **preliminary draft** —
ABAG's page says verbatim "MTC has developed a **preliminary draft map** of these TOD
Zones," and MTC's own link to the viewer still carries `?draft=true`. MTC's page was last
updated 2026-07-22, *after* the date in question, so the draft label isn't a stale page.

Nobody wrote a false claim. The wording was authored *before* July 1 as an accurate
statement about the future ("becomes official on…"), and it turned false on its own when
the date arrived and the predicted event didn't happen. No scan step was looking for it,
because the daily pass hunts for **new events**, and this was an **old sentence** going
stale in place. It survived at least three weeks of daily runs.

### How to prevent it / what worked

- **A future-dated claim is a scheduled liability.** When writing "X becomes official on
  DATE," you are committing to re-verify on DATE. Either phrase it as an expectation
  ("MTC has said it expects to finalize by…") or record the date as something to check.
- **The daily scan needs a "past-due predictions" pass**, not just a new-events sweep.
  A cheap version: `grep -rniE '(becomes|will be|will publish|coming|effective) [^.]{0,40}(official|final|mid-2026|20[0-9]{2}-[0-9]{2})' *.html` and look at anything whose
  date is now in the past. Stale future tense ("in mid-2026") is the visible tell.
- **Confirm the negative from two surfaces before correcting.** Here: ABAG's page text
  *and* MTC's `?draft=true` link. The ArcGIS viewer itself is JS-only — checked,
  inaccessible — and the search snippet describing it as a "preliminary draft view" was
  treated as a lead, not a citation, per the standing rule.
- **This is tier-(a), not a safe fact.** It reverses a published claim about a map's legal
  status; whether MTC adopted the map without relabeling it, and whether the statutory
  rebuttable presumption attaches to a *published* or an *adopted* map, both need a primary
  record. Routed to PR #5 with those as the merge checklist rather than auto-deployed.
- Swept all seven occurrences in one branch per the 2026-07-23 flip-sweep rule.

---

## 2026-07-29 — A JS viewer made a full docket look like an empty one

### What happened

`neighbors.html` called San Carlos **silent**: kicker, heading, scorecard row, summary
paragraph and two takeaway bullets, all resting on one sentence — "No SB 79-specific staff
report, ordinance, or council action has been posted to the city's PrimeGov portal as of
May 23, 2026."

San Carlos had adopted **Ordinance 1634** on April 13, effective May 13 — ten days *before*
that as-of date. It excludes every site zoned MU-DC-100, MU-D-120, MU-SC-120 or RM-100
within a quarter mile of San Carlos Caltrain from §65912.157, under Gov. Code
**§65912.161(b)(1)(A)**, until a year after the seventh-cycle housing element. Planning
Commission recommendation March 2, introduction March 23, second reading April 13. It is
the most complete off-ramp on the scorecard, and we had the city filed under "nothing
happened." Routed to PR #8.

This is *not* the failure mode of the 7/25 and 7/28 entries. Nothing went stale. The claim
was false on the day it was written, and eleven daily runs re-affirmed it.

### The actual cause: a negative that came from the wrong route

PrimeGov's `Portal/viewer?id=<docId>` is an **Accusoft JS shell**. It returns HTTP 200 and
~225 KB of markup containing zero document text — for every document, in every PrimeGov
city, whether or not the document exists. Earlier scans used it, got nothing, and recorded
nothing as *nothing happened*.

The tell was there and got walked past: every document came back at **exactly 224335
bytes**. Identical byte counts across five unrelated agendas is not a docket, it's a
template.

### How to prevent it / what worked

- **A negative is only as good as the route that produced it.** Before writing "nothing on
  the portal," fetch a document you *already know exists* and confirm the route returns its
  text. An unreadable endpoint and an empty docket are the same HTTP 200.
- **Identical response sizes across different documents mean you are reading a shell.**
  Cheap check, worth making reflexive.
- This generalizes 7/28 one step. That entry said a city with no machine-readable portal is
  invisible to a portal-driven sweep. San Carlos *had* the portal. Having an API is not the
  same as reading it — **"we have an API for this city" is not a substitute for "this query
  returns text."**
- **Routes that do work** (now in `sb79-update-scan/SKILL.md`, 6db5bd5): the calendar at
  `/api/v2/PublicPortal/ListArchivedMeetings?year=<yr>`; **agenda item text** at
  `/Portal/Meeting?meetingTemplateId=<templateId of the compileOutputType==3 doc>`; and
  attachment PDFs at
  `/api/compilemeetingattachmenthistory/historyattachment/?historyId=<guid>`. Compiled
  documents (Minutes, Packet) remain unreachable — that limit is real, and it is why the
  April 13 *vote* still went to a PR instead of a deploy.
- **Sweep the whole year, not the window.** The find came from running the SB 79 grep over
  all 61 San Carlos meetings of 2026, not just meetings since the watermark. When a new
  read-route opens up, the correct scan window is *all of it* — the watermark protects
  against re-reading, and a route that never worked has read nothing to re-read.
- **Probe laterally when a technique lands.** The same subdomain probe turned up
  `atherton.primegov.com` (five runs had logged Atherton as "checked, inaccessible") and
  `redwoodcity.primegov.com` (live, but a new instance with a one-record 2026 archive — it
  does *not* surface the July 13 record PR #7 is pending on). One probe, three cities.
- **Codified municipal code is the cheap adoption check.** Code Publishing/Municode publish
  only *enacted* ordinances and stamp each section with its number — SCMC Ch. 18.25A carries
  "(Ord. 1634 § 4 (Exh. A), 2026)". Strong corroboration; still not the meeting record, so
  it does not convert an outcome into a safe fact.
- **Distinguishing similar options paid off again.** §65912.161(b) (*exclude* sites already
  permitting ≥50% of the standards) and the "50% off-ramp" this site tracks for Palo Alto
  and Menlo Park (*reduce* the standards to 50%) are both "50 percent" and are opposite in
  what the city gives up. Writing the contrast out explicitly is what made the scorecard row
  and the takeaway bullets correct rather than merely updated.
- **Near-miss:** the first draft of the scorecard cell said San Carlos "pursued the 50%
  off-ramp," which would have put it in the same column as Menlo Park's rejected proposal
  and inverted the meaning. Caught by re-reading the ordinance recitals before committing.

## 2026-07-31 — I typed the hostname from memory and nearly logged a live portal as dead

**What happened (near-miss, caught in-run).** The neighbor sweep probed
`sancarlos.primegov.com`. It returned `HTTP 000`, twice, then `Could not resolve host`. Two
days after the 7/29 entry about San Carlos being wrongly filed under "nothing happened," the
run was one line away from writing "San Carlos PrimeGov — checked, inaccessible" into the log.

The portal was fine. San Carlos's subdomain is **`cityofsancarlos.primegov.com`** — same
`cityof` prefix as Palo Alto's, which is exactly why the shortened form felt right. The
correct host has been sitting in `sb79-update-scan/scripts/check-meetings.sh`'s
`base_url_for_city` table the whole time, alongside a comment saying that table is where
cities get added. I did not read it. Fetched properly, the archive returns 61 meetings,
newest document published 7/23 — pre-watermark, genuinely no change.

### How to prevent it / what worked

- **A recorded route exists so you stop re-deriving it. Read the table, don't recall it.**
  This is a new failure mode in the 7/28 → 7/30 family, and it is the sharpest yet because
  the fix required no discovery at all. 7/28: no route existed. 7/29: the route existed and
  returned a shell. 7/30: a route existed and we never ran it. Today: the route existed, was
  written down, worked — and I ran a *different* address. Guessing a URL that a project file
  already specifies is not a probe, it's a coin flip that happens to be logged as evidence.
- **A DNS failure is not an access failure, and the log must not flatten them.** `HTTP 000` /
  `Could not resolve host` means *this name does not exist* — which is far more often a typo
  than an outage. A 403 or a JS shell says something about the city; a NXDOMAIN says something
  about your string. Cheap discriminator, now reflexive: before recording any host as
  unreachable, `socket.gethostbyname` it and compare the name against the recorded route.
  Here that one check flipped the finding in seconds.
- **What actually caught it was an unrelated source.** The `cityofsancarlos` spelling surfaced
  while grepping `check-meetings.sh` for the *Legistar* client names — not from re-examining
  the failure. Same shape as the 7/30 Accela find, which came out of a press article's
  offhand phrase. Two runs in a row where the correction arrived sideways; worth treating a
  stalled check as a reason to go read the tooling, not only to retry the fetch.
- **The self-check the 7/29 entry asks for would have caught this too, one step earlier.**
  "Fetch a document you already know exists and confirm the route returns its text" — San
  Carlos Ord. 1634 is exactly such a known document, and a route that cannot resolve its host
  fails that test immediately. The rule was written for shells returning 200; it works just as
  well on names returning nothing.

## 2026-07-30 — the record we kept calling unverified was never probed

**What happened.** Every SB 79 project-count claim since 2026-07-14 has carried the caveat
"press count — application list not yet verified against city planning records," and PR #4
has sat open for seven days waiting on exactly that. In eight runs, no run ever checked
whether the city's planning record was reachable. This run probed it: Palo Alto's
**Accela Citizen Access** portal (`aca-prod.accela.com/PALOALTO/`) is live, returns real
markup, and its **General Search is public — no login wall** — with Application Number,
Start/End Date and Street fields. Eight days of "unverified" without one `curl`.

The probe only happened by accident: the 7/29 Palo Alto Online article sourced its
July 28 upload date to "the city's online permit portal," which is what revealed the portal
surfaces filings by date at all.

**But it is not solved.** A naive ASP.NET postback (harvest `__VIEWSTATE` +
`__VIEWSTATEGENERATOR`, POST the `txtGSStartDate`/`txtGSEndDate` pair with `btnNewSearch`)
**302s to `Error.aspx`**. The form needs session/ScriptManager state a flat POST doesn't
carry. So the honest status is **partly open**: reachable and public, not yet queryable
headlessly.

### How to prevent it / what worked

- **"Not verified against X" is a standing query, exactly like "pending" and "silent."**
  7/18 made *pending* a standing query; 7/28 made *silent* one. This adds the third and it
  is the sharpest, because the caveat is **our own wording** — we wrote the unverified note,
  so we already knew the record existed and where it lived. A caveat the site repeats daily
  is a to-do the scan should be re-testing daily, not a disclaimer that ages into furniture.
- **This is 7/29's lesson pointed the other way.** That entry: a negative is only as good as
  the route that produced it. Here there was *no* route — we never produced a negative at
  all, we just kept restating an absence. **Never probing is worse than probing badly**; a
  bad probe at least fails visibly.
- **A 302 to an error page is the ASP.NET twin of the Accusoft shell.** Both return a
  non-error-looking HTTP status carrying zero data. Same reflex as the identical-byte-size
  check: after a postback, confirm the response *contains result rows*, not merely that the
  request completed.
- **When headless fails, hand the human the exact route.** The search form is public, so a
  reviewer can run the July 1–31 date-range query in a browser in under a minute. The portal
  also names `PDSdata@paloalto.gov` for data questions. Both are now on PRs #4 and #9 — an
  unattended run that can't verify something should still shorten the human's path to it.
- **Not recorded as a confirmed route.** `sb79-update-scan/SKILL.md` gets the portal as a
  *candidate* only. The 7/29 lateral-probe win was tempting to repeat here by writing up
  Accela as solved; it isn't, and a skill file claiming a route that 302s would cost a
  future run more than the silence did.

## 2026-08-01 — Twelve runs checked a page's date stamp and never read its links

**What happened.** Every run since 2026-07-18 has logged "HCD SB 79 page — still 06/30" as a
clean negative. The stamp was accurate and the fetch was real. But HCD's SB 79 TOD page links
**four** SB 79 surfaces, and this index carried none of them: the ServiceNow "Housing Law
Request" channel where §65912.160 ordinances and TOD alternative plans are actually filed
(within 60 calendar days of enactment), the **SB 79 Local Enactment Submittal Form** PDF
(server `last-modified` 2026-05-07 — it has been sitting there for three months), HCD's
**guidance for counting SB 79 sites in a housing-element inventory**, and a per-jurisdiction
letter register.

That fourth one made a claim in `PRIMARY-SOURCES.md` false. The Atherton note read: "no HCD
letter or per-city HCD determination list is public as of 2026-07-19 (HCD's SB 79 page last
updated 06/30 **lists none**)." It lists one — **"HCD Technical Assistance and SB 79 Ordinance
Review Letters,"** blurbed "All letters issued are available to the public and organized by
jurisdiction, date and subject." We had asserted an absence about the very page we were
fetching daily.

### The new failure mode: monitoring freshness as a proxy for contents

This is the fifth entry in the route family and it is the one with no broken route at all.
7/28: no route existed. 7/29: the route existed and returned a shell. 7/30: a route existed
and was never run. 7/31: a route was recorded and I ran a different string. Today the route
worked, ran twelve times, returned the real page every time — and the scan only ever read
**one field of it**. A daily check that extracts a single scalar is a *change detector*, not a
*read*. It answers "has this moved?" and gets silently promoted into "I know what this says."

- **A change detector cannot license a claim about contents.** "Still 06/30" supports exactly
  one sentence: the page's stamp has not moved. It does not support "the page lists none." When
  a run wants to assert what a source *contains*, that run has to have parsed the contents —
  not the header.
- **Cheap fix, now part of the pass: enumerate the outbound links of every tier-1/tier-4
  source, and diff the link set against what this index carries.** A link list is small, stable,
  and machine-comparable; it would have caught all four on 7/18. Contrast with the 7/29 rule
  (fetch a document you know exists, confirm text comes back) — that one validates the *route*;
  this validates the *coverage*. Both are needed and they catch different things.
- **The 7/27 near-miss is the same page.** That run identified the Power BI embed behind the
  HAU dashboard and correctly ruled it not headless-reachable — while the Atherton note two
  files away was asserting that no such register existed. The finding and the false claim were
  in the same repository on the same day and nothing connected them, because the dashboard was
  logged under its generic name ("Technical Assistance and Enforcement Letters") and the Atherton
  question was filed under Atherton. **HCD's own SB 79-page link label is what ties them
  together**, and the label lives in exactly the link list nobody read.
- **The correction is narrower than the error, and that matters.** What is true is an *access*
  limit, not an absence: the register is public and organized by jurisdiction, and it is a Power
  BI Gov embed we cannot read headlessly (page H1 is still the generic dashboard title; the
  markup contains no SB 79 text, so only HCD's link label connects it). Atherton's status is
  unchanged and still unverified. Deployed as tier-(b) because every load-bearing fact is a
  `curl` away and nothing about what *happened* moved; the human gets the route — filter the
  dashboard by jurisdiction = Atherton — instead of a flipped claim.
- **Second Accela route, same shell.** `Cap/GlobalSearchResults.aspx?QueryText=` returns HTTP
  200, ~93 KB, zero result rows — the postback from 7/30 was not the problem. Two distinct routes
  have now failed the "does the response contain rows?" test, so it is recorded as human-only and
  taken out of the daily probe rotation. Three shells in this codebase now share one signature:
  Accusoft's 224335 bytes, the Power BI 29 KB app shell, and Accela's 93 KB. **A 200 is not a
  read.**

## 2026-08-02 — The summarizer moved two events into the scan window; neither had moved

**What happened (two near-misses, both caught in-run).** Nothing in the 8/1→8/2 window was real,
but the search layer twice asserted that something was:

1. A search summary said Palo Alto "council members expressed support for projects during
   **prescreening hearings in August**." No August agenda has a prescreening item. The underlying
   Palo Alto Online article says the prescreening hearing was **September 2025** — then-Mayor Ed
   Lauing, verbatim, "Your vote tonight is 7-0 that this building needs some work."
2. A search summary surfaced "Newsom warned 15 jurisdictions to comply with SB 79 within 30 days"
   against an **August 2026** query. The HousingWire article carrying that claim is dated
   **2026-03-26**, and the Governor's release it reports is **2026-03-25** — four months
   pre-watermark.

Either one, taken at face value, would have been written up as a same-day finding.

### The new failure mode: fabricated recency

This is a different animal from 2026-07-14, where a search-result *title* misidentified a
meeting. That was identity drift, and the fix was to get the video id from the portal. Here the
**date** is what drifted, and the date is the one field a window-scanned daily pass cannot
independently sanity-check — because a plausibly-recent date is *exactly* what passes the window
filter. Every other guard in this pipeline (fingerprints, `seen_meeting_ids`, the watermark)
assumes the date attached to a finding came from the source. A summarizer that infers "August"
from an August query defeats all of them at once, and it fails *toward* generating work rather
than toward silence, which is the direction that costs a run its credibility.

- **Read `datePublished` off the article, never off the summary.** Cheap and mechanical: fetch
  the page and pull the JSON-LD (`"datePublished"` / `"dateModified"`). Both catches above came
  from that one field. It is now the first thing to extract from any press hit, before reading a
  word of the body. Note the URL slug and the JSON-LD can legitimately differ by a few hours
  across the UTC boundary (the Cal Ave article is `/2026/07/07/` and
  `2026-07-08T01:07:37+00:00`); that is the same artifact as the PrimeGov UTC caveat, not a
  discrepancy.
- **A date-shaped query invites a date-shaped hallucination.** Both bad summaries appeared under
  queries containing "August 2026." The window belongs in the *filter*, not in the *prompt* — ask
  for the topic, then reject on the fetched date.

### And the subject drifted too: "SB 79" attached to a housing-element action

HousingWire's headline is "Newsom warns cities of lawsuits over **California SB 79 law**." The
two Governor's Office releases it rests on — 3/25 (Notices of Violation to 15 jurisdictions) and
7/16 (AG suits against Calexico, Costa Mesa, Half Moon Bay, Ridgecrest, Turlock) — contain
**zero** occurrences of "SB 79" or "Senate Bill 79." Both are **Housing Element Law**, 6th cycle,
a different statute from §§65912.155–65912.162. The article gets there by splicing Los Angeles's
separate SB 79 density ordinance into a housing-element enforcement story.

- **The "press is a lead" rule usually gets applied to vote geometry. Apply it to the statute,
  too.** 2026-06-03 and 2026-07-14 taught that outlets get *counts* wrong. This one got the
  **law** wrong. Grepping the primary release for the statute's own name is a two-second check
  and it is now part of indexing any enforcement story.
- **This is the 7/26 lesson from the other side.** That entry: we read a statute's standards and
  skipped its eligibility conditions. Here a *source* did the analogous thing — took an
  enforcement action and attached it to the wrong statute entirely. Same cure both times: name
  the section, then confirm the text actually says it.
- **Recorded as a counter-citation, not just an omission.** The index now carries an explicit
  ⚠️ "do not cite for SB 79 enforcement" row with the two gov.ca.gov releases beside it, because
  this headline will keep surfacing on exactly the queries this scan runs every day. Indexing
  *why a plausible source is wrong* is cheaper than re-deriving it monthly — same reasoning as
  the 7/29 note that killed the Accusoft viewer route.
- **The negative was scoped to what was actually read.** The new section says neither release
  names a tracked city and HCD's newsroom index carried no SB 79 item — and says explicitly that
  this does **not** establish the absence of SB 79 enforcement anywhere, because the
  per-jurisdiction register is still the Power BI embed nobody can read headlessly. Direct
  application of yesterday's rule: a change detector cannot license a claim about contents, and
  an unreadable surface cannot license a claim about absence.
- Coverage win from the same thread: **HCD's newsroom** (`/about-hcd/newsroom`) had never been
  enumerated by this pass. It is the HAU enforcement channel. Checked 8/2 — no SB 79 news item —
  and now named in the index so a future run checks a surface rather than rediscovering it.

## 2026-08-03 — A lead I could not read is not a lead I get to dismiss

**What happened.** An SB 79 lawsuit query surfaced "New California housing law challenged in court
by Los Angeles nonprofit." Following it: `news.yahoo.com` → 308 → `yahoo.com` → 308 →
`sacbee.com/news/politics-government/capitol-alert/article254476462.html`, which refuses `curl`
(exit 92, HTTP/2 protocol error) and WebFetch alike. **The article was never read.** A filed court
challenge to SB 79 is a tier-(a) trigger, so this is not a lead the run can shrug off.

### The asymmetry I nearly got backwards

There was an available shortcut: SacBee's article IDs are roughly sequential, `254476462` sits in
their 2021 range, and SB 79 was not introduced until 2025 — so the story is "obviously" about
SB 9/SB 10 and can be dropped. That reasoning is probably *correct* and it is still not a **read**.
It is the same move as inferring contents from a freshness stamp (7/31) or a bill number from a
headline (8/2), just pointed at an ID instead of a date.

- **7/31 established one direction: an unreadable surface cannot license a claim of absence.**
  The mirror image is now on the record — **an unreadable surface cannot license a claim that a
  lead is spurious, either.** Both directions collapse "I could not check" into "I checked," and
  the second one is more tempting because it *reduces* work rather than manufacturing it. Silence
  and a dismissal look identical in a run log; only one of them is honest.
- **So it gets indexed as open, with a route.** The counter-citation table now carries the row with
  the full redirect chain, the exact failure mode, and the human instruction: open the SacBee URL
  in a real browser once and settle which bill it names. Same shape as the Atherton Power BI entry
  — the deliverable for an unreadable source is a route, not a verdict.
- **The negative that *was* earned is narrower.** Nothing else in the sweep reports a filed
  challenge to SB 79, and YIMBY Law's own law-journal index carries no such post (latest 7/10). But
  that is a read of **titles on an index page**, not of the posts, and the index is written to say
  so. One sentence of scope is the difference between a finding and a guess.

### Meanwhile, yesterday's two-second check earned its keep on a different story type

Palo Alto Online published **in-window** (JSON-LD `datePublished` 2026-08-03T14:06:08+00:00)
"Stanford Terrace Inn owners sue city to halt demolition order" — a Palo Alto lawsuit, about a
demolition order, blocking a property owner's housing application, with the complaint literally
alleging retaliation over the city's "preferred high-density housing agenda." Maximally SB-79-shaped.
Grepping the fetched article for the statute's own name returned **zero** occurrences of "SB 79,"
"Senate Bill 79," "65912," or "Caltrain"; it is a federal selective-enforcement and discrimination
suit filed July 16 over the council's April 20 demolition order at 531 Stanford Ave.

- **The 8/2 rule was written for enforcement press ("grep the primary release for the statute's own
  name"). It generalizes to local litigation unchanged, and that is where it will keep paying** —
  a housing-adjacent lawsuit in the tracked city is exactly the finding a daily pass wants to be
  true. Filed as a counter-citation rather than dropped, for the same reason as the HousingWire row:
  it will surface again on tomorrow's queries.

## 2026-08-06 — Two contradictory route claims lived in this repo for five weeks; the wrong one won

**What happened.** Atherton's SB 79 ordinance had been adopted 2026-03-18 and the site said so — sourced to the Town's own marketing surfaces (a Multi-Family Housing page, a "That's A Wrap!" recap blog) and to an administrative draft whose ordinance-number and vote block are **blank**. `PRIMARY-SOURCES.md` recorded the reason the record was unread: *"A 3/18 Minutes document does exist in the portal (doc id 7244) but is not headless-retrievable."* Same for San Carlos: PR #8 has been open since 7/29 with one unresolved item — *"The April 13 vote. This is the one thing not in the record I could read."*

Both were readable the whole time. `GET /Public/CompiledDocument/<document id>` with `curl -L` returns the real PDF. Doc 7244 is 310,853 B of approved March 18 minutes: **Ordinance 678**, consent item 3, motion Lewis / second Lane, **AYES: Lewis, Lane, Widmer, DeGolia, Holland**, no noes/absent/abstain. San Carlos doc 17222 gives Ord. 1634 adopted on consent, **3–0, Rak and Dugan absent**. Two open questions closed in one afternoon by a URL neither city had to publish.

### The new failure mode: a repo that disagreed with itself, and nothing adjudicated it

`learnings.md` **2026-07-18** documented this exact endpoint — "PrimeGov document PDFs are directly fetchable… the file itself is at `https://cityofpaloalto.primegov.com/Public/CompiledDocument/<doc id>` — **use `curl -L`**." It was written for Palo Alto and worked.

`sb79-update-scan/SKILL.md`, written **2026-07-29**, then recorded the opposite as a "Known limit": *"compiled documents … are **not** retrievable … no `CompiledDocument`/`DownloadDocumentFile` endpoint exists. So a city whose minutes are compiled documents (Atherton) still needs a human."*

Both sentences sat in the repo, eleven days apart, naming the same endpoint, one saying it works and one saying it does not exist. **The negative won**, for two reasons worth naming: it was in the *skill file* (operational, read every run) while the positive was in *learnings* (narrative, read as history); and it was scoped as a general PrimeGov fact while the positive was filed under a Palo Alto anecdote. A finding written as "here's how I got this Palo Alto PDF" does not advertise itself as "here is the compiled-document route for every instance."

- **A route learned on one instance is a hypothesis about every instance. Test it laterally the day you learn it.** The 7/29 entry already contains this rule — "probe laterally when a technique lands," which is how `atherton.primegov.com` was found in the first place. It was applied to *hostnames* and not to *endpoints*. One `curl` against Atherton on 7/18 would have saved five weeks and shortened two PRs.
- **The "known limit" was never tested against a document known to exist.** This is the 7/29 rule verbatim — *fetch a document you already know exists and confirm the route returns its text* — and 7/29 is the entry that **introduced the false limit**. It applied its own test to `Portal/viewer` (correctly: an Accusoft shell) and then generalized from "this route fails" to "no route exists," which is a claim about the whole API surface that no test supports. **Ruling out one route is not ruling out the endpoint space.**
- **Grep the repo for contradictions before recording a negative.** Cheap and mechanical, and it would have fired here: `grep -rn "CompiledDocument" .` returns both sentences. Any new "X is not possible" line should be checked against every prior mention of X. Absence claims are the ones worth the extra ten seconds, because they don't fail loudly — they just stop work quietly, and every subsequent run inherits the stop.
- **Six weeks of "needs a human" was the visible symptom and nobody read it as a bug.** `PRIMARY-SOURCES.md` said the vote "is still unread"; PR #8 said it "could not be read"; the skill file said Atherton "still needs a human." Three files agreeing is not corroboration when all three descend from one untested claim. Same shape as 7/30 ("never probing is worse than probing badly") and 8/5's 80 Willow close — where the cheapest primary, `menlopark.gov/80willow`, had never been fetched in three runs. **That is now the fourth entry in a row where the fix was to fetch something obvious rather than to reason harder.**

### What went right

- **Both finds stayed tier-(a).** A vote count from minutes is new outcome detail, so Atherton went to PR #11 and San Carlos went as a comment on the existing PR #8 rather than a competing branch over the same lines (the 7/27 rule). Having a readable primary record does not promote an outcome to a safe fact.
- **The 7/19 same-day-special-meeting guard fired and mattered.** San Carlos held *two* council meetings on 4/13 — a 6:25 PM special (id 2869) and the 7:00 PM regular (2771), each with its own Minutes document. The special's minutes contain zero occurrences of "1634". Grabbing "the 4/13 minutes" without grepping for the ordinance number would have cited the wrong meeting, exactly as the Sunnyvale budget-workshop near-miss predicted.
- **Approval state was checked, not assumed** (7/18 rule). Atherton doc 7244 is confirmed *approved*: the 4/15 minutes carry consent item 2, "APPROVAL OF MINUTES FOR MARCH 18, AND APRIL 1, 2026," and 7244 published 4/16. San Carlos is weaker and the index says so — the 5/26 agenda calendars the approval and 17222 published 5/27, but the 5/26 minutes are themselves unposted, so the approval action is unread.
- **The three-aye count was not written up as a split.** San Carlos shows "AYES: Layton, McDowell, Venkatesh" on a five-member council — which reads like a 3–2 or a recusal until you read the roll call twelve lines earlier: *"City Council Absent: Adam Rak, Vice Mayor; John Dugan, Councilmember."* This codebase has been trained by Reckdahl/Lu to expect recusals; **a short count is a roll-call question first.**
- **A route mistake caught by size, not by error.** Fetching the 5/26 San Carlos packet with the document `id` where route 2 wants the `templateId` returned **147 bytes** — an "Object moved" stub, HTTP 200. Same family as the 224335-byte Accusoft shell and the 19-byte Legistar "Invalid parameters!" body. Checking `ls -l` before parsing is what caught it.

### Also this run: a lawsuit-shaped lead that names no statute

San Carlos's 8/10 special-meeting agenda lists a closed session on **existing litigation — `BP I SPE, LLC v. City of San Carlos`, San Mateo Sup. Ct. 26-CIV-05734**. A 2026 suit against the one tracked city with a §65912.161(b) exclusion is maximally tier-(a)-shaped, and the agenda gives **no subject matter and no statute**. Recorded as an open lead with a route (court lookup refused `curl`; the 8/10 report-out is the cheap path), neither adopted nor dismissed — the 8/3 rule in both directions. Fourth consecutive run where the correct output for a plausible lead was a route rather than a verdict.

## 2026-08-05 — The summary attributed a claim to an article that doesn't contain it

**What happened (near-miss, caught in-run).** A neighbor-sweep search returned California YIMBY's
"SB 79, One Month In" (2026-08-03) among its results, and the search summary asserted: "San Mateo,
Redwood City, Palo Alto, Mountain View, and Sunnyvale clear that bar. Menlo Park, Burlingame, San
Carlos, Belmont, and Millbrae do not, so in those five cities **the new standards stop at a quarter
mile from the station**."

That sentence resolves the exact question **PR #6 has been open on since 2026-07-26** — whether a
sub-35,000 city's ¼-to-½-mile band is entirely outside SB 79 or inside it at 30 du/ac with local
standards intact. The 7/26 entry routed it to a PR precisely because it is a city-attorney question.
Here was a plausible answer, seemingly from the bill's own sponsor.

It is not in the article. Fetched and grepped: **zero** occurrences of "35,000," "quarter mile,"
"Belmont," "Millbrae," "San Carlos," "Redwood City," or "population." The post never discusses the
population threshold at all.

### The new failure mode: fabricated *attribution*

8/2 recorded fabricated **recency** — a summary inventing a date. This is the same machinery pointed
at a different field: the summary blended a claim (probably from the realtor blog in the same result
set — the 7/26 entry's low-trust-lead family) into a list of links, and the claim inherited the
credibility of the most authoritative link in that list. Every guard this pipeline has is keyed to
*which source* a finding came from; fingerprints, counter-citation rows, the "press is a lead" rule
all assume the attribution is real. When the attribution itself is synthetic, a laundered claim
arrives wearing a source it never came from.

- **Attribution is a field to verify, exactly like the date.** 8/2 made `datePublished` the first
  thing to extract from any press hit. This adds the second: before crediting a source with a claim,
  **grep the fetched source for the claim's own distinctive tokens.** Both checks are two seconds and
  both have now caught something on their first real outing.
- **It failed toward closing an open PR, which is the expensive direction.** 8/2's failure generated
  work; this one would have *retired* a deliberately-unresolved question — and PR #6 exists because
  an unattended run should not answer it. A summary that hands you the answer to the one thing you
  wrote down as too hard to answer deserves more suspicion, not less.
- **What made it tempting is that it is probably true.** The 7/26 correction already established the
  35,000 condition from §65912.157(a)(4)/(a)(6) and ABAG's own summary; "standards stop at a quarter
  mile" is a reasonable reading. Same shape as the 8/3 SacBee entry: correct-sounding reasoning is
  still not a read. The claim stays in PR #6 as an open question and is recorded on the source row as
  something the article **does not** say, so tomorrow's run doesn't re-adopt it.

### The gate checks that a file exists, not that the anchor does

Drafting PR #10's timeline entry I wrote `<a class="term" href="glossary.html#density-bonus"
data-def="…">`. There is no `id="density-bonus"` in `glossary.html` — I invented the term. **`lint-gate.sh`
passed it.** Its "local link sanity" step greps `href="…\.html` and checks the *file* exists; the
fragment is never examined. The `data-def` drift check also passed, because drift is defined as one
anchor carrying two strings and this anchor carried exactly one — its own, on the only page using it.
A wholly fictional glossary term is invisible to both checks.

- CLAUDE.md says anchor integrity for `glossary.html#…`, `faq.html#q-*` and `council-watch.html#sb79`
  "is grep-checked." It is — by a human, by hand, in the 2026-06-10 rework. It is **not** in the
  automated gate the daily agent relies on, and the gate is the only thing standing between an
  unattended run and `main`. A rule that lives in prose and not in the gate is a rule the agent
  can pass while breaking.
- Cheap check, and it found the codebase otherwise clean — this branch's was the **only** dangling
  anchor sitewide:

  ```bash
  comm -23 <(grep -ohE 'glossary\.html#[a-z0-9-]+' *.html | sed 's/.*#//' | sort -u) \
           <(grep -oE 'id="[a-z0-9-]+"' glossary.html | sed 's/id="//;s/"//' | sort -u)
  ```

- **Fixed by deletion, not by invention.** The tempting repair was to add a `density-bonus` glossary
  entry, which would have quietly widened a tier-(a) PR into a content addition nobody asked for.
  Removed the term link and explained the phrase inline instead; the PR body flags the glossary entry
  as a *reviewer's* call. Same reflex as the 7/27 split — removing a bad claim is safe even when
  replacing it isn't.

### Also this run: a fourth statute in the same Government Code neighborhood

The 8/4 open thread — the Daily Post said Menlo Park's 80 Willow developer was "citing a **new state
law** that could force a decision" and never named it — is closed, from the city's own project page:
the AG's July 29 notice was sent **pursuant to AB 712 (Gov. Code §65914.2)**, and alleges violations
of **AB 2011 and the Housing Accountability Act**. Still not SB 79 (city page: AB 2011 ×18, SB 79 ×0).
The search summary's "Permit Streamlining Act" guess, correctly recorded on 8/4 as unread rather than
adopted, is **refuted** — zero occurrences in either source.

- The 8/4 entry noted `65912.` is shared by AB 2011 (§65912.100) and SB 79 (§§65912.155–.162). The
  real neighborhood is wider: **§65589.5 (HAA), §65912.100 (AB 2011), §65912.155–.162 (SB 79),
  §65914.2 (AB 712)** — four statutes, one dispute, all in Gov. Code chapter 659xx. Matching on
  `65912.15`/`65912.16` (the 8/4 fix) handles the AB 2011 collision but not AB 712. **Name the bill,
  then confirm the section, then confirm the section is ours.**
- Worth noting *what* closed it: not the press, and not the AG letter (still unread, 10 pp.) — the
  **city's own project page**, which states the statute in one sentence. Three runs treated this as
  needing the SF Chronicle or the developer's letter. The cheapest primary was `menlopark.gov/80willow`
  and no run had fetched it. Sixth entry in the route family, same moral as 7/30: never probing is
  worse than probing badly.

## 2026-08-04 — The statute-name grep has a false *positive*, and it lives inside our own token

**What happened.** The Daily Post published in-window (byline 8/3 11:32 pm) "Developer threatens
city over Sunset project": **Menlo Park** — a tracked city — a developer threatening to sue over
**665 apartments** in towers up to **461 ft**, days after a **warning letter from AG Bonta**. On a
daily pass whose tier-(a) triggers include "a legal challenge was filed," this is about as
SB-79-shaped as a story gets. The 8/2 rule fired correctly: grep the article for the statute's own
name → **zero** "SB 79," "Senate Bill 79," or "65912." Then I went to the city's own record, and
that is where the interesting thing happened.

### The prefix collision

Menlo Park's **2026-02-10 "Response to Challenged Conduct Letter"** for 80 Willow Road matches
**`65912` nineteen times** and SB 79 **zero** times. Every hit is **§65912.100 et seq. — AB 2011**,
the 2022 Affordable Housing and High Road Jobs Act (§§65912.121–65912.124 are its streamlining
provisions); the letter's caption is **Gov. Code §65589.5(h)(6)(D)(iv)**, the Housing Accountability
Act. SB 79 lives at **§§65912.155–65912.162**. Two unrelated statutes, one `65912.` prefix, same
chapter of the Government Code.

- **`65912` is not an SB 79 token, and this codebase has been treating it as one.** It appears as an
  SB-79 marker in the scan greps, in the counter-citation rows written on 8/2 and 8/3 ("zero
  occurrences of … `65912`"), and in this pass's own sweeps. On the sources checked so far it
  happened to be sound — because none of them discussed AB 2011. That is luck, not a method.
  **Match on `65912.15`/`65912.16`, or on the bill's name, and confirm the article.**
- **Every prior entry in this family is a false *negative*; this is the first false *positive*.**
  7/14 a search title misidentified a meeting; 7/31 a shell 200 posed as a read; 8/2 a summary
  invented a date and HousingWire attached the wrong statute to a real action; 8/3 an unreadable
  page tempted a dismissal. All of those make you *miss* or *mis-source* something. This one
  manufactures a finding out of a genuinely-fetched primary document — the grep is honest, the
  document is real, and the answer is still wrong. **A verified quote from a verified source can
  still be about a different law.**
- **It was caught only because the fetch went one layer past the press.** The article alone would
  have been logged tier-(c) on the zero-hit grep and that would have been the right call for the
  wrong reason. Pulling the city's own letter is what surfaced the collision — the same
  "go to the primary record" move that this project keeps relearning, paying off in the direction
  of *precision* rather than *recall* for once.

### The part I did not resolve, on purpose

The Daily Post says Heneghan is now "citing a **new state law** that could force a decision" and
**never names it**. The February letter predates that filing and cannot identify it. A search
summary volunteered "**Permit Streamlining Act**" — which is exactly the move 8/2 caught
HousingWire making, so it is recorded as unread, not as fact. The counter-citation row says the
dispute is AB 2011 + HAA, flags the unnamed law as an open thread, and hands a human the route
(the SF Chronicle piece or the developer's August letter). **Naming the statute you *did* read is
not permission to name the one you didn't.**

### Also this run: an 8/1 recommendation that sat unapplied for three days

The 8/1 log ended "the skill file's stale host should be fixed." Half of it had been — the client
table in `check-meetings.sh` got `sunnyvale -> sunnyvaleca` — but `sb79-update-scan/SKILL.md:157`
still printed `sunnyvale.legistar.com`, which answers **HTTP 200 with a 19-byte "Invalid
parameters!" body**. A 200 with an empty-looking calendar reads as "no meetings," not as "wrong
host," which is the same failure shape as the 7/31 hostname bug and the shell-200 family. Fixed
today. **A recommendation written only into the run log is not a fix; the log is not a queue.**

## 2026-08-07 — The same false negative as yesterday, one day later, on a different agency

Yesterday's entry was about a "not retrievable" claim that was really a claim about one surface.
Today produced the same shape again, and it had been sitting in `PRIMARY-SOURCES.md` for five
weeks with a **Route for a human** attached to it:

> **Route for a human:** open the dashboard in a real browser and filter by jurisdiction =
> Atherton; a letter there would convert the Town's self-report into a state record.

The dashboard finding was **correct**. `hcd.ca.gov/hau/enforcement-letters` is a Power BI Gov
embed, it is not headless-reachable, and re-probing it would have failed again today. What was
wrong was the sentence that followed from it — that *therefore* the letter needed a human.

HCD's written §65912.160(d)(3) findings for Atherton, dated **2026-06-10**, are a two-page PDF at
`athertonca.gov/DocumentCenter/View/12731`. It is linked from the Town's Multi-Family Housing
page — **a page this project fetched on 7/19, 7/29, 8/01 and 8/06** while recording the letter as
unavailable. The letter names the statute, the date, the signer (Housing Accountability Unit
Chief), and — more usefully than expected — *which documents the city actually submitted*.

- **An agency register is one publisher of an agency document; the recipient is another.**
  Two parties hold every letter. Checking one and concluding the document is unreachable is the
  error, and it is not specific to HCD: the same applies to AG notices, LAFCO determinations, and
  any correspondence where a city is the addressee.
- **Grepping a page is not enumerating a page.** The reason four fetches missed it: the Town's
  link label is "**SB 79 - Zoning Ordinance Approved**." The scan greps for `SB 79` and reads the
  last-updated stamp; it never listed the `href`s. A document whose label never says "HCD" cannot
  match a search for HCD. **Enumerate the link set of any city page you fetch — cheap, and it is
  how yesterday's HCD link-set diff was already being run for `hcd.ca.gov` but not for cities.**
- **The estimate was right and that made it worse.** The struck note even predicted the timing
  ("submitted 3/26, 90-day review ≈ late June"). Being able to *predict* a document's existence
  and date is a reason to look harder, not a substitute for finding it.
- **Two of these in two days is a pattern, not a coincidence.** Both were negative claims about
  retrievability, written confidently, scoped too broadly, and inherited by every later run
  without re-test. The generalized rule now lives in `sb79-update-scan/SKILL.md`: *before writing
  down that a state-agency document is unreachable, check whether the subject jurisdiction
  publishes it.* **Negative claims about access need an expiry date; positive ones don't.**

### A tooling trap that would have silently faked a "no SB 79" finding

The Aug 17 council agenda carries an 8-storey, 228-unit project, so its staff report got pulled.
`pdftotext` **is not installed on this Mac Mini** — and the run's first extraction returned
`chars 0` for all three PDFs, with every SB 79 grep dutifully reporting `0`.

Zero characters and zero hits are not the same result, and only one of them is evidence. Had the
0-hit line been read at face value, the run would have logged "staff report checked, no SB 79"
on a document it had never actually read. `pypdf` (installed) extracted 26,998 characters and
confirmed the honest answer: Item 7 is **Builder's Remedy under §65589.5(d)(5)**, zero SB 79.

This is the `ls -l` habit from 7/29 and 8/06 (the 147-byte stub, the 494-byte redirect, the
19-byte Legistar body) moved one layer inward: **check the size of what you extracted, not just
the size of what you downloaded.** A parser that isn't there fails exactly like a document that
says nothing.

### One more: a headline claimed an approval that its own body didn't

An aggregator surfaced as "**Atherton (!) OK's 30-unit townhomes within city limits**." The post
is a block quote of The Almanac saying the town "**could soon see**" the development; its body
has zero occurrences of `approv*`, `OKs`, or `preliminary`. Atherton has approved nothing — the
filing is a preliminary application in early review, and no SB 79 item has reached the Council
since 3/18. Counter-cited rather than left to resurface. **The HAPPENED-vs-PROPOSED rule has to
be applied to headline verbs too, and aggregators are where the verb gets upgraded.**

---

## 2026-08-08 — The index counted to nine, named the sixth and seventh, and never had a first

### What happened

The July 1–15 window is the central factual object on this site: two weeks in which
full-strength SB 79 applied in Palo Alto, and the filings that used it. `PRIMARY-SOURCES.md`
tracks that window closely — nine projects, 341 units per Director Lait, 384 per a different
press count, the discrepancy open on PR #4 for two weeks.

Today's scan found that **the first filing in that window was never indexed at all**. Bayhill
Ventures' proposal to demolish the Coronet Motel at **2455 El Camino Real** — six storeys, 65 ft,
76 units, 12 affordable — was reported by Palo Alto Online **2026-07-06** and independently by the
Daily Post the same day, which dates the application to **July 1, the day the law took effect**.
Three outlets, two independent. `grep -i "coronet\|motel\|2455\|bayhill"` across the entire repo:
**zero hits.** It sat unindexed for **33 days**, across roughly thirty daily runs, while this
project wrote detailed rows about the sixth, the seventh, and the last two.

### Why the scan never caught it

The window is closed. Every daily run scans **since `last_run`**, and a 7/6 article stopped being
in anyone's window on 7/7. The press index was therefore built **forward** from the day the
project started sweeping — and nothing ever swept **backward** to the beginning of the thing it
was indexing. A watermark-driven scan is structurally incapable of finding what predates the
watermark; it will faithfully report "nothing new" forever.

It surfaced today only by accident: a generic `"SB 79" Palo Alto housing August 2026` search
returned the syndicated copy, and the run checked it because a month-old article dressed as
recent is the **fabricated-recency** pattern from 8/2. Checking the date is what exposed it —
the article was correctly judged out-of-window, and then found to be missing from the repo
entirely. **The recency check caught a completeness bug.**

### The checksum that was sitting in the file the whole time

The index contains these rows, in this order:

```
2026-07-10 | Downtown housing proposal becomes the sixth to lean on new state law
2026-07-14 | Downtown North condo proposal is 7th to use new state housing law
2026-07-14 | Seventh project proposed before window for tall building plans close
```

Three rows whose own headlines number the filings — and no row for the first, second, third,
fourth or fifth. The 7/7 Daily Post row indexed here says "**Three** developers have taken
advantage of two-week gap" and was read only as a link, never as a count that the index failed
to match.

**An ordinal in a source you have indexed is a completeness assertion about sources you have
not.** "Sixth" means five exist. A press index that contains an *n*th and no *1st* is
self-evidently incomplete, and the check is free: it is a property of the file, requiring no
fetch, no network, no window.

### What changed

- Three rows added to `PRIMARY-SOURCES.md` (PA Online 7/6 origin, Daily Post 7/6 independent —
  the only account that dates the submission — and the San José Spotlight 7/7 syndication), each
  caveated: the "first" ordinal is the press's and not the city's, the half-mile-vs-quarter-mile
  band disagreement between the two outlets is unresolved, and Accela ACA is still not
  headless-readable so no filing has been confirmed against city permit records.
- Routed to **PR #4** as a comment, not a new branch — #4 owns the timeline hunk this belongs in
  (7/27 rule). The comment says explicitly: **do not write "the first of the nine"** until the
  city's application list is in hand. Naming the first filing does not reconcile the count.
- `sb79-update-scan/SKILL.md` gains the backfill rule below.

### The rule

**A window-scanning skill needs one backward pass over each closed window it claims to track.**
The daily watermark is for *new* activity; it is not a completeness guarantee about a finite past
event, and it silently converts "never looked" into "nothing new." When the site asserts a
bounded set — nine projects, seven parcels, five cities — enumerate that set against the index
**once, deliberately**, from the beginning of the window rather than from the day scanning began.

Filings **2 through 5** are still unindexed. The same search that surfaced this one will likely
surface them; that backfill is now the open item.

## 2026-08-09 — The four missing filings were inside sources the index had already cited

Yesterday's backfill rule worked: one deliberate backward pass over 2026-07-01..07-15 closed the
set of nine Palo Alto window filings. But the *shape* of where they were found is its own lesson,
and it is not the one I expected.

**I assumed the backfill would need new searching.** The 8/8 note said "the same search that
surfaced this one will likely surface them." It didn't take a search. Filings #2–#5 were sitting
in **three articles this index had already cited by URL** — the 7/8 PA Online "wave of housing
projects," the 7/7 Daily Post "Three developers," and the 7/10 "sixth to lean on new state law."
The first two had been in the press table for a month as **title-only rows**: date, outlet,
headline, link, nothing else. The 7/8 piece names all five of the first filings in its second
paragraph and describes three of them in detail. It was linked from `council-watch.html` line 184
the whole time.

### The rule

**An indexed URL is not a read source. A title-only row is a promissory note, not a citation.**
Every other row in that press table carries extracted facts and a ⚠️ caveat; these carried a
headline. The difference was invisible because the table's *shape* is uniform — same four columns,
same link — so a row that had been read and a row that had merely been filed look identical at a
glance. Completeness of the *link list* got silently read as completeness of the *knowledge*.

Concretely, before searching outward for a missing fact, **grep the index for rows with no
extracted content and read those first.** They are the cheapest possible source: already
identified as relevant, already dated, already fetched once. The check is
`awk -F'|' 'NF>3 && length($4)<120' ` over the press table — a short description field on a
substantive story is the tell.

### The second half: a bounded set deserves two independent partitions

The nine reconstructed to **341 units** — exactly Lait's figure, refuting the 384 that one article
carried and that PR #4 has been stuck on since 7/23. That alone would be suggestive. What makes it
convincing is that the *same* nine also partition **4 near California Ave / 5 near downtown / 0 near
San Antonio**, which is exactly the split the 7/23 Spotlight piece separately attributes to Lait.

Two unrelated partitions of one set both landing on independently-reported totals is far stronger
than either alone, and it costs nothing extra — the geography was already in the rows. **When a
bounded set is finally enumerated, look for a second dimension already present in the sources and
check that too.** One matching total can be coincidence or motivated arithmetic; two orthogonal
ones are hard to fake.

### What it still isn't

None of this touched the city's application record — Accela ACA remains not headless-readable, and
nine press accounts agreeing is not nine applications on file. The arithmetic **corroborates**
Lait's number; it does not **verify** the filings. That distinction is the whole tier gate, so the
reconciliation went to PR #4 as a comment and `council-watch.html` on `main` still says "Seven SB 79
projects." The deployed change was the index only.

---

## 2026-08-10 — The watermark dedups on meetings; the record arrives as documents

### What happened

Today's two best findings were both attached to meetings this scan had already marked **seen**, and
both had been sitting there for weeks:

- **Palo Alto PTC, July 8** (meeting 3075, in `seen_meeting_ids` since early July). Its **draft
  summary minutes** (doc **21152**) record staff reporting "approval of **3** SB 79 ordinances" —
  the city's own count of the June 15 outcome, arrived at independently of ours — and a **6–0**
  commission motion that names "the layering of various State laws, **including the State Density
  Bonus Law and SB 79**." The doc id sits between two documents known to have been created on
  **August 5**, so it predates yesterday's run.
- **Atherton PC, July 22** (meeting 539, swept as an agenda on 7/29). Its **packet** (doc **7507**)
  contains the **June 24 draft minutes**, in which the Town Planner announces "a potential SB 79
  application for **110 Glenwood Avenue** … approximately 30 stacked townhome units." That is the
  Town's own record of a filing this index had carried since **July 31 on press alone** — and the
  Town said it **five weeks before the first outlet did**.

### Why the scan couldn't see them

The dedup key is the **meeting id**. Step 4 of the runbook drops "any finding whose … meeting id is
in `seen_meeting_ids` with no change," and in practice "no change" was being evaluated against the
**calendar row**, not against the meeting's `documentList`. But a meeting's documents are not
contemporaneous with the meeting. The agenda exists days *before*; **minutes exist weeks after**,
and the minutes are the record — the one artifact the whole tier gate is built around. A watermark
that dedups on the event permanently hides the artifact that arrives late.

Compounding it, Atherton's minutes weren't even filed under their own meeting: the June 24 minutes
are **inside the July 22 packet**, because that is the meeting where they go for approval. So the
document that mattered was two hops from the id the scan was tracking.

### The rule

**Diff the `documentList`, not the meeting id.** Both PrimeGov endpoints already return, per meeting,
each document's `id`, `templateName` and `compileOutputType`. Store that set per meeting in
`state.json` and re-check it — a meeting is "unchanged" only when its document set is unchanged.
Minutes appearing on a months-old meeting is the highest-value diff this scan can produce, and it is
free: the calendar call is already being made.

And when reading a packet, **read it for the prior meeting's minutes**, not only for its own agenda
items. A packet is a compilation; the approval item near the front of it carries the last meeting's
record.

### The shape, again

This is the fourth cousin of the same family error — 8/06 (compiled documents "unreachable"), 8/07
(HCD letter "needs a browser"), 8/08 (index built forward from the scan start), and now this. Each
time, **a check that was correctly performed on one surface was allowed to stand in for the
question**. Atherton's 2026 agendas really had been swept, and really did contain zero SB 79 items
after 3/18 — that sentence is still true, and it is still in `PRIMARY-SOURCES.md`. It just never
meant what it was being used to mean. An agenda sweep returning zero is a fact about **agenda item
titles**; the packets were never opened. The scope note is now written next to the claim.

### What was deployed

Index only (**32016c4**), plus the corpus refresh. Both minutes documents are **drafts**, and the
Atherton one records a staff *announcement* of a *potential* application — so the site-facing claims
went nowhere: 110 Glenwood to **PR #12** (whose title asks for exactly this record), the Daily Post's
fourth restatement of **nine / 341** to **PR #4**. A city record is a much better source than three
downstream press accounts; it is still not the application.

---

## 2026-08-11 — A source can go stale without going dead, and nothing in this scan was watching for it

### What happened

`PRIMARY-SOURCES.md` had cited the **ABAG SB 79 Summary** since April as
`.../documents/2026-04/SB79-Summary-040826.pdf`. That URL still returns HTTP 200 and a valid
16-page PDF. It is also **no longer the document ABAG publishes**: on **2026-07-17** ABAG issued a
revised summary at a *different* path, `.../documents/2026-07/SB79-Summary-07172026.pdf`, and its
digital-library entry now serves only that one. The April file's own stamp reads "Last updated:
July 1, 2026"; the current one reads July 17.

The revision was not cosmetic. Diffing the two:

- **§65912.161(b)(1) went from one sentence to the full enumeration** — six subparagraphs, (A)
  through (F), with three distinct low-resource / aggregate-capacity pathways inside (B). This site
  had been telling readers on `neighbors.html` that the off-ramp statute has **"two ways in."**
  Reading the codified statute confirmed six. Routed to **PR #13**.
- A **new "Low-Resource Area" definition** (CTCAC/HCD opportunity area maps) — a term with zero
  occurrences anywhere in this repo.
- "Pedestrian access point," flatly "not a defined term" in April, now points at HCD's MPO advisory
  — a memo this index already had.
- The MTC-map sentence was rewritten in the *less* hedged direction on the same day ABAG's webpage
  kept calling the map a "preliminary draft" (noted on PR #5).

### Why nothing caught it

Every detection mechanism this scan has is aimed at **new events**: new meeting ids, new documents
on known meetings (added 8/10), new press by date, new agenda items. A static reference document
that is silently re-issued at a new path generates **no event at all**. Worse, the three checks that
might plausibly have caught it each fail for a different reason:

- A **link check** passes — the old URL still resolves.
- A **watermark scan** has nothing to compare; the document isn't a meeting or an article.
- A **topic grep** of the publisher's page finds "SB 79" in both versions and reports no change.

What actually surfaced it was enumerating the **link list** on a *different* agency's page (MTC's
regional-map page), which led to ABAG's landing page, which named a file whose date didn't match the
one in the index. That is the 2026-08-07 habit — *enumerate the hrefs, don't topic-grep the page* —
paying off a second time, on a source that was already indexed and already read.

### The rule

**An indexed document has two identities: its URL and its version. This project has only ever
tracked the first.** For any static reference document in `PRIMARY-SOURCES.md` — agency summaries,
advisories, sample ordinances, checklists — the URL resolving is not evidence that it is current.

Two cheap checks, neither requiring a fetch of the file:

- **Re-resolve through the publisher's index entry, not the file path.** Digital-library / document-
  center pages carry a *document date*. ABAG's entry says "July 17, 2026" in plain text; the stale
  citation was one page-fetch away from being caught, any day since 7/17.
- **Read the date embedded in the filename as an assertion.** `SB79-Summary-040826.pdf`,
  `Template_SB79EligibilityChecklist07172026.docx`, `sb-79-mpo-advisory.pdf` — publishers who date
  their filenames are telling you the version. A cited filename whose date is months behind the
  publisher's current one is provably stale, and the check is a property of two strings.

Add a periodic **version sweep** over the cross-cutting source table, distinct from the daily
watermark scan, for exactly the reason the 2026-08-08 backfill entry gives: a scan that only looks
forward is structurally blind to a class of staleness, however long it runs.

### The shape, again

Fifth in the family, and the first that is not about reachability. 8/06 (compiled documents
"unreachable"), 8/07 (HCD letter "needs a browser"), 8/08 (index built forward from the scan start),
8/10 (agenda swept, packet never opened) — each was *a check correctly performed on one surface
standing in for the question*. This one is the same move applied to time rather than to surface: the
April PDF **was** read, in full, correctly. The reading was just no longer about the current
document, and nothing in the pipeline distinguished "I read this source" from "I read the version of
this source that is current."

### Operational note — the transcriber does not bound cost by window

The transcriber MCP resolved the San Carlos closed-session question in one call (2.5-hour video,
`start_minutes: 0, end_minutes: 14`). The same call shape **timed out twice** against Palo Alto's
8/10 council video (5+ hours), in both `auto` and `quick` mode, with a 10-minute window. `start_`/
`end_minutes` appear to trim the *transcript*, not the fetch — so window size is not a cost lever on
a long video. Consequence for this skill: video verification of a Palo Alto council outcome is
**not** something an unattended run can rely on, which is the assumption the tier gate was built on
anyway. The 8/10 consent-calendar approval of the June 15 minutes remains unverified for that
reason, and is logged as such rather than assumed.

### What was deployed

Index only (**ffdd8a6**): the current ABAG summary, the new MTC/ABAG eligibility-checklist template
(indexed, **not read** — it is a `.docx` and nothing here characterizes its contents), and ABAG's
RHTA landing page. The claim change went to **PR #13**; the map evidence to **PR #5**; the San Carlos
closed-session negative to **PR #8**.

---

## 2026-08-12 — Spoofing a browser is what got us blocked. The workaround was the bug.

`PRIMARY-SOURCES.md` and `sb79-update-scan/SKILL.md` both carried the same advice, for weeks:
paloalto.gov "often 403s to bot-style fetches — if you need the content, try with a browser-like
User-Agent." It is the standard trick and it sounds right. **It is exactly backwards for this
domain, and following it is what produced the 403s.**

Measured today against the same URL, four paths, stable over repeats:

| User-Agent sent | Result |
|---|---|
| `curl/8.x` (curl's own default) | **200** |
| `Wget/1.21.4` | **200** |
| Chrome / Safari / Firefox UA | 403 |
| bare `Mozilla/5.0` | 403 |
| Googlebot | 403 |
| *(User-Agent suppressed entirely)* | 403 |

Akamai here is not blocking automation — it is blocking **browser impersonation**. An honest CLI
user-agent passes; a client claiming to be Chrome while presenting none of a browser's other
characteristics is a *stronger* bot signal than curl admitting what it is. `/robots.txt` itself 403s
under a Chrome UA and returns 200 under curl's. `WebFetch` 403s and has no knob to fix it.

### What it cost

Palo Alto published **"Status of the City's Temporary SB 79 Implementation Regulations"** on
**2026-08-04** — the city's own authoritative account of what the June 15 ordinances require, with a
nine-row table of the window pre-applications. A Tier 1 primary source, squarely this site's subject.

It sat unread for **eight days**. Yesterday's run found the URL, tried it "with and without a browser
UA," got 403, and correctly logged it as an open lead needing a human with a browser. The discipline
worked — nothing was invented, a search-summary paraphrase was explicitly refused. But the lead was
unnecessary. The document was one `curl -sL` away the whole time, and had been since the day it
published.

It also confirmed, independently, all three interim floor-area numbers this site had been asserting
from the June 15 record alone — and supplied the city record PR #4 had been waiting on since 7/23.

### The shape

Sixth in the family (8/06, 8/07, 8/08, 8/10, 8/11), and a new variant. The others were *a check
correctly performed on one surface standing in for the question*. This one is **a remedy that was
never checked against the failure it claimed to fix.** Nobody ever tested whether the browser-UA
trick helped here; it was written down because it is generally true, and then it hardened into a
project fact and got repeated across two files. A wrong workaround is worse than no workaround: it
converts a reachable source into a documented dead end, and the documentation makes future runs stop
trying.

### How to apply

- **When a fetch fails, vary one thing at a time and record the actual matrix** — don't apply a
  remembered fix and conclude from its failure. "403 with and without a browser UA" was written
  yesterday; the distinguishing case (curl's *own* UA, which is neither) was never tried.
- **Distrust inherited workarounds that no entry here ever verified.** A tip repeated in two files is
  not corroboration if both copies came from the same untested assumption.
- **A 403 is a claim about a request, not about a document.** Same lesson as 8/06 (the Accusoft
  shell) and 8/07 (the Power BI embed), one layer down: there, the wrong *surface*; here, the wrong
  *headers* on the right surface.
- **Re-open the paloalto.gov dead ends.** Every "checked, inaccessible" note against this domain was
  probably taken under the bad UA and deserves one plain-curl retry. Note the exception: the **Accela
  permit portal** is a genuinely different failure (session/postback state, two routes tried) and is
  *not* explained by this — don't let one correction trigger blanket optimism.

### What was deployed

Index only (**5c25bee**): the 8/04 city status statement, the Current Planning page hosting the new
SB 79 zoning map, and the corrected fetch rule. The site-facing content — the interim setback and
step-down standards, and the city's "pre-application" framing of the window filings — went to
**PR #14**; the nine-project reconciliation to **PR #4**, which it resolves but does not merge.

---

## 2026-08-14 — The documentList diff watches for arrivals. The link broke on a departure.

Today's scan worked exactly as designed and still shipped a dead link to production, because the
diff it runs is one-directional.

Palo Alto meeting **2840** (June 15 — the load-bearing SB 79 meeting) gained doc **21272**, the
council-approved **Action Minutes**. The 2026-08-10 rule fired correctly and the run caught it. But
the same publish also **removed** doc **20981**, the *draft* action minutes the site had cited since
July 18 — in two places in `PRIMARY-SOURCES.md` and in **two places on `june-15-decision.html`, a
deployed page**. PrimeGov swaps the draft for the approved document under the same template; the
draft does not survive.

The diff never saw it. The implementation asks only `[d for d in docs if d not in prev]` — what
arrived. Meeting 2840's stored set was `[20949, 20951, 20955, 20981, 21023]` and its live set is
`[20949, 20951, 20955, 21023, 21272]`. One addition, one deletion, and only the addition was
reportable.

**And the departure is invisible to every cheap check.** `https://…/Public/CompiledDocument/20981`
does not 404. It redirects to `/Public/PublishedDocumentError` and serves a 1,101-byte "Document Not
Found" page **at HTTP 200**. A status-code check passes. `lint-gate.sh` passes too — its link check
validates *local* `.html` targets and never touches external URLs. The only thing that catches this
is asking whether the bytes are the document.

This is the third member of a family now: **2026-08-12** (Akamai 403 on the right URL with the wrong
UA), **2026-08-13** (a 200 with 270 KB and zero article links), and this one. Each time the failure
was a healthy-looking response standing in for a document. The new wrinkle is the direction of
travel: the previous two were sources we could never read; this was a source we **had** read,
verified, and cited — and it expired underneath a citation that still looked fine.

### What changes

- **Diff the document set both ways.** A removal is a signal, not noise, and it is usually the more
  urgent one: an addition means new material to read, a removal means an existing citation just
  died. `scripts/` state now records removals; the scan skill's "Diff the `documentList`" section
  says so explicitly.
- **A draft→approved flip is a link-rot event, not just a status change.** When minutes are
  approved, assume the draft URL is gone and grep the repo for it before updating anything else.
  The status flip and the link fix are the same task.
- **`lint-gate.sh` does not check external links** and should not be trusted to. Its local-link pass
  reads as broader than it is — the same over-reading recorded on 2026-08-13 about anchors.

### The near-miss worth naming

A search summary offered the YIMBY Law press release *"…Sue San Francisco for Violating State
Housing Law with Family Zoning Plan"* as the primary source for today's SB 79 suit. It is dated
**2026-02-12**, concerns the Family Zoning Plan, and greps **zero** "SB 79" — same plaintiffs, same
defendant, different case. Fetched and rejected rather than cited. This is the 2026-08-05 and
2026-08-11 failure mode again, and the defense was the same each time: open the thing before
quoting it.

### What was deployed

**0edbe68** — the approved-minutes status flip and the dead-link repair on `june-15-decision.html`
and `PRIMARY-SOURCES.md`; **abb536f** — the corpus re-index. The June 15 votes themselves did not
change: the approved minutes reproduce the draft's sentences verbatim (23a–b **4-1-2**, 23C "not
proceed" **5-0-2**, staff direction **4-1-2** Burt no), which is why this was a tier-(b) confirmation
rather than a correction. The first filed **SB 79 lawsuit** (housing groups v. San Francisco *and*
HCD) went to **PR #16** — an outcome, and press-derived until someone pulls the docket.

**Same-day addendum.** Turning the two-way diff on immediately flagged **three** removals, and
**two were false alarms** — a useful calibration on a rule written an hour earlier. Meeting 3079 lost
doc **21237** and meeting 2839 lost doc **20943**. Only `20943` (June 8's *draft* Action Minutes,
`compileOutputType == 1`, replaced by approved doc `21271`) was real rot, and nothing cited it.
`21237` was an **HTML Agenda** (type 3) superseded by `21239` in the mid-meeting recompile already
recorded on 8/13; type-3 documents are addressed by `templateId`, their ids churn normally, and
`/Public/CompiledDocument/<id>` never served them — it returns the *same* 1,101-byte error page for
the current, live HTML agenda `21239`. **Filter removals to `compileOutputType == 1` before
alarming.** The error page that made the real problem visible is also perfectly happy to
manufacture two fake ones.

---

## 2026-08-15 — Yesterday's correction became today's untested inheritance

### What happened

The 2026-08-12 entry is one of the sharpest in this file: paloalto.gov blocks *browser
impersonation*, an honest `curl/8.x` UA gets 200, and the remembered "try a browser-like
User-Agent" trick was the bug. It cost eight days on a Tier 1 source. The correction was written
into `learnings.md`, into `sb79-update-scan/SKILL.md` **and** into `PRIMARY-SOURCES.md`.

Today a Holland & Knight SB 79 implementation tracker surfaced. Plain `curl -sL`: **403**, a
4,548-byte block page. Under the fresh rule that is a clean, well-founded negative — honest CLI UA
is what this project sends now, and it failed. The article would have gone into the log as
inaccessible.

It is a Chrome-UA-only domain. Measured, one variable at a time:

| Domain | `curl/8.x` own UA | `Wget/1.21.4` | Chrome UA |
|---|---|---|---|
| `paloalto.gov` | **200** | **200** | 403 |
| `hklaw.com` | 403 (4,548 B) | 403 | **200** (64 KB) |
| `padailypost.com` | 406 (300 B) | — | **200** (348 KB) |
| `mountainview.gov` | 403 (426 B) | 403 (426 B) | 403 (426 B) |

Four domains, three different answers. Note `padailypost.com` — an outlet this pass sweeps
**daily** — has been 406ing under the post-8/12 default, and a 406 with a 300-byte body reads like
a dead site rather than a rejected header.

### The failure mode: a correction generalizes exactly as badly as the error did

The 8/12 entry says "distrust inherited workarounds that no entry here ever verified" and "vary one
thing at a time and record the actual matrix." Both were aimed at the *old* advice. Neither was
applied to the *new* advice, which was written down in three files within an hour of being measured
— on **one domain**. It had every property the entry warned about: repeated across files, true where
it was tested, never re-tested anywhere else.

This is the same shape as 2026-08-06, where a route learned on Palo Alto's PrimeGov was recorded as
a general limit on every PrimeGov instance. The difference is the direction of travel: there a
**negative** over-generalized, here a **positive** did, and a positive is harder to catch because it
keeps working on the domain you keep checking. **A fix measured on one host is a fact about that
host.** The deliverable for a fetch problem is a matrix, not a default.

- The one honest negative in the table is `mountainview.gov`, which refuses all three. That is
  **checked, inaccessible** — and it matters that it is now distinguishable from the other three
  rather than sharing a log line with them. Legistar is the working route for that city.
- **Try both UAs before recording any domain as unreachable**, and write down which one worked. Two
  requests. Recorded in `sb79-update-scan/SKILL.md` as a table rather than as a rule, because a rule
  is what got over-generalized twice now.

### The other half: the attachment rule was never carried across to Legistar

`sb79-update-scan/SKILL.md` has said since 8/13 that an agenda's SB 79 content "is almost never in
the agenda text" — agendas carry item *titles*, the substance is in the linked PDFs. That section is
written entirely in PrimeGov vocabulary (`historyattachment`, `compileOutputType`), and the neighbor
cities on Legistar were being swept by grepping `EventAgendaFile` and stopping there.

Today's find is the demonstration. Mountain View's **EPC 8/19 agenda** greps **2** "SB 79." Behind
it: a 24-page staff report (19 hits), a draft zoning-map amendment ordinance (27 hits) and a
29-page draft historic-preservation ordinance — carrying the whole of Mountain View's
**§65912.161(b)(1)(F)** historic exclusion, 24 properties, its 2031 expiry, and a historic-*district*
process staff say was drafted so Council can pursue a **permanent** SB 79 exemption. The agenda line
alone would have supported a one-line log entry and nothing on the site.

The route is symmetrical to PrimeGov's and was already available:
`/v1/<client>/events/<id>/eventitems?Attachments=1` returns each item's
`MatterAttachmentHyperlink`. Now in the skill file. **When a reading rule is written in one
portal's nouns, ask what its equivalent is in the other portal before assuming the rule doesn't
apply there.**

### Three smaller ones, all from opening the thing

- **A staff report's cross-reference is not a citation.** The report points at "Section
  **36.55.75.c** in Attachment 2" for the SB 79 exclusion language. Opening ATT 2: it is
  **36.55.75.a**; (c) is the state/national-eligible single-family-and-duplex provision. The
  pointer was written by the same author as the document it points into and it was still wrong.
  Same two-second habit as grepping a source for a claim's own tokens (2026-08-05) — follow the
  cross-reference into the attachment rather than quoting the pointer.
- **The 2026-08-09 thin-row check was scoped to the table where the problem was found.** That entry
  gave a real check — `awk -F'|' 'NF>3 && length($4)<120'` over the press table — for rows that are
  a headline and a link rather than a read source. `PRIMARY-SOURCES.md` → **Legal / policy analysis**
  is *five consecutive bare URLs* with no extracted content at all, and has been since the file was
  created; **Data sources** is another four. Today's H&K alert (2026-06-16) is the first entry in
  that section anyone has read, and it turned out to carry the only account this project has of
  HCD's actual §65912.160 determinations — **Beverly Hills' TOD alternative plan rejected 2026-05-08,
  San Jose's exclusion ordinance approved 2026-06-04** — while five weeks of runs recorded HCD
  determinations as unobtainable behind the Power BI register. **A check invented for one table is
  worth running over every table in the file.**
- **A city attorney's ordinance is a cheap second source on the statute.** ATT 3's recitals cite
  §65912.161(b)(**1**)(**F**) by subparagraph, which independently corroborates PR #13's finding
  that (b)(1) enumerates (A)–(F) — a correction this project made from the codified text on 8/11 and
  had no outside confirmation of. Drafting attorneys cite to the subparagraph because they have to;
  press and summaries never do.

### What was deployed vs. PR'd

**Index only.** `b15ac72` (the four Mountain View documents + the H&K alert + the per-domain UA
matrix in the scan skill), `bf063b6` (the 8/11 PA Online fish-market piece — fifth restatement of
nine / 341, and a **"Senate Bill 79"-only** article that a `SB 79` grep misses outright), `915ceda`
(corpus re-index, 57 files). The site-facing framing change went to **PR #17**, because the EPC has
not met: everything in that diff is a *proposal*, and Mountain View's own January 27 direction is
described one way by `neighbors.html` and another way by the city attorney's recital — which is a
human's question, not an unattended run's.

## 2026-08-16 — An attachment set was read down to the interesting-sounding names

Yesterday's run applied the 2026-08-13 attachment rule to Mountain View EPC 8/19 (Legistar meeting
3398) and read the agenda, the staff report, ATT 2 and ATT 3 — the four documents whose names
promise substance. **The item has eleven attachments.** The other seven were opened today. The rule
was followed; the read was not complete, and two of the seven were load-bearing:

- **ATT 5 is the Mountain View Register itself** — *"46 TOTAL (43 privately-owned properties plus 3
  city-owned properties)"*. That is the **denominator the staff report never states**. The site was
  about to characterize a "24 parcels excluded" off-ramp with no idea whether 24 was most of the
  register or a slice of it. It is 24 of 46.
- **ATT 7 is the entire public-comment record** on a citywide ordinance, and it greps **zero**
  "SB 79" — while one of its three submissions objects to preserving **124-126 Castro St** because
  *"That's right next to the Caltrain station, so it's one of the main gateways to the city."*
  124-126 Castro is **one of the 24 parcels on the exclusion list**. The most on-point stakeholder
  comment this project has found in Mountain View was invisible to every string search it runs.

**The failure mode is name-based triage.** "ATT 5 - Mountain View Register" and "ATT 7 - Public
Comments" read as boilerplate next to "Staff Report" and "Zoning Map Amendment Ordinance." They are
not. This is the 2026-08-09 thin-row finding one level inward: there, a *row* was counted as a read
source because it had a URL; here, an *item* was counted as read because its headline documents
were. Both times the missing material was already inside something the index had.

- **Enumerate the attachment set and account for every entry.** The call that produced the four is
  the same call that lists the eleven — `/v1/<client>/events/<id>/eventitems?Attachments=1` returns
  all of them with ids and names. There is no extra fetch to justify; there is only the decision to
  stop early. Same for PrimeGov's `historyId` pairing.
- **A short attachment is not a minor one.** ATT 5 is 2 pages and 3,217 chars; the two documents
  that grep zero and cost the most to read — ATT 1 (232 pp.) and ATT 9 (478 pp.) — are the ones name
  triage would have prioritized. Page count is anti-correlated with what mattered here.
- **Corollary for zero-hit greps, again:** all seven grep zero "SB 79." Six of those zeros are
  honest. ATT 7's is not — it is a fact about the phrase, on a document *about* the SB 79 item.

Also recovered by opening ATT 2's Exhibit A: **§36.55.75.c is the 14 CRHR/NRHP-eligible
single-family dwellings and duplexes** under interim HP-permit review. Yesterday correctly caught
that the staff report's pointer to "36.55.75.c" was wrong and the SB 79 language is at **.a**, but
recorded only what .c *isn't*. Naming what a bad cross-reference actually points at is what stops
the next reader from re-deriving it.

## 2026-08-16 — "Thursday" is not a date, and the same plaintiffs sue the same city twice

PR #16 dates the SF SB 79 petition by inference: SF Standard says the suit was filed "Thursday" in a
piece published **2026-08-13**, which is a Thursday, so it was filed 8/13. Today's sweep surfaced
**KQED**, *"YIMBY Groups Sue San Francisco, Arguing Upzoning Doesn't Go Far Enough"* — same three
plaintiffs (YIMBY Law, CalHDF, Californians for Homeownership), same defendant, and the sentence
*"filed a lawsuit on Thursday afternoon."* It is dated **February 12, 2026**, greps **zero**
"SB 79," and is about the Family Zoning Plan / housing element.

**February 12, 2026 and August 13, 2026 are both Thursdays.** So the inference reproduces perfectly
against a different lawsuit six months earlier. It is still probably right about the August filing,
but it cannot validate itself, and the docket check on PR #16 moves from prudent to required.

- **A relative date reference is not a date.** "Thursday," "last week," "Monday" resolve only
  against a publication date that is itself often a `dateModified`. Convert them, then confirm.
- **Repeat-litigant stories defeat headline matching.** When the same coalition sues the same city
  on a schedule, the outlet, the headline shape, the plaintiff list, the defendant *and* the
  day-of-week can all match across genuinely distinct cases. The **only** reliable discriminators
  here were the article's own date and a `SB 79` grep returning zero.
- **The counter-citation table worked, and needs widening.** PR #16 counter-cited the February
  *press release*. The trap came back as KQED — a major newsroom, which ranks higher and reads more
  credible. **Counter-cite the case, not the URL**, or the next outlet to cover it walks straight in.

## 2026-08-16 — The fingerprint had the meeting id in it; the dedup compared whole strings

PR **#18** was opened for the PTC 8/12 / 332 Forest outcome while PR **#15**, opened 2026-08-13 on
the same hearing, was already open. The state file already carried
`outcome:3079:item2-332-forest-ptc-0812`; the new finding fingerprinted as
`outcome:3079:332-350-forest-phz-arb-vote-4-2`. **Both start `outcome:3079:`.** The skill file
specifies the form as `outcome:<meeting-id>:<item>` — the meeting id was right there, and the dedup
step compared full strings and found no match.

The two PRs turned out to be complementary rather than duplicative (#15 is a pending-outcome stub in
`PRIMARY-SOURCES.md`; #18 is the `council-watch.html` copy #15's own checklist said the finding
"likely deserves"), so nothing was lost but the human's time in discovering the relationship. The
next one will not necessarily be so lucky.

- **Dedup `outcome:<meeting-id>:*` on the meeting-id prefix, not the whole string.** A single meeting
  generates *differently worded* findings on different days as evidence arrives — an agenda on day
  one, a stub when the video can't be transcribed, a press recap a week later, minutes after that.
  Free text after the id will differ every time by construction. The stable part is the id, which is
  why the format puts it there.
- **List the open PRs before branching.** `gh pr list` is one call and is the ground truth about what
  has already been routed to a human. `actioned_fingerprints` is this job's *memory* of what it did;
  the PR list is the *state of the world*, and they drift — the fingerprint set cannot know that a
  human closed, merged or retitled something.
- **A new finding about an already-PR'd event usually belongs as a comment on that PR** (the 7/27
  rule), and the exception — genuinely new site copy in a different file — is worth stating rather
  than assuming. Here the exception applied and the linkage still had to be added by hand afterward.
- Worth noting what *did* work: the press account answered #15's central open question almost
  point-for-point, including the one it flagged as most consequential. **A stub PR that writes down
  its own verification checklist pays off when the evidence finally lands** — the reconciliation was
  mechanical because #15 had said exactly what to look for.

## 2026-08-17 — The summary resolved a contradiction the document never resolved

Allen Matkins' SB 79 alert on Los Angeles surfaced today, unindexed. `WebFetch` reported it
cleanly: *"The City of Los Angeles **adopted** two ordinances (actions already completed)"*, with
a date — City Council approved June 3, 2026. Fetched directly, the document says both things. Its
lede: *"**If adopted and approved**, two **proposed** ordinances … **would** delay SB 79 Citywide
until likely 2030."* Its body, four sentences later: *"the City Council approved the ordinances on
June 3, 2026,"* and *"Following Los Angeles's adoption…"*. It is a law-firm alert written before
adoption and updated after, with the lede left alone.

The previous summarizer failures here were **fabrication** — an inferred date (2026-08-02) and an
attributed sentence that wasn't in the source (2026-08-05). This one invented nothing. Every clause
it produced is in the document. What it removed was the document's **disagreement with itself**,
which is the only part that mattered, because "proposed" and "adopted" are exactly the distinction
this project's one rule is built on.

- **A summarizer returns a resolved reading. Documents are not always resolved.** Summarization is
  lossy in a specific direction: it collapses hedges, reconciles tenses, and picks the confident
  clause. The failure mode isn't a wrong fact, it's a **manufactured certainty** — and it is
  invisible in the output, because a contradiction that has been smoothed away leaves no trace.
  The existing rule ("AI summaries are leads, not citations") is right and was followed; what's new
  is *why* it has to be followed even when the summary is accurate.
- **When a source's own tense is the finding, quote both halves.** The index row for this alert
  records the lede and the body verbatim and marks the adoption UNVERIFIED. A row that recorded only
  the body would have been true to the summary and false to the document.

### The tier gate has two exits, and this finding needed a third

An adoption is an outcome, so the gate says PR. But a PR is a *proposed site edit*, and **no page on
this site says anything about Los Angeles's ordinances** — nor should it; the site covers Palo Alto
and its peninsula neighbors. Opening a PR would have meant drafting copy asserting an unverified,
out-of-scope outcome purely to satisfy the routing rule. Deploying was obviously wrong. Dropping it
was also wrong: the index already draws the LA comparison (Holland & Knight calls LA, *"as is Palo
Alto,"* a user of the 50% temporary exclusion), so the mechanism is genuinely useful context.

- **deploy / PR is not exhaustive. The third exit is: index the source with the claim marked
  unverified, and assert nothing.** `PRIMARY-SOURCES.md` is in `.assetsignore` — recording what a
  document *says*, with its caveats, is not the site *claiming* it. That is what the index is for,
  and it already does this for the Atherton administrative draft and the OppNow headline.
- **A finding can be in scope for the index and out of scope for the site.** Those are different
  questions and were being answered as one. Ask them separately.
- Corollary, applied today: the alert was **not** added to the chat corpus as a fetched source, only
  as an index row. A fetched source is quotable by the widget on its own, without the caveat
  paragraph attached — an unverified outcome claim should not be independently citable.

---

## 2026-08-18 — The false positive was inside a document that was genuinely about SB 79

### What happened

The document-set diff on Palo Alto ARB meeting **3057** surfaced the **July 16, 2026 ARB draft
summary minutes** (23 pp.), attached to the 8/20 agenda for approval. A keyword sweep returned
**3 "SB 79" hits**, all in Item 3 (the Board's annual work plan) — including Assistant Director
Jennifer Armer's *"There were 5 preliminary applications under SB 79 for potential downtown housing
development,"* which is city staff's own figure for the downtown half of the partition this index
had only from press arithmetic. Good finding; indexed.

Then, while confirming Armer's title, an unrelated grep landed on a fourth passage in the same
document: *"Assistant Director Jennifer Armer stated that **the temporary ordinance runs through
June 2027**, so staff was targeting to have something for Council consideration before then to avoid
a lapse."*

Same document. Same speaker. Same meeting. A sunset date on a "temporary ordinance," in a file whose
SB 79 content had just been confirmed — and this project's entire Palo Alto record is built on a
**temporary ordinance** with a sunset. Read at that width it is a new, primary-source, city-staff
expiry date for the 50% exclusion, contradicting the site's published **~2032**.

It is not. It belongs to **Item 2, wireless communication facilities**, ~59,000 characters earlier in
the document, and refers to the WCF ordinance. Caught only because the surrounding 2,000 characters
were read before the phrase was believed — they are about AT&T and Verizon right-of-way clusters.

### Why this one is a different shape

Every trap logged since 2026-08-06 is a **false negative** across surfaces: a check correctly
performed on one surface standing in for the question (compiled documents, the HCD register, the
City Manager index, an agenda's item titles). The defenses built for those all say *look somewhere
else too*.

This is the inverse, and none of those defenses fire on it. Nothing here is inaccessible; the fetch
worked, the extraction worked, the grep worked, the document really is about SB 79, and the sentence
really is in it, verbatim, from a named staff member. **The relevance filter that a multi-item
document needs is structural, not lexical — and a text dump has had its structure removed.**

- **In a minutes/packet document, a fact's owner is its agenda item, not its file.** Before adopting
  any sentence from a compiled record, locate the item heading above it (`ACTION ITEMS`,
  `STUDY SESSION`, the numbered title) and check that the item is the one the finding is about.
  Costs one regex over the extracted text; the item boundaries are right there.
- **The dangerous phrases are the ones that don't contain the keyword.** A ±700-character window
  around "SB 79" — the search this run actually ran — would never have surfaced this passage, which
  is the only reason it stayed harmless. A different query ("does anything here give a sunset date?")
  would have hit it directly with nothing around it to signal the mismatch. Keyword proximity was
  doing safety work it was not designed for and cannot be relied on for.
- **`temporary ordinance` is now a known collision token in Palo Alto records**, alongside the
  `65912.100 / 65912.15x / 65914.2 / 65589.5` section-number collision (2026-08-03) and the
  `SB 79` -inside- `SB 790` shape (2026-08-04). Palo Alto has at least two live temporary
  ordinances — the SB 79 half-size exclusion (to **~2032**) and the WCF ordinance (to **June 2027**).
  A bare "the temporary ordinance" in a city document identifies neither.
- Applied today: the index row for these minutes carries the near-miss explicitly, so the next reader
  of that document meets the correction before the sentence.

### Postscript, same run — `seen_meeting_ids` is single-city, and the id spaces overlap

While advancing the watermark this run I briefly wrote **all three PrimeGov cities'** meeting ids into
`state.json`'s flat `seen_meeting_ids` list (156 → 243). Caught before saving, because the prior count
was *exactly* Palo Alto's meeting count — the list had always been Palo-Alto-only, and nothing in
`SKILL.md` or the file's own `_comment` says so.

The ranges settle it: **San Carlos meeting ids run 2744–2965 and Palo Alto's run 2818–3079.** They
overlap. A merged list would have silently marked unseen Palo Alto meetings as already-seen — the
exact permanent blindness the 2026-08-10 entry was written to prevent, reintroduced through the
dedup structure instead of the dedup rule.

- **`seen_meeting_ids` = Palo Alto only. Every other city dedups through `seen_meeting_docs[<city>]`,**
  which is keyed by city and therefore collision-free. That is why the per-city map exists; it is not
  just a finer-grained version of the id list.
- **A bare integer id is only unique inside its instance.** Any future cross-city watermark must be
  `<city>:<id>`, like the fingerprints already are.

---

## 2026-08-19 — "The document contradicts itself" was a hypothesis about the document. Both dates were real.

### What happened

The 2026-08-17 entry recorded the Allen Matkins LA alert as self-contradicting: a lede saying two
**proposed** ordinances **would** delay SB 79, a body saying *"the City Council approved the
ordinances on June 3, 2026."* The reading was that the alert was written pre-adoption and updated
post-adoption without harmonizing the lede, and that one of the two clauses was the truth. The lead
was parked: *"No LA council record has been read."*

Today the record was read. **Both clauses describe real events, and neither is the outcome.** The
City Clerk's council-file activity log for CF 25-1083-S4 shows a Council adoption on **06/03/2026**
*and a second Council adoption on* **06/23/2026**, with the City Attorney transmitting drafts on
6/17 and PLUM waiving consideration on 6/18 in between. The enacted, Clerk-certified ordinances —
**No. 188968** (Phased Implementation) and **No. 188967** (Low-Rise) — both carry *"Ordinance Passed
June 23, 2026 / Published 06/30/2026 / Effective 06/30/2026."* The alert's date is not wrong; it
names the first of two adoptions of the same file.

- **A contradiction in a source is a claim about the source. Verify it like any other claim.** The
  8/17 entry did the hard part right — it refused to pick the confident clause, and it quoted both
  halves. But the frame it wrote down ("an alert written pre-adoption and updated post-adoption")
  was itself an inference about how the document came to be, recorded in the index next to the
  verbatim quotes as if it were of the same kind. It was plausible and it was wrong. **When a
  document appears to disagree with itself, the cheapest explanation is a sloppy author; the
  cheapest *check* is the underlying record, and it can return a third shape neither clause implies.**
- **Corollary for the tier gate:** an unverified outcome parked in the index should record *what the
  document says*, not *why it says it*. The "why" costs nothing to omit and is the part that turns
  out to be fiction.

### The route was a URL pattern, not a browser

The 8/17 lead was filed as needing a human. It did not. `cityclerk.lacity.org` and
`planning.lacity.gov` both answer **200 to a plain `curl`** — the enacted ordinance PDFs are
8.3 MB and 16.7 MB of `application/pdf` at predictable paths
(`/onlinedocs/2025/<council-file>_ord_<ordinance-no>_<date>.pdf`), and the council file's activity
log is server-rendered HTML at a query-string endpoint. Nothing on LA's side changed between 8/17
and 8/19. What changed is that an ordinary press-sweep query happened to return a `cityclerk`
document as a *search result*, which revealed the repository the run could have gone to directly.

- Same shape as **2026-08-06** (compiled documents), **2026-08-07** (HCD letters on the recipient's
  own site) and **2026-08-13** (the JS index vs the sitemap): a record recorded as unread because
  the surface first tried didn't carry it. The new variant is that **no surface was tried at all** —
  the lead was written as "no record has been read," which is a statement about effort, and then
  filed under "route for a human," which is a statement about availability. Those are not the same
  sentence.
- **Every California city clerk publishes enacted ordinances, and the ordinance is a better source
  than the minutes for the one question the gate cares about.** It carries the passage date, the
  publication date, the effective date, the ordinance number and the Clerk's certification, in a
  fixed block on the last page. Before routing an adoption to a human, ask for the ordinance.
- ⚠️ **The certification is a threshold, not a tally.** Both LA ordinances certify passage *"by a
  vote of not less than three-fourths of all its members."* That confirms adoption and says nothing
  about who voted how — the minutes are still the only source for a count, and this index does not
  assert one.

### A secondary source undercounted a list the primary enumerates

The alert describes the temporary pause as **six** enumerated site categories. Ordinance 188968
Sec. 2 enumerates **eight** (A–H), under §65912.161(b)(1)(A)–(F), and puts the **permanent**
exclusions in a separate section under a different statute (Sec. 1, §65912.160(e), two categories).
A count in a secondary source is exactly the kind of detail that reads as concrete and specific and
is checkable in one fetch. Check it.

## 2026-08-24 — The attribution was right and the conclusion it licensed was wrong

`PRIMARY-SOURCES.md`'s ARB 7/16 row carried this warning, written by an earlier run of this same
job and auto-deployed as a tier-(b) safe fact:

> ⚠️ **Do not read this document's "the temporary ordinance runs through June 2027" as SB 79** —
> that line is Ms. Armer under **Item 2 (wireless communication facilities)**, about the WCF
> ordinance. Palo Alto's SB 79 half-size exclusion runs to **~2032**.

The first sentence is almost certainly correct: that utterance does sit under the WCF item, and
distinguishing it was good work of exactly the kind this file keeps asking for. The second sentence
is the problem. It does not merely record where the line came from — it uses the misattribution to
retire the *date*, and it does so by leaning on an unstated premise: **that a mid-2027 date could
not be an SB 79 date.**

That premise is false, and today's run found the refutation in a document the project had already
fetched. Both June 15 temporary ordinances — Attachment A (historic resources, SECTION 6) and
Attachment B (the 50% option, SECTION 7) — say, verbatim and identically:

> "This Ordinance shall be effective on the 31st day following its adoption and **shall expire on
> July 1, 2027 unless extended or superseded**."

The same ordinances *also* say the sites are excluded "until one year following the adoption of the
City's seventh cycle Housing Element" — the ≈2032 figure. **Two clocks, one document**, and the
site had been publishing only the longer one across four pages.

- **A "these are different things" finding tells you the two things are different. It does not tell
  you either one is false.** The correct output of that ARB analysis was "this WCF line is not
  evidence about SB 79" — a statement about one sentence's evidentiary value. What got written was
  "and therefore ~2032," which is a substantive claim about a different document that was never
  opened. Distinguishing is a *subtraction* operation; it cannot produce a new positive claim.
- **The tell was available at the time: the rebuttal cited no source.** The warning's ~2032 half
  points at nothing — no ordinance section, no attachment, no line. Every other assertion in that
  row carries a citation. A clause that argues rather than cites, inside a row that otherwise
  cites, is where to look first.
- **The near-term date is the one a reader needs, and it is the one this shape deletes.** The error
  ran in the direction of making the local rule sound more settled than it is: six more years,
  rather than ten more months and a Council decision. When a distinguish-the-similar-things move
  discards a date, check which of the two dates was *nearer* — discarding the nearer one is how a
  site ends up confidently describing a lapsed rule.
- **Corroboration arrived independently and would have been enough on its own.** The PTC 8/26 SOFA
  consultant memo, indexed this run, says "a temporary ordinance that will allow roughly 50% of the
  otherwise-applicable SB 79 density **through July 1, 2027**" under a heading reading "SB 79
  (effective July 1, 2026)." Under the old warning's logic this would have been dismissed a second
  time as another 2027-shaped confusion. **A rule that dismisses a class of dates will keep
  dismissing them.** That is what makes this variant worse than a one-off misread.
- Related but not the same as **2026-08-18** (a false positive *inside* a genuinely-SB-79 document)
  and **2026-08-19** (a self-contradiction that turned out to be two real dates). Those were about
  reading one document correctly. This one is about an inference that traveled from a document that
  was read to a document that was not.

Site-facing correction routed to **PR #19**, not deployed — it changes a published claim on four
pages and the *adopted* ordinance text has still not been read (the attachments are stamped
`***NOT YET APPROVED***`, and codified PAMC is not headlessly reachable: codepublishing 404, amlegal
403, municode a 6 KB JS stub).

## 2026-08-25 — The official record and the complete record are different documents

Palo Alto Council meeting **2845** (Aug 10) had minutes indexed since 8/14: doc **21242**,
`templateName` **"Action Minutes"**, published 8/13, greps **zero** "SB 79." The same
attachment was re-read on 8/25 off the 8/24 consent agenda — zero again. On 8/25 at
**16:00:27** the clerk published doc **21320**, `templateName` **"Summary Minutes"**, 27 pp.,
onto the same meeting id. It greps **one**, and the hit is a resident submitting three slides
on SB 79 implementation under **Virtual Public Comment** — the first resident testimony on
SB 79 in any Palo Alto meeting record this project holds, carrying the **$6.3M** listing for
**340 Palo Alto Ave.** (window filing row 7) from the city's own record rather than the press.

This file already records (2026-06, §"Minutes have approval states") that per **Ordinance No.
5423** the *action* minutes plus the recording are the **official** record and summary minutes
are not. That is true and it is not the same question. **"Official" ranks authority; it does
not describe coverage.** Action minutes carry motions and votes. Summary minutes carry the
narrative — staff reports, councilmember discussion, and *public comment*, which is where a
law the city is implementing shows up before it is ever an agenda item. A meeting can produce
an action-minutes grep of zero and a summary-minutes grep that is the day's only finding.

The failure this avoided is quiet and permanent: **treating a meeting as "minuted" once any
minutes document lands.** The 8/10 documentList diff fired correctly on 8/13 for 21242, the
row was written, and the meeting looked closed. Only the document-set diff — which re-checks
a meeting forever, not once — caught 21320 twelve days later. Two rules:

- **`templateName` is part of the identity, not a label.** A meeting's minutes are not one
  artifact. Track *which* minutes templates have posted (`Action Minutes`, `Summary Minutes`,
  `Minutes`) and read each on arrival; do not let one satisfy the other. Same shape as the
  draft→approved rule (2026-08-14), one axis over.
- **Grep the summary minutes for public comment specifically.** The 2026-08-10 rule says to
  read a packet for the *previous* meeting's minutes. This is its sibling: read the summary
  minutes for the things the action minutes structurally cannot contain.

Deployed as a source-index row (`374a4af`), attributed and not adopted — the speaker's
lot-value disparity claim and his framing that *the ordinance* created the 15-day window (it
was the gap between SB 79's July 1 effective date and the ordinances' July 16 one) are
statements entered into the record, not findings.

**Second, smaller, from the same run: a diff that flags everything is a broken comparison, not
a finding.** The sweep's first pass reported ~160 Palo Alto documents "removed" across every
meeting — because the removal test compared integer doc ids against a dict whose keys were
strings, so nothing ever matched. This file's 2026-08-13 rule reads "if a listing page yields
zero items of the kind it exists to list, the parse failed — regardless of status code." The
dual holds and is worth stating: **if a diff flags 100% of the corpus, suspect the comparison
before the corpus.** A one-way sanity check (`removed ⊆ prev` and `len(removed) < len(prev)`)
would have caught it before a single fetch. Cost here was one wasted pass; the cost of
believing it would have been ~160 phantom link-rot alarms.

---

## 2026-08-26 — A timestamp is a claim about the file's metadata. The bytes are a separate question.

### What happened

The daily Tier-4 version sweep checks a handful of static reference documents by `Last-Modified`,
because they generate no other event (that is the whole lesson of **2026-08-11**, above: a source can
go stale without going dead). Today the sweep fired: the **ABAG SB 79 Summary** — both the superseded
April file and the current July one — returned

```
2026-04/SB79-Summary-040826.pdf     last-modified: Tue, 25 Aug 2026 16:07:38 GMT
2026-07/SB79-Summary-07172026.pdf   last-modified: Tue, 25 Aug 2026 16:07:45 GMT
```

Both had been stable for weeks. A `Last-Modified` inside the scan window, on the region's canonical
SB 79 explainer, is exactly the shape of a Tier-4 finding — and 8/11 is a standing reminder that when
ABAG revises this document, **the revision is not cosmetic** (that one moved §65912.161(b)(1) from one
sentence to six subparagraphs and put a claim on `neighbors.html` into PR #13).

It was not a revision. Nothing in either file changed.

### The tell, and it was free

Two things gave it away, and both were already in the response this scan had made:

1. **The two files live in different month directories and moved 7 seconds apart.** Editorial revisions
   to a superseded April document and a current July document do not happen 7 seconds apart. That is a
   filesystem touch — a platform sync (nginx/Pantheon), not an author.
2. **nginx's ETag is `"<mtime-hex>-<size-hex>"`.** So a bare `HEAD` already carries the size:
   `"6a8dbdd1-76f86"` → `0x76f86` = **487,302 bytes**, which is *byte-for-byte* the size this project
   recorded for the July file on 2026-08-21. Same size, same content, new timestamp.

The mtime fields confirm the first point arithmetically: `0x6a8dbdd1 − 0x6a8dbdca = 7`.

### The rule

**Never treat `Last-Modified` alone as a revision signal. Confirm it against a second dimension —
size or hash — before writing down that a document changed.** This is the 2026-08-09 "check a bounded
set on a second, independent dimension" habit applied to a file instead of a fact, and here the second
dimension cost *nothing*: on nginx the ETag hands you the size in the same `HEAD` the sweep already
makes. Record the size next to the timestamp in the run log so the comparison exists next time.

Note the symmetry with **2026-08-11**, which is why these two belong together:

- 8/11: the document **changed** and every signal said unchanged (200, same URL, same topic grep).
- 8/26: every signal said **changed** and the document had not.

A metadata field is evidence about metadata. It becomes evidence about content only when something
content-shaped agrees with it — which is the same sentence this file has now written about status
codes (8/06, 8/07), about page greps (8/13), and about press summaries (8/24).

### Also worth knowing, from the same run

Palo Alto's **Aug 17 Council Summary Minutes** (doc 21321) print the disposition of Item 6's original
motion as **`MOTION PASSED/FAILED: X-X`** — an unfilled template placeholder in a published,
un-DRAFTed record. The document does not record how that motion went. **A primary record can be
incomplete without looking incomplete**, and a grep for `MOTION PASSED` finds this line and reports a
vote. Before citing a motion out of minutes, read the tally, not just the label.

---

## 2026-08-27 — The index was unreachable, so the documents were written off. Third time, same agency.

### What happened

`PRIMARY-SOURCES.md` has carried, since 2026-08-01, an accurate note that HCD's per-jurisdiction
register — **"HCD Technical Assistance and SB 79 Ordinance Review Letters"**,
`hcd.ca.gov/hau/enforcement-letters` — is a **Power BI Gov embed** and is not headless-reachable.
That has been re-confirmed repeatedly and it is still true.

What was never tried, in nineteen daily runs, is a **domain-restricted web search of `hcd.ca.gov`**.
It surfaced one on the first attempt:

```
https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/HAU/san-francisco-sb79-in-070126.pdf
```

`curl -sL` → **200, `application/pdf`, 225,670 B, 4 pp.** No browser, no UA trick, no session. It is
HCD's July 1 substantial-compliance letter for San Francisco's Ordinance 082-26, signed by the same
Housing Accountability Unit Chief who signed Atherton's — and it is the document the SF lawsuit
(PR #16) puts in issue. Its condition of approval is squarely on the State Density Bonus Law, which
is the subject of PR #10.

### Why this is the third instance and not a new mistake

- **2026-08-06** — `Portal/viewer?id=` is an Accusoft JS shell ⇒ recorded as "compiled minutes are
  not retrievable." They were, at `/Public/CompiledDocument/<id>`. Cost: five weeks of Atherton.
- **2026-08-07** — the HAU register is a Power BI embed ⇒ recorded as "the letter needs a human with
  a real browser." Atherton's letter was a plain PDF on the *Town's* DocumentCenter, on a page this
  project had already fetched four times. That entry closed with a generalized rule: *before
  recording that a state-agency document is unreachable, check whether the subject jurisdiction
  publishes its own copy.*
- **2026-08-27 (this one)** — same register, same agency, and the rule from 8/07 **did not fire**,
  because it named the wrong escape hatch. The 8/07 rule says "check the other party." The actual
  lesson is one level up, and it is what all three share: **an unreadable index is a fact about the
  index. The documents it lists have their own URLs and their own access properties.**

The 8/07 entry generalized from *one* alternate surface (the subject jurisdiction) instead of from
the shape. So it produced a checklist item rather than a habit, and a checklist item only fires when
the situation looks like the one that wrote it. This time the document was on **HCD's own domain the
whole time** — the very domain that had been written off — which the 8/07 rule does not even reach.

### The rule

**When an index is unreachable, go looking for the items directly.** A register, a dashboard, a
listing page and a search form are *finding aids*; failing to read one tells you nothing about
whether its contents are fetchable. Concretely, before writing "not headless-readable" about a class
of document: run a **domain-restricted search of the publishing domain**, and try the document's own
URL if any instance of it is known. Both are one request.

### And the symmetric discipline, which cost nothing to keep

Having found the path shape — `…/HAU/<jurisdiction>-sb79-in-<MMDDYY>.pdf` — the obvious next move is
to guess it for the tracked cities. Six guesses (Palo Alto ×2, Atherton, San Jose, Beverly Hills,
San Carlos) returned **404**. That is worth exactly nothing: the slug and the letter date are both
unguessable, so a 404 is a failed guess, not an absence of a letter. Domain-restricted search for
Palo Alto and Atherton SB 79 letters also returned none — again **one surface**, again not an absence.

This is the mirror of the entry above and needs stating alongside it, because the same run produced
both: **a new route that works does not make its negative results informative.** Discovering that
letters are fetchable does not license "Palo Alto has no letter." The index records the route, the
six 404s, and the fact that they prove nothing.

### Also from this run, for the record

- **Meeting 2847 (Council special, 8/24) posted its Draft Action Minutes (doc 21331).** Council
  approved the August 10 minutes **7–0 on consent** (Item 3, in the 3-4/6-8 block) — closing the
  question the 8/25 lead opened. Zero SB 79 in the document. Meeting **2845** still shows no signed
  replacement for draft Action Minutes 21242, so the draft→approved link-rot event has not fired yet.
- **The ABAG second-dimension rule from 8/26 worked on its first use.** Both summary PDFs still carry
  `Last-Modified: Tue, 25 Aug 2026 16:07:38/45 GMT` — inside the window, and the shape that fired
  yesterday. Their ETags are byte-identical to yesterday's (`"6a8dbdca-126065"`, `"6a8dbdd1-76f86"`
  → 1,204,325 B and 487,302 B). Unchanged, in one `HEAD`, with no fetch. Recording the size next to
  the timestamp is what made today's check free.
