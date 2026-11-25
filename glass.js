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

  // Re-take the snapshot when the layout changes (resize, late fonts) so the
  // refraction keeps lining up with the page behind the pill.
  function refresh(glass) {
    var r = glass.gl_refs, gl = r && r.gl;
    if (!gl) return;
    window.html2canvas(document.body, { scale: 1, useCORS: true, allowTaint: true,
      ignoreElements: function (el) { return el.classList && el.classList.contains('glass-container'); } })
      .then(function (snap) {
        gl.bindTexture(gl.TEXTURE_2D, r.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snap);
        gl.uniform2f(r.textureSizeLoc, snap.width, snap.height);
        if (glass.render) glass.render();
      })
      .catch(function () {});
  }
  function watchLayout(glass) {
    var t, w = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      clearTimeout(t); t = setTimeout(function () { refresh(glass); }, 400);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { refresh(glass); });
  }

  window.addEventListener('load', function () {
    load('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js')
      .then(function () {
        // Take the page snapshot the glass refracts with the scroll-reveal cards
        // already visible and without the nav's own CSS glass, so the glass shows
        // the real page behind it instead of a blank area or a copy of itself.
        var h2c = window.html2canvas;
        window.html2canvas = function (el, opts) {
          opts = opts || {};
          // Always capture the whole page from the top, even when the page is
          // already scrolled (back/forward, restored scroll). Otherwise the top of
          // the snapshot comes out empty and the pill renders black there.
          opts.scrollX = -window.scrollX;
          opts.scrollY = -window.scrollY;
          opts.windowWidth = document.documentElement.clientWidth;
          opts.backgroundColor = getComputedStyle(document.body).backgroundColor || '#fbfbfd';
          opts.onclone = function (doc) { doc.documentElement.classList.add('glass-snapshot'); };
          return h2c(el, opts);
        };
        // Clear center, stronger lensing at the rim (the library defaults are faint)
        window.glassControls = { blurRadius: 1.2, edgeIntensity: 0.035, rimIntensity: 0.11, baseIntensity: 0.012,
          edgeDistance: 0.15, rimDistance: 0.8, baseDistance: 0.1, cornerBoost: 0.03, rippleEffect: 0.06 };
        return load(base + 'vendor/liquid-glass/container.js?v=202611250224');
      })
      .then(function () { return load(base + 'vendor/liquid-glass/button.js?v=202611250224'); })
      .then(function () {
        var glass = new Container({ type: 'pill', tintOpacity: 0.06 });
        var links = Array.prototype.slice.call(pill.children);
        links.forEach(function (a) { glass.element.appendChild(a); });
        pill.appendChild(glass.element);
        glass.updateSizeFromDOM();
        if (window.placeNavBubble) requestAnimationFrame(window.placeNavBubble);
        // Swap off the CSS glass once the page snapshot is ready. If the snapshot
        // fails (html2canvas can't read some modern CSS), put the links back and
        // keep the CSS glass so nothing looks broken.
        var tries = 0;
        (function wait() {
          if (Container.pageSnapshot && glass.webglInitialized === true) { pill.classList.add('is-liquid'); watchLayout(glass); return; }
          if (++tries < 80) { setTimeout(wait, 100); return; }
          links.forEach(function (a) { pill.appendChild(a); });
          if (window.placeNavBubble) window.placeNavBubble();
          if (glass.element.parentNode) glass.element.parentNode.removeChild(glass.element);
          pill.classList.remove('is-liquid');
        })();
      })
      .catch(function () { /* keep the CSS glass */ });
  });
})();
