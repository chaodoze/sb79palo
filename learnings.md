# Learnings

A running log of mistakes made while building this site and the practices that prevent
them. Newest first. This is an internal process doc — it is excluded from the deployed
site via `.assetsignore`.

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
