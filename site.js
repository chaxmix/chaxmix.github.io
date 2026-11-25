// Small helpers for the portfolio. No libraries needed.

// Nav background: a progressive blur that fades in once the page scrolls, so
// the nav stays readable over covers.
(function () {
  var root = document.documentElement;
  var fill = document.createElement('div');
  fill.className = 'nav-fill'; fill.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(fill, document.body.firstChild);
  function onScroll() { root.classList.toggle('is-scrolled', window.scrollY > 4); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Compact nav (prototype): once you scroll, the tab labels collapse into icons
// and the pill shrinks to fit, with a little bounce. Preview with ?compact=1
// (remembered for the visit, ?compact=0 turns it off).
(function () {
  var root = document.documentElement;
  var m = /[?&]compact=(\d)/.exec(location.search);
  try {
    if (m) sessionStorage.setItem('navCompact', m[1]);
    if (sessionStorage.getItem('navCompact') !== '1') return;
  } catch (e) { if (!m || m[1] !== '1') return; }
  var pill = document.querySelector('.nav-pill');
  if (!pill) return;
  var ICONS = {
    'index.html': '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>',
    'about.html': '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c1.2-3.7 3.9-5.6 7-5.6s5.8 1.9 7 5.6"/>',
    'play.html': '<path d="M11 3.5c.6 4.4 2.2 6 6.5 6.6-4.3.6-5.9 2.2-6.5 6.6-.6-4.4-2.2-6-6.5-6.6 4.3-.6 5.9-2.2 6.5-6.6z"/><path d="M18 15.5c.25 1.7.9 2.35 2.5 2.6-1.6.25-2.25.9-2.5 2.6-.25-1.7-.9-2.35-2.5-2.6 1.6-.25 2.25-.9 2.5-2.6z"/>'
  };
  pill.querySelectorAll('a').forEach(function (a) {
    var key = (a.getAttribute('href') || '').split('/').pop();
    var label = a.textContent.trim();
    a.innerHTML = '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[key] || '') + '</svg><span class="nav-label">' + label + '</span>';
    a.setAttribute('title', label);
  });
  // Remember each tab's full width so CSS can animate between it and the icon.
  function measure() {
    pill.querySelectorAll('a').forEach(function (a) {
      var label = a.querySelector('.nav-label');
      a.style.setProperty('--wide', Math.ceil(label.scrollWidth + 36) + 'px');
    });
  }
  measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  root.setAttribute('data-navcompact', '');
  function onScroll() { root.classList.toggle('nav-compact', window.scrollY > 48); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// 0. Nav bubble: one white pill behind the current tab. It is its own element
//    (view-transition-name: nav-bubble), so when you move between pages,
//    browsers with cross-document view transitions slide it from the old tab
//    to the new one. Without that support the page just switches as normal.
(function () {
  var pill = document.querySelector('.nav-pill');
  if (!pill) return;
  var bubble = document.createElement('span');
  bubble.className = 'nav-bubble';
  bubble.setAttribute('aria-hidden', 'true');
  function place() {
    var cur = pill.querySelector('a[aria-current="page"]');
    if (!cur) { bubble.style.display = 'none'; return; }
    var host = cur.parentNode;
    if (bubble.parentNode !== host) host.insertBefore(bubble, host.firstChild);
    bubble.style.display = '';
    bubble.style.left = cur.offsetLeft + 'px';
    bubble.style.top = cur.offsetTop + 'px';
    bubble.style.width = cur.offsetWidth + 'px';
    bubble.style.height = cur.offsetHeight + 'px';
  }
  place();
  pill.classList.add('has-bubble');
  window.placeNavBubble = place;
  window.addEventListener('resize', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  // Follow the pill while it changes size (the compact nav animates its width).
  if ('ResizeObserver' in window) new ResizeObserver(place).observe(pill);
})();

// 1. Placeholder highlight toggle. Placeholder copy is wrapped in
//    <span class="ph">…</span>. Delete the banner when you're done.
(function () {
  var root = document.documentElement;
  try { if (localStorage.getItem('hidePh') === '1') root.classList.add('hide-ph'); } catch (e) {}
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-toggle-ph]');
    if (!btn) return;
    root.classList.toggle('hide-ph');
    try { localStorage.setItem('hidePh', root.classList.contains('hide-ph') ? '1' : '0'); } catch (e) {}
  });
})();

// 2. Clock in the nav, in the visitor's own time zone.
(function () {
  var els = document.querySelectorAll('[data-clock]');
  if (!els.length) return;
  function tick() {
    var now = new Date();
    var text = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    els.forEach(function (el) { el.textContent = text; el.setAttribute('datetime', now.toISOString()); });
  }
  tick();
  setInterval(tick, 1000 * 15);
})();

// 3. Cards fade up as they scroll into view.
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();

// 4. Footer year.
document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

// 5. Contact form. There's no backend yet, so this only confirms on the page.
var form = document.querySelector('[data-contact-form]');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.querySelector('[data-form-status]').textContent = 'Thanks! This form isn’t connected yet, so nothing was sent.';
  });
}
