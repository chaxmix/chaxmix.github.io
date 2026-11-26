/* RealInsight design system case study: token cascade, button matrix, theme slider, counters. */
(() => {
  // Token cascade: real RealInsight Light / Dark values per semantic token
  const TOK = {
    brand:   { light: '#1F8ACA', dark: '#44A5DE', name: 'Brand Blue' },
    text:    { light: '#2D3134', dark: '#F6F7F8', name: 'Neutral' },
    surface: { light: '#F9F9F9', dark: '#181A1D', name: 'Neutral' }
  };
  const cas = document.querySelector('[data-cascade]');
  const paint = (mode) => {
    if (!cas) return;
    cas.classList.toggle('is-dark', mode === 'dark');
    cas.querySelectorAll('[data-tok]').forEach(el => {
      const t = TOK[el.dataset.tok], hex = t[mode];
      el.style.background = hex;
      const lum = parseInt(hex.slice(1, 3), 16) * .3 + parseInt(hex.slice(3, 5), 16) * .59 + parseInt(hex.slice(5, 7), 16) * .11;
      el.style.color = lum > 150 ? '#16181a' : '#fff';
      el.textContent = hex;
    });
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  };
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => paint(b.dataset.mode)));
  paint('light');

  // Button matrix: 7 variants x 5 states at the chosen size (x2 icon styles = 280 in Figma)
  const VARS = ['Brand', 'Neutral', 'Tonal', 'Danger', 'Outline', 'Ghost', 'Link'];
  const STATES = ['Default', 'Hover', 'Loading', 'Disabled', 'Selected'];
  const mx = document.querySelector('[data-matrix]');
  const draw = (size) => {
    if (!mx) return;
    let h = '<span></span>' + STATES.map(s => `<span class="h">${s}</span>`).join('');
    VARS.forEach(v => {
      h += `<span class="h">${v}</span>`;
      STATES.forEach(s => {
        const cls = `ri-b ${size} ${v.toLowerCase()} ${s.toLowerCase()}`;
        const inner = s === 'Loading' ? '<span class="spin"></span>Saving' : 'Create invoice';
        h += `<span class="${cls}">${inner}</span>`;
      });
    });
    mx.innerHTML = h;
    document.querySelectorAll('[data-size]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.size === size)));
  };
  document.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => draw(b.dataset.size)));
  draw('sm');

  // Light / dark slider
  document.querySelectorAll('[data-slider]').forEach(s => {
    const r = s.querySelector('input');
    r.addEventListener('input', () => s.style.setProperty('--p', r.value + '%'));
  });

  // Counters tick up once when seen
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nums = document.querySelectorAll('[data-count]');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(end * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: .6 });
    nums.forEach(n => io.observe(n));
  }
})();
