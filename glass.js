// Liquid glass nav pill, rendered live.
// Chromium browsers (Chrome, Edge, Arc, Brave) can run an SVG filter on what is
// behind an element (backdrop-filter: url(#…)). We build a displacement map
// shaped like the pill, so the page bends at the rim like a lens while the
// middle stays clear. Because it reads the live page, there is no snapshot to
// load, nothing swaps in after a page change, and moving covers refract as
// they move. Other browsers keep the frosted CSS glass.
(function () {
  var pill = document.querySelector('[data-liquid-nav]');
  if (!pill) return;
  var isChromium = !!(navigator.userAgentData && navigator.userAgentData.brands &&
    navigator.userAgentData.brands.some(function (b) { return /Chromium/.test(b.brand); }));
  if (!isChromium) return;

  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML =
    '<filter id="nav-glass" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
      '<feImage id="nav-glass-map" x="0" y="0" preserveAspectRatio="none" result="map"/>' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="soft"/>' +
      '<feDisplacementMap in="soft" in2="map" scale="22" xChannelSelector="R" yChannelSelector="G"/>' +
    '</filter>';
  document.body.appendChild(svg);
  var mapEl = svg.querySelector('#nav-glass-map');

  // Displacement map: neutral gray in the middle, pushing inward along the
  // edge normal within a band near the rim (stronger the closer to the edge).
  function buildMap(w, h) {
    var band = Math.min(18, h / 2);
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var ctx = c.getContext('2d'), img = ctx.createImageData(w, h), d = img.data, r = h / 2;
    for (var j = 0; j < h; j++) {
      for (var i = 0; i < w; i++) {
        var px = i + 0.5, py = j + 0.5;
        var cx = Math.min(Math.max(px, r), w - r);
        var dx = px - cx, dy = py - r, len = Math.sqrt(dx * dx + dy * dy) || 1;
        var inside = r - len;
        var k = inside < band ? Math.pow(1 - Math.max(inside, 0) / band, 2) : 0;
        var o = (j * w + i) * 4;
        d[o] = 128 - (dx / len) * k * 127;
        d[o + 1] = 128 - (dy / len) * k * 127;
        d[o + 2] = 128; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }
  var lastW = 0, lastH = 0;
  function update() {
    var w = Math.round(pill.offsetWidth), h = Math.round(pill.offsetHeight);
    if (!w || !h || (w === lastW && h === lastH)) return;
    lastW = w; lastH = h;
    mapEl.setAttribute('width', w); mapEl.setAttribute('height', h);
    mapEl.setAttribute('href', buildMap(w, h));
  }
  update();
  pill.classList.add('is-liquid');
  window.addEventListener('resize', update);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
})();
