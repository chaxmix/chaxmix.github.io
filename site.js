// Portfolio starter — small helpers. Safe to delete if you don't need them.

// 1. Placeholder highlight toggle. Placeholder copy is wrapped in
//    <span class="ph">…</span>. Click "Hide highlights" to preview the
//    site as visitors will see it. Delete the banner when you're done.
(function () {
  var root = document.documentElement;
  try { if (localStorage.getItem('hidePh') === '1') root.classList.add('hide-ph'); } catch (e) {}
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-toggle-ph]');
    if (!btn) return;
    root.classList.toggle('hide-ph');
    try { localStorage.setItem('hidePh', root.classList.contains('hide-ph') ? '1' : '0'); } catch (e) {}
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'h' && e.altKey) root.classList.toggle('hide-ph');
  });
})();

// 2. Footer year.
document.querySelectorAll('[data-year]').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

// 3. Contact form. There's no backend yet, so this just confirms on the page.
//    To make it real, point the form at a service like Formspree or Netlify
//    Forms and remove this handler.
var form = document.querySelector('[data-contact-form]');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = form.querySelector('[data-form-status]');
    note.textContent = 'Thanks! This form is a placeholder and isn’t connected yet, so nothing was sent.';
  });
}
