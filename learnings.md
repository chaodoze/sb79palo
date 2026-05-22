# Learnings

A running log of mistakes made while building this site and the practices that prevent
them. Newest first. This is an internal process doc — it is excluded from the deployed
site via `.assetsignore`.

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
