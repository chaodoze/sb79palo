// Game entry point. Wires data, state, render, and modals together.

import { loadRules } from './rules.js';
import {
  bindParcelClick, renderParcels, openParcelPopup, setupMeterSubscription,
  renderHUD,
} from './render.js';
import { computeMeters } from './meters.js';
import { getState, subscribe, TARGET_NEW_UNITS } from './state.js';
import { showIntro, showOutro } from './intro.js';

async function boot() {
  await loadRules();

  const svg = document.getElementById('game-svg');
  bindParcelClick((parcel) => {
    const node = svg.querySelector(`[data-parcel-id="${parcel.id}"]`);
    openParcelPopup(parcel, node);
  });
  renderParcels(svg);

  setupMeterSubscription(TARGET_NEW_UNITS);
  renderHUD(computeMeters(getState()), TARGET_NEW_UNITS);

  // Trigger outro the moment we hit the target — but only once per session.
  subscribe((s) => {
    const m = computeMeters(s);
    if (!s.outroShown && m.newUnits >= TARGET_NEW_UNITS) {
      showOutro(m);
    }
  });

  // Intro on first visit.
  showIntro();

  // Reset button on the HUD.
  document.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
    import('./state.js').then((m) => m.reset());
  });
}

boot().catch((err) => {
  console.error('Game failed to boot:', err);
  const stage = document.getElementById('game-stage');
  if (stage) {
    stage.innerHTML = '<p style="padding:2rem;text-align:center;">Sorry — couldn\'t load the simulator. Try refreshing.</p>';
  }
});
