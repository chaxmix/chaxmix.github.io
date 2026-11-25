#!/usr/bin/env node
// Lock or unlock case studies.
//
//   node tools/lock.mjs
//
// Reads private/locks.json, e.g. { "nda-case-study": "locked" }.
// For each entry it takes the draft at private/work/<name>.html and writes
// work/<name>.html for the public site:
//   "locked"   → an encrypted page that asks for the password in private/password.txt
//   "unlocked" → the normal page, no password
// Images the draft uses from private/ are packed into the page, so they
// never need to be uploaded on their own.
//
// Everything in private/ stays on your computer (it's in .gitignore).
// Needs Node 18 or newer. No packages to install.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webcrypto as crypto } from 'node:crypto';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PRIVATE = join(ROOT, 'private');
const ITERATIONS = 600000;
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.mp4': 'video/mp4' };

const b64 = (buf) => Buffer.from(buf).toString('base64');

async function inlineAssets(html, draftPath) {
  const base = dirname(draftPath);
  const out = [];
  let last = 0;
  const re = /\b(src|poster)="([^"]+)"/g;
  for (const m of html.matchAll(re)) {
    const [whole, attr, url] = m;
    if (/^(https?:|data:|\/\/)/.test(url)) continue;
    const file = resolve(base, url);
    if (!file.startsWith(PRIVATE) || !existsSync(file)) continue;
    const mime = MIME[extname(file).toLowerCase()];
    if (!mime) continue;
    out.push(html.slice(last, m.index), `${attr}="data:${mime};base64,${b64(await readFile(file))}"`);
    last = m.index + whole.length;
  }
  out.push(html.slice(last));
  return out.join('');
}

async function encrypt(text, password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  return { salt: b64(salt), iv: b64(iv), data: b64(data), iterations: ITERATIONS };
}

function titleOf(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1] : 'Protected case study';
}

function lockPage(payload, title) {
  // Shown to visitors before they enter the password. Only the page title is visible.
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex">
  <title>${title}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@500&display=swap">
  <link rel="stylesheet" href="../styles.css?v=202611252130">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
</head>
<body>
<header class="site-header">
  <a class="logo" href="../index.html" aria-label="Tiffany Chang, home"><svg class="seal" viewBox="0 0 100 100" aria-hidden="true"><defs><filter id="seal-worn" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="w"/><feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="3" seed="21" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -30 23.2" result="holes"/><feComposite in="w" in2="holes" operator="in"/></filter></defs><g class="seal-print" filter="url(#seal-worn)"><path class="seal-stone" d="M5 6 Q4 4 7 4 L93 5 Q96 5 96 8 L95 93 Q95 96 92 96 L8 95 Q5 95 5 92 Z"/><g class="seal-glyph"><path d="M18 18 H34 Q40 18 40 24 V33 Q40 39 34 39 H24 Q18 39 18 45 V55 Q18 61 24 61 H34 Q40 61 40 67 V76 Q40 82 34 82 H24 Q18 82 18 76"/><path d="M55 18 V82"/><path d="M55 39 Q72 35 80 18"/><path d="M48 50 H82"/><path d="M66 50 Q71 74 82 82"/></g></g><g class="seal-build"><line class="seal-edge" x1="4" y1="4" x2="96" y2="4"/><line class="seal-edge" x1="4" y1="96" x2="96" y2="96"/><line class="seal-edge" x1="4" y1="4" x2="4" y2="96"/><line class="seal-edge" x1="96" y1="4" x2="96" y2="96"/><line class="seal-guide" x1="47" y1="4" x2="47" y2="96"/><line class="seal-guide" x1="4" y1="50" x2="96" y2="50"/><g class="seal-ghost"><path pathLength="1" d="M18 18 H34 Q40 18 40 24 V33 Q40 39 34 39 H24 Q18 39 18 45 V55 Q18 61 24 61 H34 Q40 61 40 67 V76 Q40 82 34 82 H24 Q18 82 18 76"/><path pathLength="1" d="M55 18 V82"/><path pathLength="1" d="M55 39 Q72 35 80 18"/><path pathLength="1" d="M48 50 H82"/><path pathLength="1" d="M66 50 Q71 74 82 82"/></g></g></svg></a>
  <nav class="nav-pill" aria-label="Main"><a href="../index.html" aria-current="page">Work</a><a href="../about.html">About</a><a href="../play.html">Play</a></nav>
  <time class="clock" data-clock aria-label="Your local time"></time>
</header>
<main class="wrap">
  <section class="lock-panel" aria-labelledby="lock-title">
    <span class="label">Protected case study</span>
    <h1 id="lock-title">This project is under NDA</h1>
    <p>Enter the password to view it. Don’t have one? <a href="../contact.html">Ask me for access</a>.</p>
    <form class="form" id="unlock-form">
      <div class="field"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required autofocus></div>
      <div class="btn-row"><button class="btn primary" type="submit" id="unlock-btn">View case study</button></div>
      <p class="form-note" id="unlock-status" aria-live="polite"></p>
    </form>
  </section>
</main>
<script>
const P = ${JSON.stringify(payload)};
const KEY = 'portfolio-pw';
const d = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function unlock(pw) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: d(P.salt), iterations: P.iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: d(P.iv) }, key, d(P.data));
  return new TextDecoder().decode(plain);
}
function show(html) { document.open(); document.write(html); document.close(); }
(function () { var c = document.querySelector('[data-clock]'); if (c) c.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); })();
(async () => {
  let saved = null;
  try { saved = sessionStorage.getItem(KEY); } catch (e) {}
  if (saved) { try { show(await unlock(saved)); return; } catch (e) {} }
})();
document.getElementById('unlock-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pw = document.getElementById('pw').value;
  const status = document.getElementById('unlock-status');
  const btn = document.getElementById('unlock-btn');
  btn.disabled = true; status.textContent = 'Unlocking…';
  try {
    const html = await unlock(pw);
    try { sessionStorage.setItem(KEY, pw); } catch (e) {}
    show(html);
  } catch (err) {
    status.textContent = 'That password didn’t work. Check it and try again.';
    btn.disabled = false;
  }
});
</script>
</body>
</html>
`;
}

async function setCardState(name, locked) {
  // Updates data-locked on any card with data-case="<name>" so the lock badge matches.
  const files = ['index.html', ...(await readdir(join(ROOT, 'work'))).filter(f => f.endsWith('.html')).map(f => join('work', f))];
  for (const f of files) {
    const p = join(ROOT, f);
    const html = await readFile(p, 'utf8');
    const re = new RegExp(`(data-case="${name}")(\\s+data-locked="(?:true|false)")?`, 'g');
    const next = html.replace(re, `$1 data-locked="${locked}"`);
    if (next !== html) await writeFile(p, next);
  }
}

async function main() {
  const locks = JSON.parse(await readFile(join(PRIVATE, 'locks.json'), 'utf8'));
  const pwFile = join(PRIVATE, 'password.txt');
  const password = process.env.PORTFOLIO_PASSWORD || (existsSync(pwFile) ? (await readFile(pwFile, 'utf8')).trim() : '');
  for (const [name, state] of Object.entries(locks)) {
    if (name.startsWith('_')) continue;
    const draft = join(PRIVATE, 'work', `${name}.html`);
    if (!existsSync(draft)) { console.error(`✗ ${name}: no draft at ${relative(ROOT, draft)}`); process.exitCode = 1; continue; }
    const html = await inlineAssets(await readFile(draft, 'utf8'), draft);
    const outPath = join(ROOT, 'work', `${name}.html`);
    if (state === 'locked') {
      if (password.length < 8) { console.error('✗ Put a password of 8+ characters in private/password.txt first.'); process.exit(1); }
      await writeFile(outPath, lockPage(await encrypt(html, password), titleOf(html)));
      await setCardState(name, true);
      console.log(`🔒 ${name} → work/${name}.html (locked)`);
    } else if (state === 'unlocked') {
      await writeFile(outPath, html);
      await setCardState(name, false);
      console.log(`🔓 ${name} → work/${name}.html (no password)`);
    } else {
      console.error(`✗ ${name}: use "locked" or "unlocked", not "${state}"`); process.exitCode = 1;
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
