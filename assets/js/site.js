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
