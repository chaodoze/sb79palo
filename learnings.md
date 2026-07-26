# Learnings

A running log of mistakes made while building this site and the practices that prevent
them. Newest first. This is an internal process doc — it is excluded from the deployed
site via `.assetsignore`.

---

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
