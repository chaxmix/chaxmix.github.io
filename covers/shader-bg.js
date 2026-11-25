// Live shader gradient for case study covers (ShaderGradient-style, no libraries).
// Usage: <canvas class="shader-bg" data-colors="#0d0f1a,#3b47b8,#f2542d,#8a5cff"></canvas>
// inside a .cover. Colors: base, main, accent, highlight. The gradient flows
// slowly, swirls toward the cursor when you hover the card, pauses when it is
// off screen, and holds still for people who prefer reduced motion.
(function () {
  var canvases = document.querySelectorAll('canvas.shader-bg');
  if (!canvases.length) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 r;uniform float t;uniform vec3 m;uniform vec3 c0,c1,c2,c3;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+1.),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p=p*2.+vec2(1.7,9.2);a*=.5;}return v;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.);',
    ' vec2 d=m.xy-uv;float pull=exp(-dot(d,d)*4.)*m.z;',
    // silky folds: big slow waves bent by low-frequency noise, like a ShaderGradient plane
    ' float s=t*.18;',
    ' vec2 q=p*.9+vec2(fbm(p*.8+s*.6),fbm(p*.8-s*.5+4.))*1.1+d*pull*.5;',
    ' float w1=sin(q.x*2.6+q.y*1.4+s*2.)*.5+.5;',
    ' float w2=sin(q.y*3.1-q.x*1.2-s*1.6+w1*2.2)*.5+.5;',
    ' float w3=sin((q.x+q.y)*1.7+s*1.2+w2*2.)*.5+.5;',
    ' vec3 col=mix(c0,c1,smoothstep(.05,.95,w1));',
    ' col=mix(col,c2,smoothstep(.55,1.,w2*w3*1.25));',
    ' col=mix(col,c3,smoothstep(.6,1.,w3*(1.-w1)*1.6)*.75);',
    ' col*=.85+.25*smoothstep(0.,1.,w2);',
    ' col+=pull*.05*c2;',
    ' col+=(h(gl_FragCoord.xy+fract(t))-.5)*.045;',
    ' gl_FragColor=vec4(col,1.);}'
  ].join('\n');
  function hex(s) { s = s.trim().replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(s.substr(i, 2), 16) / 255; }); }

  canvases.forEach(function (cv) {
    var gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['r', 't', 'm', 'c0', 'c1', 'c2', 'c3'].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });
    var cols = (cv.dataset.colors || '#0d0f1a,#3b47b8,#f2542d,#8a5cff').split(',');
    ['c0', 'c1', 'c2', 'c3'].forEach(function (k, i) { var c = hex(cols[i] || cols[0]); gl.uniform3f(U[k], c[0], c[1], c[2]); });

    var host = cv.closest('.card') || cv.parentNode;
    var mouse = { x: .5, y: .5, z: 0 }, target = { x: .5, y: .5, z: 0 };
    host.addEventListener('pointermove', function (e) {
      var rc = cv.getBoundingClientRect();
      target.x = (e.clientX - rc.left) / rc.width; target.y = 1 - (e.clientY - rc.top) / rc.height; target.z = 1;
    });
    host.addEventListener('pointerleave', function () { target.z = 0; });

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5) * .6; // soft gradient: low res is fine and fast
      var w = Math.max(1, Math.round(cv.clientWidth * dpr)), h = Math.max(1, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(U.r, w, h); }
    }
    var visible = false, raf = 0, t0 = performance.now(), seed = Math.random() * 100;
    function frame(now) {
      size();
      mouse.x += (target.x - mouse.x) * .06; mouse.y += (target.y - mouse.y) * .06; mouse.z += (target.z - mouse.z) * .04;
      gl.uniform1f(U.t, seed + (now - t0) / 1000);
      gl.uniform3f(U.m, mouse.x, mouse.y, mouse.z);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = (visible && !reduce) ? requestAnimationFrame(frame) : 0;
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      }).observe(cv);
    } else { visible = true; raf = requestAnimationFrame(frame); }
    cv.classList.add('is-live');
  });
})();
