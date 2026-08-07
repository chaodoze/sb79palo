# Learnings

A running log of mistakes made while building this site and the practices that prevent
them. Newest first. This is an internal process doc — it is excluded from the deployed
site via `.assetsignore`.

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
