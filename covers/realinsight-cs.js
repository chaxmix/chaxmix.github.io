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
        const inner = s === 'Loading' ? '<span class="spin"></span>Saving' : 'Create';
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

/* Round 2: live component playground and adoption grid */
(() => {
  const card = document.querySelector('.ri-card');
  if (card) {
    card.querySelectorAll('[data-ptheme]').forEach(b => b.addEventListener('click', () => {
      card.classList.toggle('is-dark', b.dataset.ptheme === 'dark');
      card.querySelectorAll('[data-ptheme]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));
    const btn = card.querySelector('[data-create]'), alert = card.querySelector('.ri-alert');
    let busy = false;
    card.addEventListener('submit', e => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      btn.innerHTML = '<span class="spin"></span>Creating';
      alert.hidden = true;
      setTimeout(() => {
        const amt = card.querySelector('#ri-amt').value || '0.00';
        const terms = card.querySelector('#ri-terms').value;
        const send = card.querySelector('#ri-send').checked;
        alert.textContent = `Invoice for $${amt} created, ${terms}.` + (send ? ' Sent to borrower.' : ' Saved as draft.');
        alert.hidden = false;
        btn.textContent = 'Create invoice';
        busy = false;
      }, 1100);
    });
    card.addEventListener('reset', () => { alert.hidden = true; });
  }
  const ad = document.querySelector('[data-adopt]');
  if (ad) {
    const N = 100, NEW = 25;
    // seeded order so new cells cluster like real areas of the product moving over
    let s = 7; const r = () => (s = s * 16807 % 2147483647) / 2147483647;
    const key = [...Array(N).keys()].map(a => Math.floor(a / 20) * .15 + (a % 20) / 20 + r() * .6);
    const order = [...Array(N).keys()].sort((a, b) => key[a] - key[b]);
    ad.innerHTML = '<i></i>'.repeat(N);
    const cells = ad.children;
    const fill = () => order.slice(0, NEW).forEach((k, i) => setTimeout(() => cells[k].classList.add('new'), i * 40));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) order.slice(0, NEW).forEach(k => cells[k].classList.add('new'));
    else { const io2 = new IntersectionObserver(es => { if (es[0].isIntersecting) { io2.disconnect(); fill(); } }, { threshold: .5 }); io2.observe(ad); }
  }
})();

/* Round 3: side nav follows the section you're reading */
(() => {
  const toc = document.querySelector('.ri-toc');
  if (!toc || !('IntersectionObserver' in window)) return;
  const links = [...toc.querySelectorAll('[data-toc]')], subs = [...toc.querySelectorAll('[data-toc-sub]')];
  const secs = links.map(a => document.getElementById(a.dataset.toc)).filter(Boolean);
  const subSecs = subs.map(a => document.getElementById(a.dataset.tocSub)).filter(Boolean);
  const pick = (els) => { let cur = els[0]; for (const el of els) if (el.getBoundingClientRect().top < innerHeight * .35) cur = el; return cur; };
  let raf = 0;
  const update = () => {
    raf = 0;
    const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    const cur = atEnd ? secs[secs.length - 1] : pick(secs);
    links.forEach(a => { const on = a.dataset.toc === cur.id; a.classList.toggle('is-on', on); a.parentElement.classList.toggle('is-open', on && !!a.parentElement.querySelector('.ri-toc-sub')); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
    const inCur = subSecs.filter(el => cur.contains(el));
    const sc = inCur.length ? pick(inCur) : null;
    subs.forEach(a => a.classList.toggle('is-on', !!sc && a.dataset.tocSub === sc.id));
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  update();
})();

// Semantic color tabs
document.querySelectorAll('[data-ctabs]').forEach(box => {
  const tabs = [...box.querySelectorAll('[role="tab"]')];
  const show = t => tabs.forEach(x => {
    const on = x === t;
    x.setAttribute('aria-selected', on);
    x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length];
      show(n); n.focus(); e.preventDefault();
    });
  });
});
