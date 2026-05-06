// SB 79 lookups — sourced from assets/data/sb79.json (single source of truth).
// Loaded once at game start.

let TIERS = null;

export async function loadRules() {
  if (TIERS) return TIERS;
  const res = await fetch('assets/data/sb79.json');
  if (!res.ok) throw new Error('Could not load sb79.json');
  const data = await res.json();
  TIERS = Object.fromEntries(data.tiers.map((t) => [t.id, t]));
  return TIERS;
}

export function getTier(ringId) {
  if (!TIERS) throw new Error('Rules not loaded — call loadRules() first');
  return TIERS[ringId] || null;
}

export function ringDescription(ringId) {
  const t = getTier(ringId);
  if (!t) return 'Outside the SB 79 affected area';
  return t.label;
}

export function ringHumanLimit(ringId) {
  const t = getTier(ringId);
  if (!t) return '—';
  const far = t.maxFar ? `, FAR ${t.maxFar}` : '';
  return `up to ${t.maxHeightFt} ft · ${t.maxDensityUnitsPerAcre} units/acre${far} (~${t.approxStories} stories)`;
}
