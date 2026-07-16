# sb79-daily-update

A scheduled, unattended agent that runs the [`sb79-update-scan`](../../../../.claude/skills/sb79-update-scan/SKILL.md)
diligence daily, **auto-deploys mechanically-verifiable "safe facts,"** and **opens a PR**
for anything asserting an outcome (a vote, an adoption, a lawsuit) — because an unattended
run can't transcribe a meeting video to verify it. Full runbook: [`SKILL.md`](SKILL.md).

Runs on the **always-on Mac Mini**, in a clone of `chaodoze/sb79palo`. Deploy = `git push
origin main` → Cloudflare auto-build. No `wrangler deploy` step.

## Files

```
.claude/skills/sb79-daily-update/
├── SKILL.md                 # the autonomous runbook (tier gate, pipeline, safety rails)
├── README.md                # this file
├── state.seed.json          # committed initial watermark (copied to state.json on first run)
├── state.json               # LOCAL runtime watermark — gitignored, per-machine
├── run-log.md               # LOCAL audit trail (one line per run) — gitignored
└── scripts/
    ├── preflight.sh         # sync to origin/main; abort if tree is dirty
    ├── lint-gate.sh         # htmlhint + data-def drift + local-link check
    ├── deploy-safe.sh       # commit named files + push (tier-b only)
    ├── open-pr.sh           # branch + gh pr create (tier-a outcomes)
    └── notify-email.sh      # email on substantial deploys (provider-agnostic)
```

## First-time setup (on the Mac Mini)

### 1. Permission allowlist  ⚠️ required for unattended runs

Scheduled runs cannot approve permission prompts, so the two commands the scripts use must
be pre-approved. Add them to the **user** settings `~/.claude/settings.json`
`permissions.allow` (the project `.claude/settings.json` is also a valid home for these):

```json
"Bash(bash *)",
"Bash(jq *)"
```

Everything else the pipeline needs (`git`, `gh`, `npm`, `npx`, `curl`, `wrangler`) is
already allowlisted. `gh` must be authenticated (`gh auth status`).

### 2. Email (optional, for substantial-deploy notifications)

`notify-email.sh` is provider-agnostic and non-fatal. Set, in the Mini's environment /
launchd profile:

```bash
export SB79_NOTIFY_TO="chaolam@gmail.com"          # default already this
# Option A — a transactional email API (Resend/Postmark/SendGrid-style):
export SB79_EMAIL_API_URL="https://api.resend.com/emails"
export SB79_EMAIL_API_KEY="re_…"
export SB79_EMAIL_FROM="sb79@your-verified-domain"
# Option B — a local mailer: install/configure msmtp or mail; no vars needed.
```

If none is set, substantial deploys just log a warning (no crash) and the run still
notifies via the normal action-needed path.

### 3. Schedule it

The routine config is machine-local (not in the repo). Create
`~/Documents/Claude/Scheduled/sb79-daily-update/SKILL.md`:

```markdown
---
name: sb79-daily-update
description: Daily SB 79 site diligence + gated auto-deploy.
---
cd /Users/<you>/GitHub/sb79palo && do a live run of the /sb79-daily-update skill.
Follow SKILL.md exactly; obey the tier gate (safe facts auto-deploy, outcomes → PR).
```

Then register it via the `/schedule` skill with cron **`15 8 * * *`** (daily 08:15,
Mac Mini local time — after overnight agenda posts; PrimeGov posts ~11 days ahead, so daily
easily catches new packets). Keep the Mini's timezone in mind when picking the hour.

### 4. Verify before enabling live deploys — see [SKILL.md § Dry-run](SKILL.md).

## Manual use

```bash
cd /path/to/sb79palo
# Dry-run (no edits/commits/pushes/PRs/emails): invoke /sb79-daily-update with "dry-run".
# Standalone script checks:
bash .claude/skills/sb79-daily-update/scripts/preflight.sh
bash .claude/skills/sb79-daily-update/scripts/lint-gate.sh
bash .claude/skills/sb79-daily-update/scripts/notify-email.sh "test" "hello from the Mini"
```

## Changing the autonomy level

The gate lives in [`SKILL.md`](SKILL.md) § "Tier → action gate". To make it **more**
conservative, move a (b) category to (a) (PR instead of deploy) — e.g. drop the "≤3 safe
deploys" cap to 0 to make it propose-only. To make it **less** conservative is discouraged:
the whole design assumes outcomes are never auto-published without human video/minutes
verification (see `learnings.md`).
