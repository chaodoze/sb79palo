---
name: sb79-daily-update
description: Daily unattended agent that scans for SB 79 updates (building on sb79-update-scan), auto-deploys only mechanically-verifiable "safe facts," and routes anything asserting an outcome to a GitHub PR for human video/minutes verification. Use when running the scheduled daily diligence-and-publish pass on the sb79palo site, or when a user asks to run/preview/test the daily update job. Runs on the always-on Mac Mini in the sb79palo repo.
---

# SB 79 daily update

Turns the **sensing** skill [`sb79-update-scan`](../sb79-update-scan/SKILL.md)
into an **acting** one. It runs once a day, unattended, in the `sb79palo` repo, and:

- **auto-deploys** small facts it can verify itself (a confirmed date, a new source link),
- **opens a PR** for anything that asserts something *happened* (a vote, an adoption, a
  lawsuit) — because an unattended run **cannot** transcribe a meeting video to verify it,
- stays **silent** when there's nothing, and **emails** you only on substantial deploys.

> **Read first:** the project's [`CLAUDE.md`](../../../CLAUDE.md) and
> [`learnings.md`](../../../learnings.md), and the sibling
> [`sb79-update-scan`](../sb79-update-scan/SKILL.md). Every
> primary-source rule there applies here — this skill just automates the safe subset.

## The one rule that matters

**Never auto-deploy a claim that something HAPPENED.** Previews, staff reports, agenda
listings, and press recaps describe what is *planned* or *reported* — not what the record
shows. Confirming an outcome in this project means the meeting **video or minutes**, which
a headless run can't do. So every outcome finding becomes a PR, no matter how confident the
press is. Auto-deploy is only for facts the agent re-verifies by fetching an API or URL.

## Tier → action gate

Reuses `sb79-update-scan`'s (a)/(b)/(c) tiers:

| Tier | What it is | Action |
|---|---|---|
| **(c) nothing** | previews already covered, chatter, restated coverage | Update watermark. Silent. |
| **(b) safe fact** — self-verifiable, no outcome | date confirmed via PrimeGov API; a new press/source link added to a list; "minutes now posted" confirming an already-flagged *pending* item; MTC map official flip; update-stamp bump | **Auto-apply → `lint-gate.sh` → `deploy-safe.sh`.** Cap **≤3/run**. |
| **(a) outcome / news-worthy** | a vote/adoption/withdrawal; a lawsuit; minutes that change a prior claim; anything needing video/minutes | **`open-pr.sh`.** Never deploys. |

If unsure which tier → treat as **(a)** and open a PR. Bias to caution.

## Pipeline

Run from the repo root. Scripts live in `.claude/skills/sb79-daily-update/scripts/`.

1. **Preflight** — `bash .claude/skills/sb79-daily-update/scripts/preflight.sh`. Aborts if
   the tree is dirty (a human may be mid-edit) or can't sync. This is the guard against the
   parallel-commit divergence documented in `learnings.md` (2026-07-14 merge).
2. **Load state** — read `.claude/skills/sb79-daily-update/state.json`. It's per-machine
   runtime state (gitignored); **if it's missing, `cp state.seed.json state.json` first**.
   The scan window is **since `last_run`**. Note `seen_meeting_ids` and
   `actioned_fingerprints`. `state.json` and `run-log.md` are local — never commit them.
3. **Scan** — execute the `sb79-update-scan` **Quick-start procedure** verbatim:
   - `bash .claude/skills/sb79-update-scan/scripts/check-meetings.sh` (PrimeGov API). If
     that skill isn't installed on this machine, `curl` the endpoint directly:
     `https://cityofpaloalto.primegov.com/api/v2/PublicPortal/ListUpcomingMeetings`.
   - Diff the active agenda's attachments against `PRIMARY-SOURCES.md`.
   - Sweep the tier 1–5 sources (press, HCD/MTC, neighbor cities) for the window.
   Produce findings, each tagged (a)/(b)/(c) with its source URL(s).
4. **Dedup** — drop any finding whose fingerprint (see below) is in
   `actioned_fingerprints`, or whose meeting id is in `seen_meeting_ids` with no change.
5. **Classify + gate** each remaining finding:
   - **Outcome ⇒ always (a).** A "scheduled vote," a preview, or a press recap of a vote is
     still (a) — the record isn't verified.
   - **Identity-check meeting/video sources**: get the video id from the PrimeGov agenda
     page's embedded `videoUrl` (grep the page HTML for `videoUrl`), **not** from a
     web-search result title. (2026-07-14 learnings: a search result mislabeled a different
     city's meeting.)
6. **Apply tier-(b) safe facts** (≤3): edit using `sb79-update-scan`'s edit-target map —
   typically `council-watch.html` (meeting log, status), `PRIMARY-SOURCES.md` (source/press
   tables), `neighbors.html` (scorecard), and the page `update-stamp`. Then:
   - `bash .claude/skills/sb79-daily-update/scripts/lint-gate.sh`
   - If it PASSES → `bash .claude/skills/sb79-daily-update/scripts/deploy-safe.sh -m "<msg>" <files…>`
   - If it FAILS → `git checkout -- <files>` to revert, and route that finding to a PR instead.
   Keep each safe edit to the canonical `data-def` string (copy from `glossary.html`;
   tooltip only the first occurrence per page).
7. **Stage tier-(a) outcomes as PRs**: make the proposal edits (or, if the exact wording
   needs the video, just a stub + notes), write a PR body to a temp file, then
   `bash .claude/skills/sb79-daily-update/scripts/open-pr.sh --slug <slug> --title "<title>" --body-file <tmp> <files…>`.
   The body **must** list what a human verifies before merge (e.g. "confirm the 23C vote
   against meeting video <id>; distinguish HAPPENED from the press's framing"). If the
   transcriber MCP happens to be available on this machine, you may pre-fill a verified
   draft — but still PR it; **never merge**.
8. **Corpus (guarded, optional, off the critical path)** — only if published content
   changed **and** `OPENAI_API_KEY` is in the environment: update `sources/index.json` if a
   source was added/removed, run `npm run build-corpus`, and `deploy-safe.sh` the resulting
   `sources/file-map.json`. Otherwise skip and note it in the run log.
9. **Learnings** — if the run hit a mistake or a genuinely new edge case, append an entry to
   `learnings.md` and commit it (it's in `.assetsignore`, not deployed).
10. **State + notify** — update `state.json` (`last_run`, `seen_meeting_ids`,
    `actioned_fingerprints`, any `open_prs`), append one audit line to
    `.claude/skills/sb79-daily-update/run-log.md`, then notify per the matrix.

## Notification matrix

| Run outcome | Channel |
|---|---|
| tier-(a) PR opened | The PR itself is the signal; also surface it as an action-needed item. |
| tier-(b) **substantial** deploy | `notify-email.sh "<subject>" "<body incl. what changed + live URL + commit link>"` |
| tier-(b) **minor** deploy | Silent — `run-log.md` only |
| nothing new | Silent |

**Substantial vs minor** (decide at edit time):
- **Minor** (silent): update-stamp/date bump; one source/press link added to an existing
  list; typo/whitespace; a `data-def` canonical-string sync. Single file, non-framing.
- **Substantial** (email): a new meeting-log timeline entry; a status/lede change; a
  "pending → confirmed" flip on a tracked claim; a new source that changes framing; edits
  spanning multiple content pages; anything a reader would notice as new information.

Live URL is `https://sb79.numtot.org/<page>`; commit link is
`https://github.com/chaodoze/sb79palo/commit/<sha>`.

## Fingerprints (idempotency)

A finding's fingerprint = a stable slug of its identity, e.g.
`meeting:<primegov-id>`, `press:<canonical-url>`, `source:<url>`, `outcome:<meeting-id>:<item>`.
Store applied/PR'd fingerprints in `state.json` so a finding is never actioned twice and no
duplicate PR is opened. Prefer fingerprints derived from stable ids/URLs over free text.

## Safety rails

- Outcome/HAPPENED claims are always PRs — never `deploy-safe.sh`.
- `preflight.sh` before touching anything; `git pull --rebase` before every push (handled by
  the scripts); never force-push; unresolved conflict ⇒ leave it for a PR.
- `lint-gate.sh` must PASS before any deploy; failure ⇒ revert + PR.
- Cap ≤3 auto-deploys/run; if more safe facts exist, batch the rest into one PR.
- Respect `.assetsignore`: never edit-to-publish process files (`CLAUDE.md`, `learnings.md`,
  `PRIMARY-SOURCES.md` are excluded from the bundle but still committed for the record).
- AI summaries / search snippets are leads, not citations. Distinguish similar options
  (e.g. temporary vs urgency ordinance) on every axis before writing.

## Dry-run

Invoke with **`dry-run`** in the prompt (or run the job with `SB79_DRY_RUN=1`): do steps
1–5, then **print the planned actions** — for each finding, its tier and whether it would
auto-deploy or open a PR, and the exact files it would touch — and **stop**. Make no edits,
no commits, no pushes, no PRs, no emails, and do not advance `state.json`. Always dry-run
after any change to this skill before re-enabling live deploys.

## See also

- `.claude/skills/sb79-update-scan/SKILL.md` — the sensing methodology, tier thresholds,
  edit-target file/line map, and the PrimeGov API technique.
- `README.md` (this dir) — scheduling on the Mac Mini, email setup, changing autonomy.
- `../../../CLAUDE.md`, `../../../learnings.md`, `../../../PRIMARY-SOURCES.md`.
