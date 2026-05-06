// Pure-ish state container for the SB 79 simulator.
// Each parcel's chosen option key is tracked in `selections`.

import { PARCELS, TARGET_NEW_UNITS } from './parcels.js';

const listeners = new Set();
const initialSelections = Object.fromEntries(PARCELS.map((p) => [p.id, 'stay']));

const state = {
  selections: { ...initialSelections },
  outroShown: false,
};

export function getState() {
  return state;
}

export function getSelection(parcelId) {
  return state.selections[parcelId] || 'stay';
}

export function selectOption(parcelId, optionKey) {
  if (state.selections[parcelId] === optionKey) return;
  state.selections[parcelId] = optionKey;
  emit();
}

export function reset() {
  state.selections = { ...initialSelections };
  state.outroShown = false;
  emit();
}

export function markOutroShown() {
  state.outroShown = true;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) fn(state);
}

export { TARGET_NEW_UNITS };
