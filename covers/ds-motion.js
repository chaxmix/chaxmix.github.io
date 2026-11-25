// Design system cover, camera version (generic placeholder content).
// A tiny timeline engine with spring easing drives a camera through a CSS 3D
// scene: tokens up close -> they snap into a button -> components assemble into
// a form card -> the full page builds around it -> it all funnels into the logo.
// Pauses off screen; shows a still frame for people who prefer reduced motion.
(function () {
  var hosts = document.querySelectorAll('[data-ds-motion]');
  if (!hosts.length) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOOP = 10.8;

  // ---- easing ----
  function spring(z) {
    var w = 4.6 / z, wd = w * Math.sqrt(1 - z * z);
    return function (u) { return u >= 1 ? 1 : 1 - Math.exp(-z * w * u) * (Math.cos(wd * u) + (z * w / wd) * Math.sin(wd * u)); };
  }
  var E = {
    sp: spring(0.45),            // bouncy
    sf: spring(0.72),            // soft settle
    io: function (u) { return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; },
    in: function (u) { return u * u * u; },
    out: function (u) { return 1 - Math.pow(1 - u, 3); }
  };

  // ---- scene ----
  // Each object: [id, className, innerHTML, initial props, keys]. Keys: [start, duration, {props}, ease].
  // World units are px; the full page is 960x600 centred on 0,0. The hero button sits at 338,180.
  var LOGO_GLYPH = '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M6 24c4.5-8 10.5-12 18-12s13.5 4 18 12c-4.5 8-10.5 12-18 12S10.5 32 6 24z"/><circle cx="24" cy="24" r="5" fill="#fff" stroke="none"/></svg>';
  var stat = '<i></i><b></b><em></em>';
  var S = [
    // tokens
    ['tkc', 'dm-tk dm-tk-c dm-btn', '', { x: 338, y: 180, w: 56, h: 56, r: 14, s: 0 }, [[0.25, .9, { o: 1, s: 1 }, 'sp'], [2.1, 1, { w: 188, h: 40, r: 12 }, 'sp'], [3.0, .16, { s: .92 }, 'io'], [3.16, .7, { s: 1 }, 'sp']]],
    ['lc', 'dm-lbl', '<b>Brand Blue/500</b>#1F8ACA', { x: 338, y: 236, w: 150, h: 26 }, [[0.6, .6, { o: 1, y: 228 }, 'sf'], [1.25, .3, { o: 0, y: 220 }, 'io']]],
    ['lc2', 'dm-lbl', '<b>background/brand/bold</b>semantic token', { x: 338, y: 238, w: 170, h: 26 }, [[1.35, .6, { o: 1, y: 228 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tka', 'dm-tk dm-tk-a', 'Aa', { x: 232, y: 150, w: 56, h: 56, s: 0 }, [[0.85, .9, { o: 1, s: 1 }, 'sp'], [2.0, .55, { x: 338, y: 180, s: .3, o: 0 }, 'io']]],
    ['la', 'dm-lbl', '<b>text/inverse</b>#F9F9F9', { x: 232, y: 200, w: 110, h: 26 }, [[1.05, .6, { o: 1, y: 194 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tkr', 'dm-tk dm-tk-r', '', { x: 444, y: 150, w: 50, h: 50, s: 0 }, [[1.15, .9, { o: 1, s: 1 }, 'sp'], [2.05, .55, { x: 420, y: 166, s: .3, o: 0 }, 'io']]],
    ['lr', 'dm-lbl', '<b>radius</b>12px', { x: 444, y: 200, w: 100, h: 26 }, [[1.3, .6, { o: 1, y: 194 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tks', 'dm-tk dm-tk-s', '<i style="height:6px"></i><i style="height:12px"></i><i style="height:18px"></i><i style="height:26px"></i>', { x: 338, y: 96, w: 56, h: 50, s: 0 }, [[1.4, .9, { o: 1, s: 1 }, 'sp'], [2.05, .55, { y: 170, s: .3, o: 0 }, 'io']]],
    ['ls', 'dm-lbl', '<b>space</b>16px', { x: 338, y: 58, w: 100, h: 26 }, [[1.55, .6, { o: 1, y: 54 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['btl', 'o-lbl', '<span style="color:#fff;font-weight:600;font-size:13px;white-space:nowrap;display:grid;place-items:center;height:100%">Get started</span>', { x: 338, y: 180, z: 1, w: 120, h: 40, s: .6 }, [[2.45, .6, { o: 1, s: 1 }, 'sp'], [3.0, .16, { s: .92 }, 'io'], [3.16, .7, { s: 1 }, 'sp']]],
    // component: form card
    ['fc', 'dm-card', '', { x: 338, y: 82, z: -1, w: 236, h: 300, s: .8 }, [[3.4, 1, { o: 1, s: 1 }, 'sp']]],
    ['ft', 'dm-bar dm-dk', '', { x: 304, y: -26, z: 1, w: 124, h: 12 }, [[3.6, .8, { o: 1, y: -36 }, 'sp']]],
    ['fi', 'dm-inp', 'Search accounts', { x: 338, y: 20, z: 1, w: 188, h: 36, s: .85 }, [[3.7, .9, { o: 1, y: 6, s: 1 }, 'sp']]],
    ['fl', 'dm-bar', '', { x: 298, y: 62, z: 1, w: 108, h: 10 }, [[3.85, .8, { o: 1, y: 56 }, 'sp']]],
    ['fg', 'dm-tgl', '', { x: 404, y: 62, z: 1, w: 42, h: 24, s: .5 }, [[3.9, .9, { o: 1, y: 56, s: 1 }, 'sp']]],
    ['fk', 'dm-chk', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>', { x: 256, y: 112, z: 1, w: 22, h: 22, s: .4 }, [[4.0, .9, { o: 1, y: 106, s: 1 }, 'sp']]],
    ['fk2', 'dm-bar', '', { x: 324, y: 112, z: 1, w: 110, h: 10 }, [[4.05, .8, { o: 1, y: 106 }, 'sp']]],
    // full page
    ['fr', 'dm-frame', '', { x: 0, y: 0, z: -3, w: 960, h: 600, s: .9 }, [[5.0, 1, { o: 1, s: 1 }, 'sf']]],
    ['sd', 'dm-side', '<i></i><i class="dm-on"></i><i></i><i></i><i></i><i style="width:60%"></i>', { x: -560, y: 0, z: -2, w: 200, h: 600 }, [[5.15, 1.1, { o: 1, x: -380 }, 'sp']]],
    ['tp', 'dm-top', '<span class="dm-t"></span><span class="dm-r"><i></i><b></b></span>', { x: 100, y: -340, z: -2, w: 712, h: 44 }, [[5.25, 1.1, { o: 1, y: -262 }, 'sp']]],
    ['s1', 'dm-card dm-stat', stat, { x: -146, y: -152, z: -1, w: 220, h: 120, s: .5 }, [[5.4, 1, { o: 1, s: 1 }, 'sp']]],
    ['s2', 'dm-card dm-stat', stat, { x: 98, y: -152, z: -1, w: 220, h: 120, s: .5 }, [[5.5, 1, { o: 1, s: 1 }, 'sp']]],
    ['s3', 'dm-card dm-stat', stat, { x: 342, y: -152, z: -1, w: 220, h: 120, s: .5 }, [[5.6, 1, { o: 1, s: 1 }, 'sp']]],
    ['ch', 'dm-card dm-chart', '<svg viewBox="0 0 400 250" preserveAspectRatio="none"><path pathLength="1" stroke-dasharray="1" d="M0 210 C40 200 60 150 100 160 S170 90 210 110 S290 40 330 60 S380 30 400 20"/></svg>', { x: -30, y: 82, z: -1, w: 452, h: 300, s: .7, p: 0 }, [[5.6, 1, { o: 1, s: 1 }, 'sp'], [5.9, 1.2, { p: 1 }, 'io']]],
    // logo (placeholder)
    ['mk', 'dm-mark', LOGO_GLYPH, { x: -126, y: 0, w: 88, h: 88, s: 0, rz: -40 }, [[8.35, 1, { o: 1, s: 1, rz: 0 }, 'sp'], [10.2, .45, { o: 0, s: .9 }, 'io']]],
    ['wd', 'dm-word', 'RealInsight', { x: 86, y: 0, w: 236, h: 44 }, [[8.6, .9, { o: 1, x: 56 }, 'sf'], [10.2, .45, { o: 0 }, 'io']]]
  ];
  // Everything in the page funnels into the centre before the logo appears.
  var funnel = ['fk2', 'fk', 'fg', 'fl', 'fi', 'ft', 'btl', 'tkc', 'fc', 'ch', 's3', 's2', 's1', 'tp', 'sd', 'fr'];
  funnel.forEach(function (id, i) {
    var o = S.filter(function (x) { return x[0] === id; })[0];
    o[4].push([7.8 + i * .03, .55, { x: 0, y: 0, s: 0, o: 0 }, 'in']);
  });
  // Camera keys
  var CAM0 = { cx: 338, cy: 180, z: 3.1, rx: 0, ry: 0, rz: 0 };
  var CAM = [
    [0.7, 1.5, { z: 1.5, cy: 142, rx: 16, ry: -18 }, 'sf'],
    [2.0, 1.1, { z: 2.4, cy: 178, rx: 6, ry: 14 }, 'sf'],
    [3.3, 1.4, { z: .95, cx: 338, cy: 82, rx: 30, ry: 0, rz: -12 }, 'sf'],
    [4.9, 1.7, { z: .5, cx: 0, cy: 0, rx: 50, rz: -30 }, 'sf'],
    [6.6, 1.3, { z: .54, rx: 20, rz: -8 }, 'sf'],
    [7.75, 1, { z: 1, cx: 0, cy: 0, rx: 0, ry: 0, rz: 0 }, 'io']
  ];

  function sample(init, keys, T) {
    var v = {}, k; for (k in init) v[k] = init[k];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i], t0 = key[0], d = key[1], to = key[2];
      if (T < t0) break;
      var u = Math.min(1, (T - t0) / d), e = E[key[3]](u);
      for (k in to) { var from = v[k] === undefined ? (k === 'o' ? 0 : k === 's' ? 1 : 0) : v[k]; v[k] = from + (to[k] - from) * e; }
    }
    return v;
  }

  hosts.forEach(function (host) {
    var cam = document.createElement('div'); cam.className = 'cam'; host.appendChild(cam);
    var objs = S.map(function (d) {
      var el = document.createElement('div'); el.className = 'o ' + d[1]; el.innerHTML = d[2];
      el.setAttribute('aria-hidden', 'true'); cam.appendChild(el);
      var init = {}; for (var k in d[3]) init[k] = d[3][k];
      if (init.o === undefined) init.o = 0;
      return { el: el, init: init, keys: d[4].slice().sort(function (a, b) { return a[0] - b[0]; }), path: el.querySelector('path[pathLength]'), lw: 0, lh: 0, lr: -1 };
    });
    function render(T) {
      var dark = T > 6.5 && T < 7.7;               // light -> dark mode flip on the finished page
      if (host.classList.contains('is-dark') !== dark) host.classList.toggle('is-dark', dark);
      var c = sample(CAM0, CAM, T);
      cam.style.transform = 'scale(' + c.z + ') rotateX(' + c.rx + 'deg) rotateY(' + c.ry + 'deg) rotateZ(' + c.rz + 'deg) translate3d(' + (-c.cx) + 'px,' + (-c.cy) + 'px,0)';
      for (var i = 0; i < objs.length; i++) {
        var o = objs[i], v = sample(o.init, o.keys, T), st = o.el.style;
        if (v.o <= 0.001) { if (st.visibility !== 'hidden') st.visibility = 'hidden'; continue; }
        st.visibility = '';
        if (Math.abs(v.w - o.lw) > .05) { st.width = v.w + 'px'; o.lw = v.w; }
        if (Math.abs(v.h - o.lh) > .05) { st.height = v.h + 'px'; o.lh = v.h; }
        if (v.r !== undefined && Math.abs(v.r - o.lr) > .05) { st.borderRadius = v.r + 'px'; o.lr = v.r; }
        st.opacity = Math.min(1, v.o);
        st.transform = 'translate3d(' + (v.x - v.w / 2) + 'px,' + (v.y - v.h / 2) + 'px,' + (v.z || 0) + 'px) rotateZ(' + (v.rz || 0) + 'deg) scale(' + Math.max(0, v.s === undefined ? 1 : v.s) + ')';
        if (o.path && v.p !== undefined) o.path.style.strokeDashoffset = 1 - v.p;
      }
    }
    if (reduce) { render(6.2); return; }
    var visible = false, raf = 0, clock = 0, last = 0;
    function frame(now) {
      if (last) clock = (clock + Math.min(.05, (now - last) / 1000)) % LOOP;
      last = now; render(clock);
      raf = visible ? requestAnimationFrame(frame) : 0;
      if (!raf) last = 0;
    }
    render(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(host);
    } else { visible = true; raf = requestAnimationFrame(frame); }
    host.dsMotion = { seek: function (t) { clock = t; render(t); } }; // handy for previews and stills
  });
})();
