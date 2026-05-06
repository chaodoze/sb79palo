// Render the parcels (SVG) and HUD (DOM) for the simulator.

import { PARCELS } from './parcels.js';
import { getSelection, selectOption, subscribe } from './state.js';
import { computeMeters } from './meters.js';
import { getTier, ringHumanLimit } from './rules.js';

const RING_FILLS = {
  adjacent: '#fff7e6',
  quarter:  '#f1f7ee',
  half:     '#f9f6ee',
};
const RING_STROKES = {
  adjacent: '#b14a23',
  quarter:  '#1f6f4e',
  half:     '#7c7868',
};
const STATE_FILLS = {
  stay:    '#e7e2d2',
  midrise: '#a8d6bf',
  max:     '#1f6f4e',
};

let onParcelClick = () => {};

export function bindParcelClick(handler) {
  onParcelClick = handler;
}

export function renderParcels(svgRoot) {
  const layer = svgRoot.querySelector('#parcel-layer');
  layer.innerHTML = '';

  for (const p of PARCELS) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'parcel');
    g.setAttribute('data-parcel-id', p.id);
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${p.name}, ${p.currentLabel}`);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', p.x);
    rect.setAttribute('y', p.y);
    rect.setAttribute('width', p.w);
    rect.setAttribute('height', p.h);
    rect.setAttribute('rx', '4');
    rect.setAttribute('class', 'parcel-rect');
    rect.setAttribute('fill', RING_FILLS[p.ring]);
    rect.setAttribute('stroke', RING_STROKES[p.ring]);
    rect.setAttribute('stroke-width', '1.4');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', p.x + p.w / 2);
    label.setAttribute('y', p.y + p.h / 2 + 4);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'parcel-label');
    label.textContent = labelFor(p, getSelection(p.id));

    g.appendChild(rect);
    g.appendChild(label);
    g.addEventListener('click', () => onParcelClick(p));
    g.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        onParcelClick(p);
      }
    });
    layer.appendChild(g);
  }

  syncParcels(svgRoot);
}

function labelFor(p, choice) {
  const opt = p.options.find((o) => o.key === choice) || p.options[0];
  if (choice === 'stay') return shortName(p.name);
  return `${shortName(p.name)} · ${opt.stories}st · ${opt.units}u`;
}

function shortName(name) {
  return name.length > 18 ? name.slice(0, 17) + '…' : name;
}

export function syncParcels(svgRoot) {
  for (const p of PARCELS) {
    const g = svgRoot.querySelector(`[data-parcel-id="${p.id}"]`);
    if (!g) continue;
    const choice = getSelection(p.id);
    const rect = g.querySelector('rect');
    const label = g.querySelector('text');
    rect.setAttribute('fill', choice === 'stay' ? RING_FILLS[p.ring] : STATE_FILLS[choice]);
    label.textContent = labelFor(p, choice);
    label.setAttribute(
      'fill',
      choice === 'max' ? '#fbfaf6' : '#1c1c1a',
    );
  }
}

export function renderHUD(meters, target) {
  document.querySelector('[data-meter="homes"] .value').textContent =
    meters.newUnits.toLocaleString();
  document.querySelector('[data-meter="homes"] .target').textContent =
    `/ ${target.toLocaleString()}`;
  document.querySelector('[data-meter="homes"] .bar-fill').style.width =
    `${Math.min(100, (meters.newUnits / target) * 100).toFixed(1)}%`;

  document.querySelector('[data-meter="vibrancy"] .value').textContent =
    `${meters.vibrancy}`;
  document.querySelector('[data-meter="vibrancy"] .bar-fill').style.width =
    `${meters.vibrancy}%`;

  document.querySelector('[data-meter="carbon"] .value').textContent =
    meters.carbonTons.toLocaleString();
}

export function openParcelPopup(parcel, anchor) {
  closePopup();
  const popup = document.getElementById('parcel-popup');
  const tier = getTier(parcel.ring);
  const limit = ringHumanLimit(parcel.ring);
  const ringName = parcel.ring === 'adjacent' ? 'within 200 ft of station' :
                   parcel.ring === 'quarter'  ? 'within ¼ mile of station' :
                   'within ½ mile of station';

  popup.innerHTML = `
    <button class="popup-close" aria-label="Close">×</button>
    <header>
      <h3>${escapeHtml(parcel.name)}</h3>
      <p class="popup-ring">${ringName}</p>
    </header>
    <p class="popup-blurb">${escapeHtml(parcel.blurb)}</p>
    <p class="popup-current"><strong>Today:</strong> ${escapeHtml(parcel.currentLabel)} · ${parcel.currentUnits} home${parcel.currentUnits === 1 ? '' : 's'}</p>
    <p class="popup-limit"><strong>SB 79 here:</strong> ${escapeHtml(limit)}${tier && tier.maxHeightFt > 85 ? ' <span class="tag">labor std applies above 85 ft</span>' : ''}</p>
    <div class="popup-options" role="radiogroup" aria-label="Build option">
      ${parcel.options.map((opt) => {
        const checked = getSelection(parcel.id) === opt.key;
        const delta = opt.units - parcel.currentUnits;
        const deltaLabel = delta > 0 ? `+${delta} homes` : (delta < 0 ? `${delta} homes` : 'no change');
        return `
          <button class="popup-option ${checked ? 'is-selected' : ''}" data-option="${opt.key}" role="radio" aria-checked="${checked}">
            <span class="opt-label">${escapeHtml(opt.label)}</span>
            <span class="opt-meta">${opt.stories} stor${opt.stories === 1 ? 'y' : 'ies'} · ${deltaLabel}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;

  popup.classList.add('is-open');
  popup.setAttribute('aria-hidden', 'false');
  positionPopup(popup, anchor);

  popup.querySelector('.popup-close').addEventListener('click', closePopup);
  popup.querySelectorAll('.popup-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectOption(parcel.id, btn.dataset.option);
      openParcelPopup(parcel, anchor); // re-render selection state
    });
  });

  document.addEventListener('click', outsideClickListener, true);
  document.addEventListener('keydown', escListener);
}

function outsideClickListener(ev) {
  const popup = document.getElementById('parcel-popup');
  if (!popup.contains(ev.target) && !ev.target.closest('.parcel')) {
    closePopup();
  }
}

function escListener(ev) {
  if (ev.key === 'Escape') closePopup();
}

export function closePopup() {
  const popup = document.getElementById('parcel-popup');
  popup.classList.remove('is-open');
  popup.setAttribute('aria-hidden', 'true');
  popup.innerHTML = '';
  document.removeEventListener('click', outsideClickListener, true);
  document.removeEventListener('keydown', escListener);
}

function positionPopup(popup, anchor) {
  const stage = document.getElementById('game-stage');
  const stageRect = stage.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();

  const left = anchorRect.left - stageRect.left + anchorRect.width / 2;
  const top  = anchorRect.bottom - stageRect.top + 8;

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function setupMeterSubscription(target) {
  const update = (s) => renderHUD(computeMeters(s), target);
  subscribe((s) => {
    const svg = document.getElementById('game-svg');
    if (svg) syncParcels(svg);
    update(s);
  });
}
