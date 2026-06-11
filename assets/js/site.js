// Mark the active nav link based on current pathname.
(function highlightNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/index.html';
  const file = path.endsWith('/') ? '/index.html' : path.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (
      href === file ||
      (file === '' && href === 'index.html') ||
      (file === 'index.html' && href === './') ||
      (path === '/' && href === 'index.html')
    ) {
      a.classList.add('is-active');
    }
  });
})();

// Keep glossary-term popovers inside the viewport: on hover/focus, shift the
// popover (via --tt-shift) so it never clips at the left or right edge.
(function clampTermPopovers() {
  const MARGIN = 12;
  document.querySelectorAll('a.term[data-def]').forEach((term) => {
    const clamp = () => {
      const half = Math.min(380, window.innerWidth * 0.8) / 2;
      const rect = term.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      let shift = 0;
      if (center - half < MARGIN) shift = MARGIN - (center - half);
      else if (center + half > window.innerWidth - MARGIN) shift = (window.innerWidth - MARGIN) - (center + half);
      term.style.setProperty('--tt-shift', `${shift}px`);
    };
    term.addEventListener('mouseenter', clamp);
    term.addEventListener('focus', clamp);
  });
})();

// Reveal-on-scroll: any element with the `reveal` class fades + slides into
// place once it enters the viewport. Honors prefers-reduced-motion.
(function revealOnScroll() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  els.forEach((el) => io.observe(el));
})();
