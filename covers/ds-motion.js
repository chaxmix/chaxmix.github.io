// Design system cover, camera version, built from RealInsight's real components (fake data).
// A tiny timeline engine with spring easing drives a camera through a CSS 3D
// scene: tokens up close -> they snap into a button -> redlines measure it ->
// the Field Usage screen assembles around it -> it all funnels into the logo.
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
  // The screen is RealInsight's Field Usage drill-down at its real size (1677x978), centred on 0,0,
  // so the button and every measurement are true pixels. Content is skeleton filler.
  var BX = 750.5, BY = -357.5;               // "Create invoice" button (Button / size sm) on that screen
  function px(x0, y0, x1, y1) { return { x: (x0 + x1) / 2 - 838.5, y: (y0 + y1) / 2 - 489, w: x1 - x0, h: y1 - y0 }; }
  function at(r, extra) { var o = {}, k; for (k in r) o[k] = r[k]; for (k in extra) o[k] = extra[k]; return o; }
  function ab(x, y, w, h, cls, html) { return '<i class="' + cls + '" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px">' + (html || '') + '</i>'; }
  var SV = function (d, s) { return '<svg viewBox="0 0 24 24" width="' + (s || 20) + '" height="' + (s || 20) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
  var IC = {
    home: '<path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    doc: '<path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6"/>',
    chart: '<path d="M4 20V4M4 20h16M8 15l4-4 3 3 5-6"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    bars: '<path d="M4 20V4M8 17h8M8 12h12M8 7h6"/>',
    user: '<circle cx="10" cy="8" r="4"/><path d="M3 20c1-4 4-6 7-6s4 1 5 2M18 15v6M15 18h6"/>',
    more: '<path d="M7 7l5 5-5 5M13 7l5 5-5 5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>',
    srch: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    out: '<path d="M8 16 16 8M9 8h7v7"/>',
    sort: '<path d="M8 10l4-4 4 4M8 14l4 4 4-4"/>',
    left: '<path d="M15 6l-6 6 6 6"/>'
  };
  function sk(w, cls) { return '<i class="dm-sk' + (cls ? ' ' + cls : '') + '" style="width:' + w + 'px"></i>'; }

  var top = ab(12, 10, 36, 36, 'dm-logo', R_GLYPH) +
    ab(570, 12, 500, 32, 'dm-tsearch', '<b>Entities</b><span>Search</span>' + SV(IC.srch, 18)) +
    ab(1599, 18, 20, 20, 'dm-icn', SV(IC.bell)) + ab(1631, 11, 34, 34, 'dm-av', 'TC');
  var railIcons = ['home', 'doc', 'chart', 'card', 'grid', 'bars', 'user'];
  var rail = railIcons.map(function (k, i) { return ab(20, 31 + 40 * i, 20, 20, 'dm-icn' + (i === 4 ? ' dm-on' : ''), SV(IC[k])); }).join('') +
    ab(10, 183, 40, 36, 'dm-railon') + ab(20, 817, 20, 20, 'dm-icn', SV(IC.more)) + ab(14, 865, 32, 32, 'dm-icn dm-globe', SV(IC.globe));
  var dsW = [118, 96, 168, 154, 92, 86, 104, 92, 136, 112, 140, 118, 64, 150, 142, 170, 108];
  var dsp = ab(24, 28, 200, 32, 'dm-h2', 'Datasets') + dsW.map(function (w, i) {
    return ab(24, 73 + 40 * i, 302, 36, 'dm-dsi' + (i === 0 ? ' dm-on' : ''), sk(w) + SV(IC.chev, 18));
  }).join('');
  var bc = sk(88) + SV(IC.chev, 14) + sk(74) + SV(IC.chev, 14) + sk(96, 'dm-sk-strong');
  var hdr = '<div class="dm-tr dm-th"><span>Field' + SV(IC.sort, 12) + '</span><span>Data entries' + SV(IC.sort, 12) + '</span><span>Reports' + SV(IC.sort, 12) + '</span><span>Model forms' + SV(IC.sort, 12) + '</span><span>RealVIEWs' + SV(IC.sort, 12) + '</span></div>';
  var fw = [58, 64, 52, 70, 60, 56, 66, 62, 54, 68, 58, 64, 60, 52, 66, 58];
  var rows = fw.map(function (w, i) {
    return '<div class="dm-tr' + (i === 2 ? ' dm-hov' : '') + '"><span class="dm-two">' + sk(w, 'dm-sk-strong') + sk(w + 92) + '</span><span>' + sk(22) + '</span><span>' + sk(22) + '</span><span>' + sk(22) + '</span><span>' + sk(22) + '</span></div>';
  }).join('');
  var stat = ab(24, 26, 140, 32, 'dm-h3', 'Status') + ab(24, 60, 190, 12, 'dm-skw', sk(190));
  var stc = '<b class="dm-num">260</b>' + sk(64) + '<em>' + sk(118) + sk(150) + '</em>';
  var tabs = '<b class="dm-on">Reports <i>32</i></b><b>Model forms <i>2</i></b><b>RealVIEWs</b>';
  var link = function (w) { return sk(w, 'dm-sk-brand') + '<span class="dm-ib">' + SV(IC.out, 14) + '</span>'; };
  var pager = SV(IC.left, 14) + '<b class="dm-on">1</b><b>2</b><b>3</b>' + SV(IC.chev, 14);

  var DROP = function (t, z) { return [t, .9, { o: 1, s: 1, z: z || 1 }, 'sp']; };
  var S = [
    // tokens, gathered around the spot where the button will live
    ['tkc', 'dm-tk dm-tk-c dm-btn', '', { x: BX, y: BY, z: 1, w: 56, h: 56, r: 14, s: 0 }, [[0.25, .9, { o: 1, s: 1 }, 'sp'], [2.1, 1, { w: 128, h: 32, r: 10 }, 'sp'], [4.5, .16, { s: .93 }, 'io'], [4.66, .6, { s: 1 }, 'sp']]],
    ['lc', 'dm-lbl', '<b>Brand Blue/500</b>#1F8ACA', { x: BX, y: BY + 56, w: 150, h: 26 }, [[0.6, .6, { o: 1, y: BY + 48 }, 'sf'], [1.25, .3, { o: 0, y: BY + 40 }, 'io']]],
    ['lc2', 'dm-lbl', '<b>background/brand/bold</b>semantic token', { x: BX, y: BY + 58, w: 170, h: 26 }, [[1.35, .6, { o: 1, y: BY + 48 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tka', 'dm-tk dm-tk-a', 'Aa', { x: BX - 106, y: BY - 30, w: 56, h: 56, s: 0 }, [[0.85, .9, { o: 1, s: 1 }, 'sp'], [2.0, .55, { x: BX, y: BY, s: .3, o: 0 }, 'io']]],
    ['la', 'dm-lbl', '<b>DM Sans Medium</b>14px', { x: BX - 106, y: BY + 20, w: 110, h: 26 }, [[1.05, .6, { o: 1, y: BY + 14 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tkr', 'dm-tk dm-tk-r', '', { x: BX + 106, y: BY - 30, w: 50, h: 50, s: 0 }, [[1.15, .9, { o: 1, s: 1 }, 'sp'], [2.05, .55, { x: BX + 60, y: BY - 10, s: .3, o: 0 }, 'io']]],
    ['lr', 'dm-lbl', '<b>radius/lg</b>10px', { x: BX + 106, y: BY + 20, w: 100, h: 26 }, [[1.3, .6, { o: 1, y: BY + 14 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['tks', 'dm-tk dm-tk-s', '<i style="height:6px"></i><i style="height:12px"></i><i style="height:18px"></i><i style="height:26px"></i>', { x: BX, y: BY - 84, w: 56, h: 50, s: 0 }, [[1.4, .9, { o: 1, s: 1 }, 'sp'], [2.05, .55, { y: BY - 10, s: .3, o: 0 }, 'io']]],
    ['ls', 'dm-lbl', '<b>space/lg</b>16px', { x: BX, y: BY - 122, w: 100, h: 26 }, [[1.55, .6, { o: 1, y: BY - 126 }, 'sf'], [1.9, .25, { o: 0 }, 'io']]],
    ['btl', 'dm-btl', 'Create invoice', { x: BX, y: BY, z: 2, w: 96, h: 16, s: .6 }, [[2.45, .6, { o: 1, s: 1 }, 'sp'], [4.5, .16, { s: .93 }, 'io'], [4.66, .6, { s: 1 }, 'sp']]],
    // redlines over the button: Button / size sm = 32 tall, hug width, 16px x 8px padding, radius 10.
    // Guides stop 20px past the button instead of running to the frame edge.
    ['g1', 'dm-g', '', { x: BX, y: BY - 16, z: 3, w: 0, h: 1 }, [[3.05, .45, { o: 1, w: 168 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['g2', 'dm-g', '', { x: BX, y: BY + 16, z: 3, w: 0, h: 1 }, [[3.1, .45, { o: 1, w: 168 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['g3', 'dm-g dm-v', '', { x: BX - 64, y: BY, z: 3, w: 1, h: 0 }, [[3.15, .45, { o: 1, h: 72 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['g4', 'dm-g dm-v', '', { x: BX + 64, y: BY, z: 3, w: 1, h: 0 }, [[3.2, .45, { o: 1, h: 72 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['g5', 'dm-g dm-soft', '', { x: BX, y: BY - 8, z: 3, w: 0, h: 1 }, [[3.3, .4, { o: 1, w: 128 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['g6', 'dm-g dm-soft', '', { x: BX, y: BY + 8, z: 3, w: 0, h: 1 }, [[3.33, .4, { o: 1, w: 128 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['g7', 'dm-g dm-v dm-soft', '', { x: BX - 48, y: BY, z: 3, w: 1, h: 0 }, [[3.36, .4, { o: 1, h: 32 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['g8', 'dm-g dm-v dm-soft', '', { x: BX + 48, y: BY, z: 3, w: 1, h: 0 }, [[3.39, .4, { o: 1, h: 32 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    // dimension lines: left/right padding, top/bottom padding, height
    ['d1', 'dm-d', '', { x: BX - 56, y: BY, z: 3, w: 0, h: 5 }, [[3.5, .3, { o: 1, w: 16 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['d2', 'dm-d', '', { x: BX + 56, y: BY, z: 3, w: 0, h: 5 }, [[3.53, .3, { o: 1, w: 16 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['d3', 'dm-d dm-v', '', { x: BX, y: BY - 12, z: 3, w: 5, h: 0 }, [[3.56, .3, { o: 1, h: 8 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['d4', 'dm-d dm-v', '', { x: BX, y: BY + 12, z: 3, w: 5, h: 0 }, [[3.59, .3, { o: 1, h: 8 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['d5', 'dm-d dm-v', '', { x: BX + 76, y: BY, z: 3, w: 5, h: 0 }, [[3.62, .3, { o: 1, h: 32 }, 'out'], [4.3, .3, { o: 0 }, 'io']]],
    ['m1', 'dm-m', '16', { x: BX - 56, y: BY + 30, z: 4, w: 18, h: 12, s: 0 }, [[3.7, .55, { o: 1, s: 1 }, 'sp'], [4.3, .3, { o: 0 }, 'io']]],
    ['m2', 'dm-m', '16', { x: BX + 56, y: BY + 30, z: 4, w: 18, h: 12, s: 0 }, [[3.73, .55, { o: 1, s: 1 }, 'sp'], [4.3, .3, { o: 0 }, 'io']]],
    ['m3', 'dm-m', '8', { x: BX, y: BY - 28, z: 4, w: 14, h: 12, s: 0 }, [[3.76, .55, { o: 1, s: 1 }, 'sp'], [4.3, .3, { o: 0 }, 'io']]],
    ['m4', 'dm-m', '8', { x: BX, y: BY + 30, z: 4, w: 14, h: 12, s: 0 }, [[3.79, .55, { o: 1, s: 1 }, 'sp'], [4.3, .3, { o: 0 }, 'io']]],
    ['m5', 'dm-m', '32', { x: BX + 92, y: BY, z: 4, w: 18, h: 12, s: 0 }, [[3.82, .55, { o: 1, s: 1 }, 'sp'], [4.3, .3, { o: 0 }, 'io']]],
    ['m6', 'dm-m', 'r 10', { x: BX - 80, y: BY - 28, z: 4, w: 26, h: 12, s: 0 }, [[3.85, .55, { o: 1, s: 1 }, 'sp'], [4.3, .3, { o: 0 }, 'io']]],
    ['m7', 'dm-m', 'W hug', { x: BX + 78, y: BY - 28, z: 4, w: 34, h: 12, s: 0 }, [[3.88, .55, { o: 1, s: 1 }, 'sp'], [4.3, .3, { o: 0 }, 'io']]],
    // the Field Usage screen assembles around the button
    ['fr', 'dm-frame', '', at(px(0, 0, 1677, 978), { z: -4, s: .92 }), [[4.7, 1, { o: 1, s: 1 }, 'sf']]],
    ['body', 'dm-body', '', at(px(60, 56, 1677, 978), { z: -3, x: 1200 }), [[4.8, 1.1, { o: 1, x: px(60, 56, 1677, 978).x }, 'sp']]],
    ['tp', 'dm-pane', top, at(px(0, 0, 1677, 56), { z: -2, y: -560 }), [[4.9, 1.1, { o: 1, y: -461 }, 'sp']]],
    ['rail', 'dm-pane', rail, at(px(0, 56, 60, 978), { z: -2, x: -900 }), [[4.95, 1.1, { o: 1, x: -808.5 }, 'sp']]],
    ['dsp', 'dm-pane dm-dsp', dsp, at(px(60, 56, 410, 978), { z: -2, x: -760 }), [[5.05, 1.1, { o: 1, x: -603.5 }, 'sp']]],
    ['bc', 'dm-row', bc, at(px(434, 80, 760, 100), { z: 90, s: .6 }), [DROP(5.2)]],
    ['srch', 'dm-inp', SV(IC.srch, 18) + 'Search fields', at(px(434, 116, 1379, 148), { z: 90, s: .6 }), [DROP(5.25)]],
    ['dd', 'dm-ghost dm-dd', 'Usage source' + SV(IC.down, 16), at(px(1384, 116, 1520, 148), { z: 90, s: .6 }), [DROP(5.3)]],
    ['tb', 'dm-card dm-tbl', hdr + rows, at(px(434, 152, 1199, 900), { z: 60, s: .85 }), [DROP(5.35)]],
    ['st', 'dm-card', stat, at(px(1204, 152, 1653, 900), { z: 60, s: .85 }), [DROP(5.42)]],
    ['cat', 'dm-ghost', 'Catalog', at(px(1546, 177, 1628, 209), { z: 120, s: .5 }), [DROP(5.6, 2)]],
    ['stc', 'dm-stat', stc, at(px(1228, 238, 1628, 298), { z: 120, s: .5 }), [DROP(5.66, 2)]],
    ['tabs', 'dm-ltabs', tabs, at(px(1228, 308, 1628, 338), { z: 120, s: .5 }), [DROP(5.72, 2)]],
    ['lk0', 'dm-link', link(200), at(px(1228, 347, 1628, 397), { z: 120, s: .5 }), [DROP(5.78, 2)]],
    ['lk1', 'dm-link', link(170), at(px(1228, 401, 1628, 451), { z: 120, s: .5 }), [DROP(5.83, 2)]],
    ['lk2', 'dm-link', link(214), at(px(1228, 455, 1628, 505), { z: 120, s: .5 }), [DROP(5.88, 2)]],
    ['lk3', 'dm-link', link(186), at(px(1228, 509, 1628, 559), { z: 120, s: .5 }), [DROP(5.93, 2)]],
    ['lk4', 'dm-link', link(160), at(px(1228, 563, 1628, 613), { z: 120, s: .5 }), [DROP(5.98, 2)]],
    ['ft', 'dm-row', sk(50), at(px(434, 906, 520, 920), { z: 1 }), [[6.0, .5, { o: 1 }, 'out']]],
    ['pg', 'dm-pager', pager, at(px(972, 925, 1118, 955), { z: 90, s: .6 }), [DROP(6.02)]],
    // logo: RealInsight's R mark (from the Figma Logos page)
    ['mk', 'dm-mark', R_GLYPH, { x: -110, y: 0, w: 88, h: 88, s: 0, rz: -40 }, [[8.6, 1, { o: 1, s: 1, rz: 0 }, 'sp'], [10.5, .45, { o: 0, s: .9 }, 'io']]],
    ['wd', 'dm-word', 'RealInsight', { x: 90, y: 0, w: 236, h: 44 }, [[8.85, .9, { o: 1, x: 62 }, 'sf'], [10.5, .45, { o: 0 }, 'io']]]
  ];
  // Everything on the screen funnels into the centre before the logo appears.
  var funnel = ['pg', 'ft', 'lk4', 'lk3', 'lk2', 'lk1', 'lk0', 'tabs', 'stc', 'cat', 'btl', 'tkc', 'dd', 'srch', 'bc', 'st', 'tb', 'dsp', 'rail', 'tp', 'body', 'fr'];
  funnel.forEach(function (id, i) {
    var o = S.filter(function (x) { return x[0] === id; })[0];
    o[4].push([8.05 + i * .022, .55, { x: 0, y: 0, s: 0, o: 0 }, 'in']);
  });
  // Camera keys
  var CAM0 = { cx: BX, cy: BY, z: 3.1, rx: 0, ry: 0, rz: 0 };
  var CAM = [
    [0.7, 1.5, { z: 1.5, cy: BY - 38, rx: 16, ry: -18 }, 'sf'],
    [2.0, 1.1, { z: 2.4, cy: BY - 2, rx: 6, ry: 14 }, 'sf'],
    [2.95, 1.0, { z: 2.25, cx: BX + 6, cy: BY, rx: 0, ry: 0, rz: 0 }, 'sf'],   // flat, head-on for the redlines
    [4.55, 1.9, { z: .26, cx: -60, cy: 130, rx: 36, rz: -18 }, 'sf'],
    [6.75, 1.3, { z: .3, cx: 10, cy: 10, rx: 18, rz: -7 }, 'sf'],
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
