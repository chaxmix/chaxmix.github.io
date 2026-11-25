// Small helpers for the portfolio. No libraries needed.

// Nav background: fades in once the page scrolls, so the nav stays readable
// over covers. ?navbg=1 or ?navbg=2 previews a style (temporary, for choosing).
(function () {
  var root = document.documentElement;
  var m = /[?&]navbg=(\w+)/.exec(location.search);
  if (m) root.setAttribute('data-navbg', m[1]);
  var fill = document.createElement('div');
  fill.className = 'nav-fill'; fill.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(fill, document.body.firstChild);
  function onScroll() { root.classList.toggle('is-scrolled', window.scrollY > 4); }
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
