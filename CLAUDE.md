# CLAUDE.md

Working notes for Claude on the SB 79 Palo Alto site.

## What this is

A plain HTML/CSS/JS learning portal about California SB 79 and its implementation in
Palo Alto. No build step on the content side. Deployed on Cloudflare Workers static
assets; a push to `main` auto-deploys (live at sb79.numtot.org).

There is also a small TypeScript Worker in `src/` that powers the **"Ask AI about
SB 79"** chat widget on `council-watch.html` (an experiment to mine reader intent).
The Worker handles `/api/chat` and falls through to static assets for everything else.
See [the chat-widget runbook](#chat-widget-runbook) below.

## Before you start

- **Read [learnings.md](learnings.md).** It records concrete mistakes made on this site
  and the practices that prevent them. Don't repeat them.
- **Check [PRIMARY-SOURCES.md](PRIMARY-SOURCES.md)** for authoritative source material
  before writing or revising news-style content.

## Core discipline

- **Verify against primary sources.** For statutory claims, read the codified California
  Government Code text — not a bill summary, news preview, or AI summary. For council
  decisions, check the meeting video/minutes — a preview describes what is *planned*, not
  what *happened*.
- **Distinguish similar-sounding options.** Before describing two related paths, write out
  how they differ on every axis (timeline, who approves, interim effect, cost).
- **Lint before declaring done.** Run `npx htmlhint *.html` on any changed HTML.
- **Plain language on main pages.** Home, Palo Alto, and Council watch are written for
  residents with zero planning background. Jargon goes behind `a.term` links: dotted
  underline, hover definition via `data-def`, click-through to `glossary.html#anchor`.
  The glossary one-liner is the canonical `data-def` string — copy it verbatim; check
  drift with `grep -oh 'data-def="[^"]*"' *.html | sort | uniq -c`. Tooltip only the
  first occurrence per page. Learn / Tier analysis / About / Glossary live off-nav,
  linked from the footer and in context.
- After a major change, add an entry to `learnings.md` if a mistake surfaced, and commit.

## Deploy

`wrangler.jsonc` configures the Workers project: `main` is `src/index.ts` (the chat
worker), `assets.directory` is `.` (the whole repo). `.assetsignore` keeps repo/process
files (this file, `learnings.md`, lint configs, `scripts/`, `src/`, `sources/`,
`migrations/`) out of the deployed static-asset bundle. A git push to `main` triggers
an automatic build.

## Chat-widget runbook

The chat widget is grounded by `sources/index.json` → an OpenAI vector store →
`file_search` via the Responses API. Each turn is logged to D1 with a structured intent
classification we can mine for content ideas.

### First-time setup (once per environment)

```bash
npm install

# 1. Create the D1 database for chat logs
wrangler d1 create sb79palo-chat
# → paste the printed database_id into wrangler.jsonc d1_databases[0].database_id

# 2. Set secrets
wrangler secret put OPENAI_API_KEY        # your OpenAI key
wrangler secret put IP_HASH_SALT          # any random string; rotate to invalidate IP hashes

# 3. Apply the schema (run for both local and remote D1)
npm run migrate:local
npm run migrate:remote

# 4. Build the corpus (uploads sources to a new OpenAI vector store)
export OPENAI_API_KEY=...
npm run build-corpus
# → paste the printed vector store ID into wrangler.jsonc vars.VECTOR_STORE_ID

# 5. Deploy
npm run deploy
```

### Updating the corpus

When PRIMARY-SOURCES.md gains/loses entries, or when a fetched URL has new content,
edit `sources/index.json` accordingly and run:

```bash
export OPENAI_API_KEY=...    # only needed if not in shell
export VECTOR_STORE_ID=vs_…   # use the existing vector store
npm run build-corpus
```

The script is idempotent: re-uploads only changed files, removes deleted entries, and
rewrites `sources/file-map.json` (commit this — the Worker uses it to render citations).

### Editing the AI prompt or schema

`src/prompts.ts` holds the system prompt, JSON schema, intent taxonomy, and cost
constants. Edit and redeploy; no codegen step.

### Mining intent

```bash
wrangler d1 execute sb79palo-chat --remote --command \
  "SELECT intent_category, COUNT(*) c FROM chat_messages GROUP BY intent_category ORDER BY c DESC"

wrangler d1 execute sb79palo-chat --remote --command \
  "SELECT intent_unmet_need FROM chat_messages WHERE intent_unmet_need IS NOT NULL ORDER BY created_at DESC LIMIT 20"
```
