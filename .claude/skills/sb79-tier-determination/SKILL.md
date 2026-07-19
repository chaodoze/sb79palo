---
name: sb79-tier-determination
description: Determine SB 79 tier (Tier 1, Tier 2, or below threshold) for one or more California transit stations by counting weekday scheduled stops in a published GTFS feed against the HCD MPO advisory thresholds (≥72 trains/weekday = Tier 1, 48–71 = Tier 2). Use when a user asks to verify, compute, or explain which tier a CA rail/transit station qualifies for under SB 79, or when building a methodology page that walks readers through the calculation.
---

# SB 79 tier determination from GTFS

This skill computes whether a California transit station qualifies as **SB 79 Tier 1**, **Tier 2**, or **below threshold** based on its scheduled weekday service in a published GTFS feed.

## When to use

- A user asks "is the X Caltrain / BART / VTA / Metrolink / etc. station Tier 1?"
- A user wants to know how many weekday trains stop at a given station
- Building a methodology page that has to show the working
- Cross-checking ABAG/MTC, SCAG, SACOG, or SANDAG's regional SB 79 maps

## What the law actually requires

From the **HCD MPO advisory dated March 20, 2026** (Housing Policy Development Division, "SB 79 Advisory: Clarifications on Definitions for Metropolitan Planning Organizations"):

> **Very high frequency commuter rail** = a commuter rail service operating an average of at least **72 trains per weekday** across all directions at any point in the past three years, not including temporary service changes of less than one month or unplanned disruptions. (Gov. Code §65912.156(r))
>
> **High frequency commuter rail** = at least **48 trains per weekday** across both directions, not meeting the very-high-frequency standard. (Gov. Code §65912.156(e))
>
> "The average is the sum of the number of scheduled stops at a station for a commuter rail service for all weekdays, divided by **five weekdays**."
>
> "Frequency is based on the total number of trains serving the station, including trains operated by multiple commuter rail services where applicable."
>
> A passenger rail station **occupying one physical location counts as a single station, even if multiple rail services utilize the station** (HCD advisory p.5).

**Decision logic:**
- avg ≥ 72 → **Tier 1**
- 48 ≤ avg < 72 → **Tier 2**
- avg < 48 → not a TOD stop based on rail frequency alone

For heavy rail (BART, LA Metro B/D), the station is **always Tier 1** regardless of frequency — the law treats heavy rail differently from commuter rail. This skill is primarily for commuter rail. For light rail (VTA, Muni Metro, SacRT, etc.), a station qualifies as Tier 2 simply by being served by light rail.

## Algorithm

1. Download `gtfs_url` to a temp file.
2. Unzip to a temp directory (uses `child_process.execSync('unzip -o ...')`).
3. Parse `stops.txt`. For each entry in the config's `stations`, find rows whose `stop_name` matches the regex (case-insensitive). Group child stops under their parent_station if present (HCD: one physical location = one station).
4. Parse `calendar.txt`. Identify `service_id`s where `monday=tuesday=wednesday=thursday=friday=1`. If multiple weekday-active service_ids exist, prefer the one whose date range covers today.
5. Parse `trips.txt`. Build a Set of `trip_id`s belonging to the weekday service_ids.
6. Stream `stop_times.txt`. For each row, if `stop_id` is in the target set AND `trip_id` is in the weekday trip set, increment a per-station counter.
7. Sum counters across all stop_ids belonging to one physical station. That's the M+T+W+Th+F total. Divide by 5 → average per weekday.
8. Apply HCD thresholds → tier verdict.

## How to run

```bash
node ~/.claude/skills/sb79-tier-determination/compute-tiers.mjs \
     --config /path/to/config.json
```

Or programmatically:

```js
import { computeTiers } from '~/.claude/skills/sb79-tier-determination/compute-tiers.mjs';
const result = await computeTiers({ gtfs_url, stations, output_path });
```

## Config schema

```json
{
  "gtfs_url": "https://...",
  "stations": [
    { "name": "Display name", "match_pattern": "regex against stop_name" }
  ],
  "output_path": "./station-tiers.json",
  "cache_dir": "/tmp/gtfs-cache"   // optional
}
```

`match_pattern` is matched **case-insensitively** against `stops.stop_name`. Use a tight pattern (e.g. `"^Palo Alto Caltrain$"`) to avoid matching nearby stations with similar names.

## Output JSON shape

```json
{
  "computed_at": "2026-05-06T12:34:56.000Z",
  "gtfs_source": {
    "url": "...",
    "feed_publisher": "...",
    "feed_version": "...",
    "feed_start_date": "YYYYMMDD",
    "feed_end_date": "YYYYMMDD",
    "downloaded_at": "..."
  },
  "thresholds": {
    "tier_1_min_avg_per_weekday": 72,
    "tier_2_min_avg_per_weekday": 48,
    "source": "HCD MPO advisory, March 20, 2026, p.4"
  },
  "stations": [
    {
      "input_name": "...",
      "match_pattern": "...",
      "matched_gtfs_stop_ids": ["..."],
      "matched_gtfs_stop_name": "...",
      "weekday_stops_per_day": {
        "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0,
        "total_5_day": 0, "average": 0
      },
      "service_ids_used": ["..."],
      "tier": "1" | "2" | "below-threshold",
      "tier_explanation": "..."
    }
  ]
}
```

## Caveats to surface to the reader

- **Past-3-years rule.** The HCD advisory says a station qualifies if it met the threshold "at any point in the past three years." This skill computes against the *current* GTFS feed only. If a station's historical service was higher than current, you'd need to pull historical GTFS archives to fully verify. For Caltrain (post-electrification 2024 service is the highest ever), this doesn't flip a verdict.
- **`pickup_type=1` rows** (no boarding) are counted because the law says "scheduled stops at a station" with no exclusion for no-boarding stops. Document this choice.
- **Calendar exceptions.** `calendar_dates.txt` one-off cancellations are **not** subtracted from the typical-week count.

## See also

- [HCD MPO advisory PDF](https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/sb-79-mpo-advisory.pdf)
- [Bill text — leginfo](https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB79) — Gov. Code §§65912.155–65912.162
- [GTFS reference](https://gtfs.org/schedule/reference/)
