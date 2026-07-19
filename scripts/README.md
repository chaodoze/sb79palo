# scripts/

## Refresh `station-tiers.json`

The `tier-analysis.html` page reads `assets/data/station-tiers.json`, which is computed by the [`sb79-tier-determination` skill](https://github.com/) at `.claude/skills/sb79-tier-determination/`.

To recompute against the latest Caltrain GTFS feed:

```bash
node .claude/skills/sb79-tier-determination/compute-tiers.mjs \
     --config scripts/compute-tiers.config.json
```

This will:
1. Download Caltrain's GTFS zip from Trillium (Caltrain's vendor).
2. Parse weekday service against the three Palo Alto Caltrain stations.
3. Apply the HCD MPO advisory thresholds (≥72 = Tier 1, 48–71 = Tier 2).
4. Write `../assets/data/station-tiers.json`.

Then commit the updated JSON.

## Why this is a skill, not a project script

The skill at `.claude/skills/sb79-tier-determination/` is config-driven, so the same
calculation serves any station set — a future portal for Mountain View, Sunnyvale, or
Berkeley just needs a different config, not a forked script. It lives in this repo
(rather than `~/.claude/skills/`) so it version-controls and deploys with the site;
copy the directory if another project needs it.

## Future work

- A scheduled job that re-runs the script when Caltrain publishes a new GTFS feed (Trillium typically updates a few weeks before each schedule change).
- Historical GTFS verification (HCD's "any point in the past three years" rule).
