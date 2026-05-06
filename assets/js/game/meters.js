// Heuristic meters. Deliberately rough — directional, not predictive.
// "Carbon" assumes ~3 metric tons CO2/year avoided per new home near Tier 1 transit
// (vs. an equivalent unit in a car-dependent location). It is a teaching number.

import { PARCELS } from './parcels.js';

const CARBON_TONS_PER_NEW_UNIT = 3;

function findOption(parcel, key) {
  return parcel.options.find((o) => o.key === key) || parcel.options[0];
}

export function computeMeters(state) {
  let newUnits = 0;
  let mixedUseQuarter = 0;
  let totalQuarter = 0;
  let upgradedAdjacent = 0;
  let totalAdjacent = 0;

  for (const p of PARCELS) {
    const choice = state.selections[p.id] || 'stay';
    const opt = findOption(p, choice);
    const delta = Math.max(0, opt.units - p.currentUnits);
    newUnits += delta;

    if (p.ring === 'quarter') {
      totalQuarter += 1;
      if (opt.mixedUse && opt.stories >= 3) mixedUseQuarter += 1;
    }
    if (p.ring === 'adjacent') {
      totalAdjacent += 1;
      if (opt.units > p.currentUnits) upgradedAdjacent += 1;
    }
  }

  // Vibrancy: walkable mixed-use density inside the ¼ mile ring,
  // with a small bonus for activating adjacent station-area parcels.
  const quarterShare = totalQuarter ? mixedUseQuarter / totalQuarter : 0;
  const adjacentShare = totalAdjacent ? upgradedAdjacent / totalAdjacent : 0;
  const vibrancy = Math.min(100, Math.round(quarterShare * 80 + adjacentShare * 20));

  const carbonTons = Math.round(newUnits * CARBON_TONS_PER_NEW_UNIT);

  return { newUnits, vibrancy, carbonTons, mixedUseQuarter, totalQuarter };
}
