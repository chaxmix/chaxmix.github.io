// Small helpers for the portfolio. No libraries needed.

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
