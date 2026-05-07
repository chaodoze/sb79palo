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
