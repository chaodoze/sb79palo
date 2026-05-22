# CLAUDE.md

Working notes for Claude on the SB 79 Palo Alto site.

## What this is

A plain HTML/CSS/JS learning portal about California SB 79 and its implementation in
Palo Alto. No build step. Deployed on Cloudflare Workers static assets; a push to
`main` auto-deploys (live at sb79.numtot.org).

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
- After a major change, add an entry to `learnings.md` if a mistake surfaced, and commit.

## Deploy

`wrangler.jsonc` configures the Workers static-assets project. `.assetsignore` keeps
repo/process files (this file, `learnings.md`, lint configs, `scripts/`) out of the
deployed site. A git push to `main` triggers an automatic build.
