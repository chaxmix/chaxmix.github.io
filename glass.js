// Liquid glass nav pill (progressive enhancement).
// Uses liquid-glass-js (MIT, vendor/liquid-glass) to give the nav real
// WebGL refraction. The page works without it: the nav keeps its CSS
// frosted-glass look on phones, without WebGL, or with reduced motion.
(function () {
  var pill = document.querySelector('[data-liquid-nav]');
  if (!pill) return;
  if (!window.matchMedia('(min-width: 761px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    var test = document.createElement('canvas');
    if (!(test.getContext('webgl'))) return;
  } catch (e) { return; }

  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  var base = pill.getAttribute('data-liquid-nav') || '';

  window.addEventListener('load', function () {
    load('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js')
      .then(function () { return load(base + 'vendor/liquid-glass/container.js?v=202611250224'); })
      .then(function () { return load(base + 'vendor/liquid-glass/button.js?v=202611250224'); })
      .then(function () {
        var glass = new Container({ type: 'pill', tintOpacity: 0.12 });
        var links = Array.prototype.slice.call(pill.children);
        links.forEach(function (a) { glass.element.appendChild(a); });
        pill.appendChild(glass.element);
        glass.updateSizeFromDOM();
        // Swap off the CSS glass once the WebGL snapshot is ready.
        var tries = 0;
        (function wait() {
          if (Container.pageSnapshot && glass.webglInitialized === true) { pill.classList.add('is-liquid'); return; }
          if (++tries < 100) setTimeout(wait, 100);
        })();
      })
      .catch(function () { /* keep the CSS glass */ });
  });
})();
