// Design system cover, camera version, built from RealInsight's real components (fake data).
// A tiny timeline engine with spring easing drives a camera through a CSS 3D
// scene: tokens up close -> they snap into a button -> redlines measure it ->
// a card assembles around it -> it all funnels into the logo.
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
  // World units are px.
  var R_GLYPH = '<svg viewBox="0 0 36 36" aria-hidden="true"><path fill="#0B0B0B" d="M10.0181 17.7239V26.9998H14.0679V17.7239H10.0181ZM10.0181 13.5683V16.7511H14.0679V13.5683H10.0181ZM14.0674 12.6041H18.1166C20.1051 12.6041 21.311 13.507 21.311 15.1641V15.2341C21.311 16.7599 20.1773 17.7941 18.1884 17.7941H15.1293V21.2572H17.2623L21.2397 27H26L21.5189 20.5647C23.8678 19.7319 25.4962 17.8644 25.4962 15.0236V14.9536C25.4962 13.288 24.9292 11.8411 23.9302 10.868C22.5804 9.62249 20.8074 9 18.4594 9H10V12.5336"/></svg>';
  // Beats (seconds): 0 tokens | 2.1 button forms | 3.0 redlines | 4.6 card assembles around the button |
  // 6.2 press | 6.8 dark mode | 8.05 collapse | 8.6 logo | loop at 11.2. See storyboard for notes.
  // The button sits at 0,0 the whole time; it is Button / size sm: 128x32 (hug), 16/8 padding, radius 10.
  var BX = 0, BY = 0;
  function sk(w, extra) { return '<i class="dm-sk' + (extra ? ' ' + extra : '') + '" style="width:' + w + 'px"></i>'; }
  var CARD = { l: -272, t: -300, w: 360, h: 340 };      // card: right edge 88, bottom 40 (24px padding around the button)
  var cx = CARD.l + CARD.w / 2, cy = CARD.t + CARD.h / 2, L = CARD.l + 24;
  function row(w, y) { return { x: L + w / 2, y: y, w: w }; }
  var DOWN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  var DROP = function (t) { return [t, .9, { o: 1, s: 1, z: 1 }, 'sp']; };
  var FADE = function (t) { return [t, .3, { o: 0 }, 'io']; };
  var S = [
    // 1. tokens, gathered around the spot where the button will live
    ['tkc', 'dm-tk dm-tk-c dm-btn', '', { x: BX, y: BY, z: 1, w: 56, h: 56, r: 14, s: 0 }, [[0.25, .9, { o: 1, s: 1 }, 'sp'], [2.1, 1, { w: 128, h: 32, r: 10 }, 'sp'], [6.2, .16, { s: .93 }, 'io'], [6.36, .6, { s: 1 }, 'sp']]],
    ['lc', 'dm-lbl', '<b>Brand Blue/500</b>#1F8ACA', { x: BX, y: BY + 56, w: 150, h: 26 }, [[0.6, .6, { o: 1, y: BY + 48 }, 'sf'], [1.25, .3, { o: 0, y: BY + 40 }, 'io']]],
    ['lc2', 'dm-lbl', '<b>background/brand/bold</b>semantic token', { x: BX, y: BY + 58, w: 170, h: 26 }, [[1.35, .6, { o: 1, y: BY + 48 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tka', 'dm-tk dm-tk-a', 'Aa', { x: BX - 106, y: BY - 30, w: 56, h: 56, s: 0 }, [[0.85, .9, { o: 1, s: 1 }, 'sp'], [2.0, .55, { x: BX, y: BY, s: .3, o: 0 }, 'io']]],
    ['la', 'dm-lbl', '<b>DM Sans Medium</b>14px', { x: BX - 106, y: BY + 20, w: 110, h: 26 }, [[1.05, .6, { o: 1, y: BY + 14 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tkr', 'dm-tk dm-tk-r', '', { x: BX + 106, y: BY - 30, w: 50, h: 50, s: 0 }, [[1.15, .9, { o: 1, s: 1 }, 'sp'], [2.05, .55, { x: BX + 60, y: BY - 10, s: .3, o: 0 }, 'io']]],
    ['lr', 'dm-lbl', '<b>radius/lg</b>10px', { x: BX + 106, y: BY + 20, w: 100, h: 26 }, [[1.3, .6, { o: 1, y: BY + 14 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tks', 'dm-tk dm-tk-s', '<i style="height:6px"></i><i style="height:12px"></i><i style="height:18px"></i><i style="height:26px"></i>', { x: BX, y: BY - 84, w: 56, h: 50, s: 0 }, [[1.4, .9, { o: 1, s: 1 }, 'sp'], [2.05, .55, { y: BY - 10, s: .3, o: 0 }, 'io']]],
    ['ls', 'dm-lbl', '<b>space/lg</b>16px', { x: BX, y: BY - 122, w: 100, h: 26 }, [[1.55, .6, { o: 1, y: BY - 126 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    // 2. button label
    ['btl', 'dm-btl', 'Create invoice', { x: BX, y: BY, z: 2, w: 96, h: 16, s: .6 }, [[2.45, .6, { o: 1, s: 1 }, 'sp'], [6.2, .16, { s: .93 }, 'io'], [6.36, .6, { s: 1 }, 'sp']]],
    // 3. redlines: just the padding, like a spec sheet. Solid vermilion lines on the button's
    // edges and padding edges, running a little past it, labelled 16 (sides) and 8 (top, bottom).
    ['h1', 'dm-gl', '', { x: BX - 4, y: BY - 16, z: 3, w: 0, h: 1 }, [[3.05, .45, { o: 1, w: 184 }, 'out'], FADE(4.3)]],
    ['h2', 'dm-gl', '', { x: BX - 4, y: BY - 8, z: 3, w: 0, h: 1 }, [[3.1, .45, { o: 1, w: 184 }, 'out'], FADE(4.3)]],
    ['h3', 'dm-gl', '', { x: BX - 4, y: BY + 8, z: 3, w: 0, h: 1 }, [[3.15, .45, { o: 1, w: 184 }, 'out'], FADE(4.3)]],
    ['h4', 'dm-gl', '', { x: BX - 4, y: BY + 16, z: 3, w: 0, h: 1 }, [[3.2, .45, { o: 1, w: 184 }, 'out'], FADE(4.3)]],
    ['v1', 'dm-gl', '', { x: BX - 64, y: BY - 4, z: 3, w: 1, h: 0 }, [[3.25, .45, { o: 1, h: 72 }, 'out'], FADE(4.3)]],
    ['v2', 'dm-gl', '', { x: BX - 48, y: BY - 4, z: 3, w: 1, h: 0 }, [[3.3, .45, { o: 1, h: 72 }, 'out'], FADE(4.3)]],
    ['v3', 'dm-gl', '', { x: BX + 48, y: BY - 4, z: 3, w: 1, h: 0 }, [[3.35, .45, { o: 1, h: 72 }, 'out'], FADE(4.3)]],
    ['v4', 'dm-gl', '', { x: BX + 64, y: BY - 4, z: 3, w: 1, h: 0 }, [[3.4, .45, { o: 1, h: 72 }, 'out'], FADE(4.3)]],
    ['m1', 'dm-num16', '16', { x: BX - 56, y: BY - 50, z: 4, w: 24, h: 14 }, [[3.55, .4, { o: 1, y: BY - 52 }, 'out'], FADE(4.3)]],
    ['m2', 'dm-num16', '16', { x: BX + 56, y: BY - 50, z: 4, w: 24, h: 14 }, [[3.6, .4, { o: 1, y: BY - 52 }, 'out'], FADE(4.3)]],
    ['m3', 'dm-num16', '8', { x: BX - 108, y: BY - 12, z: 4, w: 14, h: 14 }, [[3.65, .4, { o: 1, x: BX - 110 }, 'out'], FADE(4.3)]],
    ['m4', 'dm-num16', '8', { x: BX - 108, y: BY + 12, z: 4, w: 14, h: 14 }, [[3.7, .4, { o: 1, x: BX - 110 }, 'out'], FADE(4.3)]],
    // 4. a generic card assembles around the button
    ['card', 'dm-card', '', { x: cx, y: cy, z: -2, w: CARD.w, h: CARD.h, s: .85 }, [[4.6, 1, { o: 1, s: 1 }, 'sp']]],
    ['ttl', 'dm-h3', 'New invoice', at(row(200, -262), { z: 90, h: 28, s: .6 }), [DROP(4.8)]],
    ['sub', 'dm-row', sk(180), at(row(180, -240), { z: 90, h: 8, s: .6 }), [DROP(4.86)]],
    ['l1', 'dm-row', sk(56, 'dm-sk-strong'), at(row(56, -216), { z: 90, h: 8, s: .6 }), [DROP(4.92)]],
    ['in1', 'dm-inp', '<span class="dm-pre">$</span>12,400.00', at(row(312, -186), { z: 90, h: 36, s: .6 }), [DROP(4.98)]],
    ['l2', 'dm-row', sk(64, 'dm-sk-strong'), at(row(64, -152), { z: 90, h: 8, s: .6 }), [DROP(5.04)]],
    ['in2', 'dm-inp dm-dd', 'Net 30' + DOWN, at(row(312, -122), { z: 90, h: 36, s: .6 }), [DROP(5.1)]],
    ['tg', 'dm-tgl', '', at(row(36, -76), { z: 90, h: 20, s: .5 }), [DROP(5.16)]],
    ['tgl', 'dm-tlbl', 'Send to borrower', at({ x: L + 48 + 60, y: -76, w: 120 }, { z: 90, h: 20, s: .6 }), [DROP(5.22)]],
    ['div', 'dm-div', '', { x: cx, y: -40, z: 1, w: 0, h: 1 }, [[5.3, .5, { o: 1, w: CARD.w }, 'out']]],
    ['cn', 'dm-ghost', 'Cancel', { x: BX - 112, y: BY, z: 90, w: 80, h: 32, s: .6 }, [DROP(5.36)]],
    // 8. logo: RealInsight's R mark (from the Figma Logos page)
    ['mk', 'dm-mark', R_GLYPH, { x: -110, y: 0, w: 88, h: 88, s: 0, rz: -40 }, [[8.6, 1, { o: 1, s: 1, rz: 0 }, 'sp'], [10.5, .45, { o: 0, s: .9 }, 'io']]],
    ['wd', 'dm-word', 'RealInsight', { x: 90, y: 0, w: 236, h: 44 }, [[8.85, .9, { o: 1, x: 62 }, 'sf'], [10.5, .45, { o: 0 }, 'io']]]
  ];
  function at(r, extra) { var o = {}, k; for (k in r) o[k] = r[k]; for (k in extra) o[k] = extra[k]; return o; }
  // 7. everything funnels into the centre before the logo appears
  var funnel = ['cn', 'btl', 'tkc', 'div', 'tgl', 'tg', 'in2', 'l2', 'in1', 'l1', 'sub', 'ttl', 'card'];
  funnel.forEach(function (id, i) {
    var o = S.filter(function (x) { return x[0] === id; })[0];
    o[4].push([8.05 + i * .03, .55, { x: 0, y: 0, s: 0, o: 0 }, 'in']);
  });
  // Camera keys
  var CAM0 = { cx: BX, cy: BY, z: 3.1, rx: 0, ry: 0, rz: 0 };
  var CAM = [
    [0.7, 1.5, { z: 1.5, cy: BY - 38, rx: 16, ry: -18 }, 'sf'],
    [2.0, 1.1, { z: 2.4, cy: BY - 2, rx: 6, ry: 14 }, 'sf'],
    [2.95, 1.0, { z: 2.4, cx: BX - 12, cy: BY - 12, rx: 0, ry: 0, rz: 0 }, 'sf'],   // flat, head-on for the redlines
    [4.45, 1.7, { z: .92, cx: cx, cy: cy, rx: 26, ry: -18, rz: -6 }, 'sf'],
    [6.5, 1.4, { z: .98, rx: 10, ry: 10, rz: 2 }, 'sf'],
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
      var dark = T > 6.8 && T < 8.05;               // light -> dark mode flip on the finished page
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
      if (last && !host.dsPaused) clock = (clock + Math.min(.05, (now - last) / 1000)) % LOOP;
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
