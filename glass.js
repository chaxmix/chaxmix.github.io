// Liquid glass for the nav pill and the time/weather widget, rendered live.
// Chromium browsers (Chrome, Edge, Arc, Brave) can run an SVG filter on what is
// behind an element (backdrop-filter: url(#…)). Each glass element gets its own
// displacement map shaped like it (capsule or rounded card), so the page bends
// at the rim like a lens while the middle stays clear. Because it reads the
// live page, there is no snapshot to load and nothing swaps in after a page
// change. Other browsers keep the frosted CSS glass.
(function () {
  var els = document.querySelectorAll('[data-liquid-nav], [data-liquid-glass]');
  if (!els.length) return;
  var isChromium = !!(navigator.userAgentData && navigator.userAgentData.brands &&
    navigator.userAgentData.brands.some(function (b) { return /Chromium/.test(b.brand); }));
  if (!isChromium) return;

  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  document.body.appendChild(svg);

  // Displacement map: neutral gray in the middle, pushing inward along the
  // edge normal within a band near the rim (stronger the closer to the edge).
  function buildMap(w, h, radius) {
    var r = Math.min(radius, h / 2, w / 2);
    var band = Math.min(18, h / 2);
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var ctx = c.getContext('2d'), img = ctx.createImageData(w, h), d = img.data;
    for (var j = 0; j < h; j++) {
      for (var i = 0; i < w; i++) {
        var px = i + 0.5, py = j + 0.5;
        var qx = Math.min(Math.max(px, r), w - r), qy = Math.min(Math.max(py, r), h - r);
        var dx = px - qx, dy = py - qy, len = Math.sqrt(dx * dx + dy * dy), nx, ny, inside;
        if (len > 0) { nx = dx / len; ny = dy / len; inside = r - len; }
        else {
          var l = px, rt = w - px, t = py, b = h - py, m = Math.min(l, rt, t, b);
          inside = m; nx = m === l ? -1 : m === rt ? 1 : 0; ny = nx ? 0 : (m === t ? -1 : 1);
        }
        var k = inside < band ? Math.pow(1 - Math.max(inside, 0) / band, 2) : 0;
        var o = (j * w + i) * 4;
        d[o] = 128 - nx * k * 127;
        d[o + 1] = 128 - ny * k * 127;
        d[o + 2] = 128; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }

  els.forEach(function (el, n) {
    var id = 'liquid-glass-' + n;
    var f = document.createElementNS(NS, 'filter');
    f.setAttribute('id', id); f.setAttribute('x', '0'); f.setAttribute('y', '0');
    f.setAttribute('width', '100%'); f.setAttribute('height', '100%');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    f.innerHTML =
      '<feImage x="0" y="0" preserveAspectRatio="none" result="map"/>' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="soft"/>' +
      '<feDisplacementMap in="soft" in2="map" scale="22" xChannelSelector="R" yChannelSelector="G"/>';
    svg.appendChild(f);
    var map = f.firstChild, lastW = 0, lastH = 0;
    function update() {
      var w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w; lastH = h;
      var radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || h / 2;
      map.setAttribute('width', w); map.setAttribute('height', h);
      map.setAttribute('href', buildMap(w, h, radius));
    }
    update();
    var fx = 'url(#' + id + ') saturate(170%) brightness(1.03)';
    el.style.webkitBackdropFilter = fx; el.style.backdropFilter = fx;
    el.classList.add('live-glass');
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(el);
    else window.addEventListener('resize', update);
  });
})();
