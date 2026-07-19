# sb79-tier-determination

Computes SB 79 tier (Tier 1 / Tier 2 / below threshold) for one or more
California transit stations from a published GTFS feed, using the HCD MPO
advisory thresholds (≥72 trains/weekday = Tier 1, 48–71 = Tier 2).

## Quick start

```bash
node ~/.claude/skills/sb79-tier-determination/compute-tiers.mjs \
     --config ~/.claude/skills/sb79-tier-determination/example-config.json
```

This will:
1. Download Caltrain's GTFS feed.
2. Find Palo Alto / University Ave, California Ave, and San Antonio Caltrain
   stations by `stop_name` regex.
3. Count weekday scheduled stops at each, sum across both directions, divide
   by 5.
4. Apply HCD thresholds and write a `station-tiers.json` file alongside the
   config.

## Adapting to other stations / feeds

Copy `example-config.json` and edit the `gtfs_url`, `stations`, and
`output_path` fields. The `match_pattern` field is a JS regex matched
case-insensitively against the GTFS `stops.stop_name` column.

## Requirements

- Node ≥ 18 (for built-in `fetch`-style modules; the script uses `node:https` and `node:fs` only)
- `unzip` on PATH (macOS / Linux ships this; Windows users need to install)
- No npm install needed

## Example output

```json
{
  "computed_at": "2026-05-06T...",
  "gtfs_source": { "url": "https://www.caltrain.com/files/google_transit.zip", ... },
  "thresholds": { "tier_1_min_avg_per_weekday": 72, "tier_2_min_avg_per_weekday": 48 },
  "stations": [
    {
      "input_name": "Palo Alto / University Ave Caltrain",
      "weekday_stops_per_day": { "total_5_day": 520, "average": 104 },
      "tier": "1",
      "tier_explanation": "Average 104.0 trains/weekday ≥ 72 → Tier 1 (very high frequency commuter rail)"
    }
  ]
}
```

## See also

- `SKILL.md` — full spec, when-to-use, algorithm, output schema
- HCD MPO advisory: https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/sb-79-mpo-advisory.pdf
- GTFS reference: https://gtfs.org/schedule/reference/
