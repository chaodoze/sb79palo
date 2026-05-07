# SB 79 Palo Alto

A learning portal about California **SB 79** (the 2025 transit-oriented housing law), focused on Palo Alto.

Phase 1 covers:

- **Learn**: plain-English explainer of SB 79 (`learn.html`)
- **Palo Alto**: local impact across the three Caltrain stations (`palo-alto.html`)
- **FAQ** + **About** with sources

Long-term: ongoing news coverage as the law plays out.

## Stack

Plain HTML5 + CSS + ES modules. **No build step**, no framework, no npm dependencies at runtime. The only npm usage is for linting.

```
sb79palo/
├── index.html, learn.html, palo-alto.html, faq.html, about.html
├── assets/
│   ├── css/site.css
│   ├── js/site.js
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

`assets/data/sb79.json` is the canonical source for SB 79 numbers. The `learn.html` tier table pulls from it. Update there first when laws change.

## Re-running the parcel computation

The per-parcel SB 79 inclusion data on `palo-alto.html` (maps + lookup widget) is precomputed by `scripts/compute-sb79-parcels.py`. It joins MTC's preliminary SB 79 TOD zones (fetched live from the public ArcGIS FeatureServer) with the City of Palo Alto's `ParcelReport` layer (a local gpkg export), and writes:

- `assets/data/sb79-parcels.json` — affected-parcel records used by the address lookup
- `assets/data/sb79-parcels.csv` — same data for download
- `assets/img/sb79-{univ,calave,sanantonio}-parcels.svg` — per-station parcel maps
- `scripts/sb79-stats.json` — counts per band per station (manually copy into the inline stats in `palo-alto.html` after re-running)

Re-run when MTC publishes updates or the City republishes ParcelReport:

```sh
python3 -m pip install -r scripts/requirements.txt
python3 scripts/compute-sb79-parcels.py --gpkg ~/Downloads/paloalto.gpkg
```

Requires Python 3.10+. The script uses `shapely`, `pyproj`, and `requests`; no system GDAL/OGR install needed (it parses GeoPackage geometry blobs in pure Python, including the `MultiSurface`/`CompoundCurve` wrappers the cadastral export uses).

## Disclaimer

Educational content only — not legal advice.
