// Intro and outro modals.

import { reset, markOutroShown } from './state.js';

export function showIntro() {
  const modal = document.getElementById('intro-modal');
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  const startBtn = modal.querySelector('[data-action="start"]');
  startBtn.focus();
  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  };
  startBtn.addEventListener('click', close, { once: true });
}

export function showOutro(stats) {
  const modal = document.getElementById('outro-modal');
  modal.querySelector('[data-stat="homes"]').textContent =
    stats.newUnits.toLocaleString();
  modal.querySelector('[data-stat="vibrancy"]').textContent =
    `${stats.vibrancy}`;
  modal.querySelector('[data-stat="carbon"]').textContent =
    stats.carbonTons.toLocaleString();
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  markOutroShown();

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  };
  modal.querySelector('[data-action="close"]').addEventListener('click', close, { once: true });
  modal.querySelector('[data-action="reset"]').addEventListener('click', () => {
    close();
    reset();
  }, { once: true });
}
