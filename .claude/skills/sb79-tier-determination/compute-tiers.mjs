#!/usr/bin/env node
// SB 79 tier determination from GTFS.
// Reads a config JSON, downloads + parses a GTFS feed, counts weekday
// scheduled stops per station, and writes a verdict JSON.
//
// Usage:
//   node compute-tiers.mjs --config path/to/config.json
//
// Or programmatically:
//   import { computeTiers } from './compute-tiers.mjs';
//   await computeTiers(configObject);

import { createWriteStream, mkdtempSync, readFileSync, writeFileSync, existsSync, createReadStream, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { request } from 'node:https';
import { request as httpRequest } from 'node:http';
import { URL } from 'node:url';
import { createInterface } from 'node:readline';

const TIER_1_MIN = 72;
const TIER_2_MIN = 48;

function downloadToFile(url, dest, redirectsLeft = 5) {
  return new Promise((resolveP, rejectP) => {
    const u = new URL(url);
    const req = (u.protocol === 'http:' ? httpRequest : request)(
      { method: 'GET', host: u.host, path: u.pathname + u.search, headers: { 'User-Agent': 'sb79-tier-skill/1.0' } },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          if (redirectsLeft <= 0) return rejectP(new Error('too many redirects'));
          const next = new URL(res.headers.location, url).href;
          res.resume();
          return resolveP(downloadToFile(next, dest, redirectsLeft - 1));
        }
        if (res.statusCode !== 200) {
          return rejectP(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const out = createWriteStream(dest);
        res.pipe(out);
        out.on('finish', () => out.close(() => resolveP(dest)));
        out.on('error', rejectP);
      }
    );
    req.on('error', rejectP);
    req.end();
  });
}

// Minimal CSV parser for GTFS files. Handles quoted fields with embedded commas / quotes.
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuote) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQuote = false; }
      else { cur += c; }
    } else {
      if (c === '"') inQuote = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

function readCsv(path) {
  const text = readFileSync(path, 'utf8').replace(/^﻿/, '');
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((l) => {
    const cells = parseCsvLine(l);
    const obj = {};
    for (let i = 0; i < header.length; i++) obj[header[i]] = cells[i] ?? '';
    return obj;
  });
  return { header, rows };
}

// Streamed reader for large stop_times.txt — yields row objects without holding all in memory.
async function* streamCsv(path) {
  const stream = createReadStream(path, { encoding: 'utf8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  let header = null;
  for await (const rawLine of rl) {
    const line = header === null ? rawLine.replace(/^﻿/, '') : rawLine;
    if (line.length === 0) continue;
    if (header === null) {
      header = parseCsvLine(line).map((h) => h.trim());
      continue;
    }
    const cells = parseCsvLine(line);
    const obj = {};
    for (let i = 0; i < header.length; i++) obj[header[i]] = cells[i] ?? '';
    yield obj;
  }
}

function todayYYYYMMDD() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export async function computeTiers(config) {
  const { gtfs_url, stations, output_path, cache_dir } = config;
  if (!gtfs_url || !Array.isArray(stations) || !output_path) {
    throw new Error('config requires gtfs_url, stations[], output_path');
  }

  const workDir = cache_dir
    ? (existsSync(cache_dir) ? cache_dir : (execSync(`mkdir -p "${cache_dir}"`), cache_dir))
    : mkdtempSync(join(tmpdir(), 'gtfs-'));
  const zipPath = join(workDir, 'gtfs.zip');
  const extractDir = join(workDir, 'extracted');

  console.error(`[1/8] Downloading ${gtfs_url} → ${zipPath}`);
  await downloadToFile(gtfs_url, zipPath);
  const zipSize = statSync(zipPath).size;
  console.error(`     done (${(zipSize / 1024).toFixed(0)} KB)`);

  console.error(`[2/8] Unzipping → ${extractDir}`);
  execSync(`mkdir -p "${extractDir}" && unzip -o -q "${zipPath}" -d "${extractDir}"`);

  // Optional feed metadata
  let feedInfo = {};
  const feedInfoPath = join(extractDir, 'feed_info.txt');
  if (existsSync(feedInfoPath)) {
    const { rows } = readCsv(feedInfoPath);
    feedInfo = rows[0] ?? {};
  }

  console.error(`[3/8] Parsing stops.txt`);
  const stopsParsed = readCsv(join(extractDir, 'stops.txt'));
  const stopsRows = stopsParsed.rows;

  // For each station in config, find matching stop_ids.
  const stationMatches = stations.map((s) => {
    const re = new RegExp(s.match_pattern, 'i');
    const matched = stopsRows.filter((r) => re.test(r.stop_name));
    // If matched stops have parent_station, expand to include the parent's children too.
    const parentIds = new Set(matched.map((r) => r.parent_station).filter(Boolean));
    const expanded = parentIds.size > 0
      ? stopsRows.filter((r) => parentIds.has(r.stop_id) || parentIds.has(r.parent_station) || matched.includes(r))
      : matched;
    const ids = new Set(expanded.map((r) => r.stop_id));
    return {
      input_name: s.name,
      match_pattern: s.match_pattern,
      matched_gtfs_stop_ids: [...ids],
      matched_gtfs_stop_name: matched[0]?.stop_name ?? null,
      stopIdSet: ids,
    };
  });

  for (const sm of stationMatches) {
    if (sm.matched_gtfs_stop_ids.length === 0) {
      console.error(`     ⚠ no GTFS stop matched pattern /${sm.match_pattern}/i for "${sm.input_name}"`);
    } else {
      console.error(`     ✓ ${sm.input_name} → ${sm.matched_gtfs_stop_ids.length} stop_id(s) [${sm.matched_gtfs_stop_ids.join(', ')}]`);
    }
  }

  console.error(`[4/8] Parsing calendar.txt — finding weekday service_ids`);
  const today = todayYYYYMMDD();
  const calendarPath = join(extractDir, 'calendar.txt');
  // serviceDayMap[service_id] = { Mon: 1, Tue: 1, ... } — only for services with ≥1 weekday active
  const serviceDayMap = new Map();
  if (existsSync(calendarPath)) {
    const { rows } = readCsv(calendarPath);
    const weekdayDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const dayKey = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri' };
    for (const r of rows) {
      const days = {};
      let any = false;
      for (const d of weekdayDays) {
        const active = r[d] === '1';
        days[dayKey[d]] = active ? 1 : 0;
        if (active) any = true;
      }
      if (!any) continue;
      // Only keep services covering today (or fall back to all weekday-active if none cover today)
      const covers = r.start_date <= today && r.end_date >= today;
      serviceDayMap.set(r.service_id, { ...days, _covers_today: covers, _start: r.start_date, _end: r.end_date });
    }
    const covering = [...serviceDayMap.entries()].filter(([, v]) => v._covers_today);
    if (covering.length > 0) {
      // drop non-covering ones
      for (const sid of [...serviceDayMap.keys()]) {
        if (!serviceDayMap.get(sid)._covers_today) serviceDayMap.delete(sid);
      }
    }
    console.error(`     ✓ ${serviceDayMap.size} weekday-active service_id(s): ${[...serviceDayMap.keys()].join(', ')}`);
  } else {
    console.error('     ⚠ no calendar.txt found — falling back to calendar_dates.txt only (not yet implemented)');
  }

  console.error(`[5/8] Parsing trips.txt — mapping trip_id → service_id`);
  const tripsParsed = readCsv(join(extractDir, 'trips.txt'));
  const tripToService = new Map();
  for (const t of tripsParsed.rows) {
    if (serviceDayMap.has(t.service_id)) tripToService.set(t.trip_id, t.service_id);
  }
  console.error(`     ✓ ${tripToService.size} weekday trips`);

  console.error(`[6/8] Streaming stop_times.txt — counting per-station per-day weekday stops`);
  // counters[stop_id][day] = count
  const counters = new Map();
  for (const sm of stationMatches) for (const id of sm.stopIdSet) {
    counters.set(id, { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 });
  }
  let rowsScanned = 0;
  for await (const row of streamCsv(join(extractDir, 'stop_times.txt'))) {
    rowsScanned++;
    const sid = row.stop_id;
    if (!counters.has(sid)) continue;
    const serviceId = tripToService.get(row.trip_id);
    if (!serviceId) continue;
    const days = serviceDayMap.get(serviceId);
    const c = counters.get(sid);
    if (days.Mon) c.Mon++;
    if (days.Tue) c.Tue++;
    if (days.Wed) c.Wed++;
    if (days.Thu) c.Thu++;
    if (days.Fri) c.Fri++;
  }
  console.error(`     ✓ scanned ${rowsScanned.toLocaleString()} stop_times rows`);

  console.error(`[7/8] Aggregating per station and applying HCD thresholds`);
  const stationsOut = stationMatches.map((sm) => {
    const totals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
    for (const id of sm.stopIdSet) {
      const c = counters.get(id);
      if (!c) continue;
      totals.Mon += c.Mon; totals.Tue += c.Tue; totals.Wed += c.Wed;
      totals.Thu += c.Thu; totals.Fri += c.Fri;
    }
    const total = totals.Mon + totals.Tue + totals.Wed + totals.Thu + totals.Fri;
    const avg = total / 5;
    let tier, explanation;
    if (avg >= TIER_1_MIN) {
      tier = '1';
      explanation = `Average ${avg.toFixed(1)} trains/weekday ≥ ${TIER_1_MIN} → Tier 1 (very high frequency commuter rail)`;
    } else if (avg >= TIER_2_MIN) {
      tier = '2';
      explanation = `Average ${avg.toFixed(1)} trains/weekday in [${TIER_2_MIN}, ${TIER_1_MIN}) → Tier 2 (high frequency commuter rail)`;
    } else {
      tier = 'below-threshold';
      explanation = `Average ${avg.toFixed(1)} trains/weekday < ${TIER_2_MIN} → not a TOD stop on rail-frequency grounds (could still qualify via bus)`;
    }
    return {
      input_name: sm.input_name,
      match_pattern: sm.match_pattern,
      matched_gtfs_stop_ids: sm.matched_gtfs_stop_ids,
      matched_gtfs_stop_name: sm.matched_gtfs_stop_name,
      weekday_stops_per_day: {
        Mon: totals.Mon, Tue: totals.Tue, Wed: totals.Wed, Thu: totals.Thu, Fri: totals.Fri,
        total_5_day: total,
        average: avg,
      },
      service_ids_used: [...serviceDayMap.keys()],
      tier,
      tier_explanation: explanation,
    };
  });

  for (const s of stationsOut) console.error(`     • ${s.input_name}: total ${s.weekday_stops_per_day.total_5_day} → avg ${s.weekday_stops_per_day.average.toFixed(1)}/wd → Tier ${s.tier}`);

  console.error(`[8/8] Writing ${output_path}`);
  const out = {
    computed_at: new Date().toISOString(),
    gtfs_source: {
      url: gtfs_url,
      feed_publisher: feedInfo.feed_publisher_name ?? null,
      feed_version: feedInfo.feed_version ?? null,
      feed_start_date: feedInfo.feed_start_date ?? null,
      feed_end_date: feedInfo.feed_end_date ?? null,
      downloaded_at: new Date().toISOString(),
    },
    thresholds: {
      tier_1_min_avg_per_weekday: TIER_1_MIN,
      tier_2_min_avg_per_weekday: TIER_2_MIN,
      source: 'HCD MPO advisory, March 20, 2026, p.4',
    },
    stations: stationsOut,
  };
  writeFileSync(resolve(output_path), JSON.stringify(out, null, 2) + '\n');
  console.error(`     ✓ done`);
  return out;
}

// CLI
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--config');
  if (idx === -1 || !args[idx + 1]) {
    console.error('Usage: node compute-tiers.mjs --config path/to/config.json');
    process.exit(2);
  }
  const configPath = resolve(args[idx + 1]);
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  // Resolve output_path relative to the config file's directory if not absolute
  if (!config.output_path.startsWith('/')) {
    config.output_path = resolve(configPath, '..', config.output_path);
  }
  computeTiers(config).catch((err) => {
    console.error('FAILED:', err.message);
    process.exit(1);
  });
}
