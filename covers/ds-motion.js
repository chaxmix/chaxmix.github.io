// Design system cover, camera version, built from RealInsight's real components (fake data).
// A tiny timeline engine with spring easing drives a camera through a CSS 3D
// scene: tokens up close -> they snap into a button -> redlines measure it ->
// components drop into the Invoicing page around it -> it all funnels into the logo.
// Pauses off screen; shows a still frame for people who prefer reduced motion.
(function () {
  var hosts = document.querySelectorAll('[data-ds-motion]');
  if (!hosts.length) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOOP = 11.2;

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
  // World units are px. The Invoicing page is 960x600 centred on 0,0; the component sheet sits at 338,60
  // and the hero button starts at 338,180. Components fly from the sheet into their spots on the page.
  // All names and numbers are made up.
  var R_GLYPH = '<svg viewBox="0 0 36 36" aria-hidden="true"><path fill="#0B0B0B" d="M10.0181 17.7239V26.9998H14.0679V17.7239H10.0181ZM10.0181 13.5683V16.7511H14.0679V13.5683H10.0181ZM14.0674 12.6041H18.1166C20.1051 12.6041 21.311 13.507 21.311 15.1641V15.2341C21.311 16.7599 20.1773 17.7941 18.1884 17.7941H15.1293V21.2572H17.2623L21.2397 27H26L21.5189 20.5647C23.8678 19.7319 25.4962 17.8644 25.4962 15.0236V14.9536C25.4962 13.288 24.9292 11.8411 23.9302 10.868C22.5804 9.62249 20.8074 9 18.4594 9H10V12.5336"/></svg>';
  var ICO = {
    home: '<path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    doc: '<path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16l4-5 3 3 5-6"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>'
  };
  function ico(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICO[k] + '</svg>'; }
  function badge(kind, txt) { return '<span class="dm-bdg dm-' + kind + '">' + txt + '</span>'; }
  var CHECK = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ROWS = [
    ['LN-2041', 'Harbor Point Plaza', '304118', '', '10/01/2026', '$48,210.00'],
    ['LN-2047', 'Maple & Fifth', '304126', '', '10/01/2026', '$12,904.50'],
    ['LN-2052', 'Northgate Lofts', '304131', '', '10/03/2026', '$31,650.00'],
    ['LN-2058', 'Cedar Row Retail', '304139', '', '10/05/2026', '$7,425.80'],
    ['LN-2063', 'Linden Commons', '304142', badge('rev', 'For review'), '10/08/2026', '$22,118.00'],
    ['LN-2066', 'Bayview Center', '304150', badge('pd', 'Paid'), '10/09/2026', '$54,300.00'],
    ['LN-2071', 'Elm Street Flats', '304157', badge('out', 'Outstanding'), '10/12/2026', '$9,876.25']
  ];
  var table = '<div class="dm-tr dm-th"><span></span><span>Loan</span><span>Loan name</span><span>Invoice</span><span>Status</span><span>Date</span><span>Amount</span></div>' +
    ROWS.map(function (r, i) { return '<div class="dm-tr"><span><i class="dm-cb' + (i === 0 ? ' dm-hold' : '') + '"></i></span><span>' + r[0] + '</span><span>' + r[1] + '</span><span>' + r[2] + '</span><span>' + r[3] + '</span><span>' + r[4] + '</span><span>' + r[5] + '</span></div>'; }).join('');
  var side = '<b>' + ico('home') + 'Home</b><b>' + ico('doc') + 'Documents</b><b>' + ico('chart') + 'Reports</b><b>' + ico('card') + 'Servicing</b><b class="dm-sub dm-on">Invoicing</b><b class="dm-sub">Disbursements</b><b class="dm-sub">Remittance</b><b>' + ico('cog') + 'Configuration</b>';
  var top = '<span class="dm-logo">' + R_GLYPH + '</span><span class="dm-search">Search</span><span class="dm-av"></span>';

  var S = [
    // tokens
    ['tkc', 'dm-tk dm-tk-c dm-btn', '', { x: 338, y: 180, w: 56, h: 56, r: 14, s: 0 }, [[0.25, .9, { o: 1, s: 1 }, 'sp'], [2.1, 1, { w: 120, h: 40, r: 10 }, 'sp'], [4.55, .16, { s: .92 }, 'io'], [4.71, .6, { s: 1 }, 'sp'], [5.0, 1.2, { x: 391, y: 268, w: 130, h: 36 }, 'sp']]],
    ['lc', 'dm-lbl', '<b>Brand Blue/500</b>#1F8ACA', { x: 338, y: 236, w: 150, h: 26 }, [[0.6, .6, { o: 1, y: 228 }, 'sf'], [1.25, .3, { o: 0, y: 220 }, 'io']]],
    ['lc2', 'dm-lbl', '<b>background/brand/bold</b>semantic token', { x: 338, y: 238, w: 170, h: 26 }, [[1.35, .6, { o: 1, y: 228 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tka', 'dm-tk dm-tk-a', 'Aa', { x: 232, y: 150, w: 56, h: 56, s: 0 }, [[0.85, .9, { o: 1, s: 1 }, 'sp'], [2.0, .55, { x: 338, y: 180, s: .3, o: 0 }, 'io']]],
    ['la', 'dm-lbl', '<b>DM Sans Medium</b>16 / 150%', { x: 232, y: 200, w: 110, h: 26 }, [[1.05, .6, { o: 1, y: 194 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tkr', 'dm-tk dm-tk-r', '', { x: 444, y: 150, w: 50, h: 50, s: 0 }, [[1.15, .9, { o: 1, s: 1 }, 'sp'], [2.05, .55, { x: 410, y: 166, s: .3, o: 0 }, 'io']]],
    ['lr', 'dm-lbl', '<b>radius/lg</b>10px', { x: 444, y: 200, w: 100, h: 26 }, [[1.3, .6, { o: 1, y: 194 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tks', 'dm-tk dm-tk-s', '<i style="height:6px"></i><i style="height:12px"></i><i style="height:18px"></i><i style="height:26px"></i>', { x: 338, y: 96, w: 56, h: 50, s: 0 }, [[1.4, .9, { o: 1, s: 1 }, 'sp'], [2.05, .55, { y: 170, s: .3, o: 0 }, 'io']]],
    ['ls', 'dm-lbl', '<b>space/lg</b>16px', { x: 338, y: 58, w: 100, h: 26 }, [[1.55, .6, { o: 1, y: 54 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['btl', 'dm-btl', 'Post invoices', { x: 338, y: 180, z: 1, w: 120, h: 40, s: .6 }, [[2.45, .6, { o: 1, s: 1 }, 'sp'], [4.55, .16, { s: .92 }, 'io'], [4.71, .6, { s: 1 }, 'sp'], [5.0, 1.2, { x: 391, y: 268, w: 130, h: 36 }, 'sp']]],
    // redlines: guides draw over the button to measure alignment and spacing (button 278..398 x 160..200)
    ['g1', 'dm-g', '', { x: 338, y: 160, z: 2, w: 0, h: 1 }, [[3.05, .5, { o: 1, w: 300 }, 'out'], [4.35, .3, { o: 0 }, 'io']]],
    ['g2', 'dm-g', '', { x: 338, y: 200, z: 2, w: 0, h: 1 }, [[3.12, .5, { o: 1, w: 300 }, 'out'], [4.35, .3, { o: 0 }, 'io']]],
    ['g3', 'dm-g dm-v', '', { x: 278, y: 180, z: 2, w: 1, h: 0 }, [[3.2, .5, { o: 1, h: 150 }, 'out'], [4.35, .3, { o: 0 }, 'io']]],
    ['g4', 'dm-g dm-v', '', { x: 398, y: 180, z: 2, w: 1, h: 0 }, [[3.27, .5, { o: 1, h: 150 }, 'out'], [4.35, .3, { o: 0 }, 'io']]],
    ['g5', 'dm-g dm-v dm-soft', '', { x: 294, y: 180, z: 2, w: 1, h: 0 }, [[3.4, .4, { o: 1, h: 40 }, 'out'], [4.35, .3, { o: 0 }, 'io']]],
    ['g6', 'dm-g dm-v dm-soft', '', { x: 382, y: 180, z: 2, w: 1, h: 0 }, [[3.45, .4, { o: 1, h: 40 }, 'out'], [4.35, .3, { o: 0 }, 'io']]],
    ['g7', 'dm-g dm-soft', '', { x: 338, y: 180, z: 2, w: 0, h: 1 }, [[3.5, .4, { o: 1, w: 120 }, 'out'], [4.35, .3, { o: 0 }, 'io']]],
    ['d1', 'dm-d', '', { x: 286, y: 214, z: 2, w: 0, h: 7 }, [[3.55, .35, { o: 1, w: 16 }, 'out'], [4.35, .3, { o: 0 }, 'io']]],
    ['d2', 'dm-d', '', { x: 390, y: 214, z: 2, w: 0, h: 7 }, [[3.6, .35, { o: 1, w: 16 }, 'out'], [4.35, .3, { o: 0 }, 'io']]],
    ['d3', 'dm-d dm-v', '', { x: 416, y: 180, z: 2, w: 7, h: 0 }, [[3.65, .35, { o: 1, h: 40 }, 'out'], [4.35, .3, { o: 0 }, 'io']]],
    ['m1', 'dm-m', '16', { x: 286, y: 230, z: 3, w: 22, h: 14, s: 0 }, [[3.75, .6, { o: 1, s: 1 }, 'sp'], [4.35, .3, { o: 0 }, 'io']]],
    ['m2', 'dm-m', '16', { x: 390, y: 230, z: 3, w: 22, h: 14, s: 0 }, [[3.8, .6, { o: 1, s: 1 }, 'sp'], [4.35, .3, { o: 0 }, 'io']]],
    ['m3', 'dm-m', '40', { x: 434, y: 180, z: 3, w: 22, h: 14, s: 0 }, [[3.85, .6, { o: 1, s: 1 }, 'sp'], [4.35, .3, { o: 0 }, 'io']]],
    ['m4', 'dm-m', 'r 10', { x: 270, y: 146, z: 3, w: 30, h: 14, s: 0 }, [[3.9, .6, { o: 1, s: 1 }, 'sp'], [4.35, .3, { o: 0 }, 'io']]],
    ['m5', 'dm-m', '120', { x: 338, y: 146, z: 3, w: 28, h: 14, s: 0 }, [[3.95, .6, { o: 1, s: 1 }, 'sp'], [4.35, .3, { o: 0 }, 'io']]],
    // the Invoicing page: components drop straight into place
    ['fc', 'dm-card', '', { x: 95, y: 61, z: -2, w: 722, h: 338, s: .85 }, [[5.2, 1, { o: 1, s: 1 }, 'sp']]],
    ['tbl', 'dm-tbl', table, { x: 95, y: 61, z: -1, w: 722, h: 338 }, [[5.55, .5, { o: 1 }, 'out']]],
    ['pt', 'dm-ttl dm-big', 'Invoicing', { x: -206, y: -214, z: 1, w: 120, h: 28 }, [[5.3, .8, { o: 1, y: -222 }, 'sp']]],
    ['tab', 'dm-tabs', '<b class="dm-on">All <i>24</i></b><b>For review <i>6</i></b><b>Outstanding <i>5</i></b><b>Late <i>3</i></b>', { x: -76, y: -178, z: 90, w: 380, h: 30, s: .6 }, [[5.4, .9, { o: 1, s: 1, z: 1 }, 'sp']]],
    ['fi', 'dm-inp', 'Search invoices', { x: -116, y: -134, z: 90, w: 300, h: 34, s: .6 }, [[5.45, .9, { o: 1, s: 1, z: 1 }, 'sp']]],
    ['fcp', 'dm-chip', 'Due this month <i>×</i>', { x: 104, y: -134, z: 90, w: 124, h: 26, s: .5 }, [[5.52, .9, { o: 1, s: 1, z: 1 }, 'sp']]],
    ['fg', 'dm-tgl', '', { x: 236, y: -134, z: 90, w: 36, h: 20, s: .5 }, [[5.58, .9, { o: 1, s: 1, z: 1 }, 'sp']]],
    ['fgl', 'dm-tlbl', 'Auto-post', { x: 300, y: -134, z: 1, w: 64, h: 20 }, [[5.8, .6, { o: 1 }, 'out']]],
    ['ff', 'dm-ghost', 'Filter', { x: 420, y: -134, z: 90, w: 72, h: 32, s: .5 }, [[5.64, .9, { o: 1, s: 1, z: 1 }, 'sp']]],
    ['b1', 'dm-bdg dm-rev', 'For review', { x: 151, y: -52, z: 120, w: 78, h: 22, s: .4 }, [[5.7, .9, { o: 1, s: 1, z: 1 }, 'sp']]],
    ['b2', 'dm-bdg dm-out', 'Outstanding', { x: 157, y: -12, z: 120, w: 90, h: 22, s: .4 }, [[5.77, .9, { o: 1, s: 1, z: 1 }, 'sp']]],
    ['b3', 'dm-bdg dm-late', 'Late', { x: 136, y: 28, z: 120, w: 48, h: 22, s: .4 }, [[5.84, .9, { o: 1, s: 1, z: 1 }, 'sp']]],
    ['b4', 'dm-bdg dm-pd', 'Paid', { x: 136, y: 68, z: 120, w: 48, h: 22, s: .4 }, [[5.91, .9, { o: 1, s: 1, z: 1 }, 'sp']]],
    ['fk', 'dm-chk', CHECK, { x: -241, y: -52, z: 120, w: 18, h: 18, s: .4 }, [[5.98, .9, { o: 1, s: 1, z: 1 }, 'sp']]],
    // the rest of the page
    ['fr', 'dm-frame', '', { x: 0, y: 0, z: -3, w: 960, h: 600, s: .9 }, [[4.75, 1, { o: 1, s: 1 }, 'sf']]],
    ['sd', 'dm-side', side, { x: -560, y: 24, z: -2, w: 190, h: 552 }, [[4.9, 1.1, { o: 1, x: -385 }, 'sp']]],
    ['tp', 'dm-top', top, { x: 0, y: -340, z: -2, w: 960, h: 48 }, [[5.0, 1.1, { o: 1, y: -276 }, 'sp']]],
    ['fx', 'dm-txt', 'Clear', { x: 296, y: 268, z: 1, w: 48, h: 36 }, [[6.0, .6, { o: 1 }, 'out']]],
    // logo
    ['mk', 'dm-mark', R_GLYPH, { x: -110, y: 0, w: 88, h: 88, s: 0, rz: -40 }, [[8.6, 1, { o: 1, s: 1, rz: 0 }, 'sp'], [10.5, .45, { o: 0, s: .9 }, 'io']]],
    ['wd', 'dm-word', 'RealInsight', { x: 90, y: 0, w: 236, h: 44 }, [[8.85, .9, { o: 1, x: 62 }, 'sf'], [10.5, .45, { o: 0 }, 'io']]]
  ];
  // Everything on the page funnels into the centre before the logo appears.
  var funnel = ['fk', 'b4', 'b3', 'b2', 'b1', 'fx', 'btl', 'tkc', 'ff', 'fgl', 'fg', 'fcp', 'fi', 'tab', 'pt', 'tbl', 'fc', 'tp', 'sd', 'fr'];
  funnel.forEach(function (id, i) {
    var o = S.filter(function (x) { return x[0] === id; })[0];
    o[4].push([8.05 + i * .025, .55, { x: 0, y: 0, s: 0, o: 0 }, 'in']);
  });
  // Camera keys
  var CAM0 = { cx: 338, cy: 180, z: 3.1, rx: 0, ry: 0, rz: 0 };
  var CAM = [
    [0.7, 1.5, { z: 1.5, cy: 142, rx: 16, ry: -18 }, 'sf'],
    [2.0, 1.1, { z: 2.4, cy: 178, rx: 6, ry: 14 }, 'sf'],
    [2.95, 1.0, { z: 1.85, cx: 345, cy: 186, rx: 0, ry: 0, rz: 0 }, 'sf'],   // flat, head-on for the redlines
    [4.6, 1.8, { z: .5, cx: 40, cy: 0, rx: 48, rz: -28 }, 'sf'],
    [6.75, 1.3, { z: .5, cx: 30, cy: 10, rx: 18, rz: -7 }, 'sf'],
    [8.0, 1, { z: 1, cx: 0, cy: 0, rx: 0, ry: 0, rz: 0 }, 'io']
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
      var dark = T > 6.8 && T < 8.0;               // light -> dark mode flip on the finished page
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
    if (reduce) { render(6.6); return; }
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
