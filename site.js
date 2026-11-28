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

// Compact nav: once you scroll, the tab labels collapse into icons and the
// pill shrinks to fit, with a little bounce. Hovering the pill opens it again.
(function () {
  var root = document.documentElement;
  var pill = document.querySelector('.nav-pill');
  if (!pill) return;
  var ICONS = {
    'index.html': '<rect x="4" y="4.5" width="16" height="11.5" rx="2"/><path d="M2 19.5h20"/>',
    'about.html': '<circle cx="12" cy="12" r="8.5"/><path d="M8.8 14.2c.8 1.1 1.9 1.7 3.2 1.7s2.4-.6 3.2-1.7"/><path d="M9.3 9.8h.01M14.7 9.8h.01" stroke-width="2.4"/>',
    'play.html': '<path d="M19.5 4.5c-3.5 1.2-7.4 4.6-9.6 7.6l2 2c3-2.2 6.4-6.1 7.6-9.6z"/><path d="M9.9 12.1c-2.2-.1-3.7 1.3-3.9 3.4-.1 1.4-.8 2.4-2 3 2.7 1.3 6.4.7 7.8-1.4.8-1.2.5-2.6-.6-3.6"/>'
  };
  pill.querySelectorAll('a').forEach(function (a) {
    var key = (a.getAttribute('href') || '').split('/').pop();
    var label = a.textContent.trim();
    a.innerHTML = '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[key] || '') + '</svg><span class="nav-label">' + label + '</span>';
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

// 6. Pause looping animations while they're off screen, so covers and the
//    case study hero don't keep using CPU/GPU when nobody can see them.
//    (The WebGL shader and the 3D cover already pause themselves.)
(function () {
  var loops = document.querySelectorAll('.cover, .cs-cover, .hero-object, .hx-wrap, [data-loop]');
  if (!loops.length || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle('is-offscreen', !e.isIntersecting); });
  }, { rootMargin: '100px 0px' });
  loops.forEach(function (el) { el.classList.add('is-offscreen'); io.observe(el); });
})();
