# SB 79 Palo Alto

A learning portal and 5-minute simulator about California **SB 79** (the 2025 transit-oriented housing law), focused on Palo Alto.

Phase 1 covers:

- **Learn**: plain-English explainer of SB 79 (`learn.html`)
- **Palo Alto**: local impact across the three Caltrain stations (`palo-alto.html`)
- **Simulator**: click-to-build game around the University Ave station (`game.html`)
- **FAQ** + **About** with sources

Long-term: ongoing news coverage as the law plays out.

## Stack

Plain HTML5 + CSS + ES modules. **No build step**, no framework, no npm dependencies at runtime. The only npm usage is for linting.

```
sb79palo/
├── index.html, learn.html, palo-alto.html, game.html, faq.html, about.html
├── assets/
│   ├── css/{site,game}.css
│   ├── js/site.js
│   ├── js/game/{main,state,parcels,rules,meters,render,intro}.js
│   ├── img/downtown-pa.svg
│   └── data/sb79.json     ← canonical tier/height/density facts
├── _headers, robots.txt, sitemap.xml
└── README.md
```

## Local development

Any static server works. The simplest:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

Or `npx serve .` if you have node available.

The simulator fetches `assets/data/sb79.json` at runtime, so opening `game.html` directly via `file://` will fail — you need a server.

## Linting

Run all three before declaring a change ready:

```sh
npx --yes htmlhint "**/*.html"
npx --yes stylelint "assets/css/**/*.css"
npx --yes eslint "assets/js/**/*.js"
```

Configs (`.htmlhintrc`, `.stylelintrc.json`, `eslint.config.js`) live at the project root.

## Deploy (Cloudflare Pages)

1. Push this repo to GitHub.
2. In Cloudflare Pages: Create a new project, connect the repo.
3. Build settings: **Framework preset = None**, **Build command = (empty)**, **Build output directory = `/`**.
4. The `_headers` file at the root handles caching and security headers.

## Source of truth

`assets/data/sb79.json` is the canonical source for SB 79 numbers. The `learn.html` tier table and the simulator's rules both pull from it. Update there first when laws change.

## Disclaimer

Educational content only — not legal advice. Parcel data and meters in the simulator are illustrative.
