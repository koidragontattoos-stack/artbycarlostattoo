// QA regression checks derived from the 2026-07-16 audit.
// Run from repo root: node tools/qa-check.mjs   (exit 1 on any failure)
import { readFileSync, readdirSync, statSync } from 'fs';

let fails = 0;
const check = (ok, label) => { console.log((ok ? 'PASS' : 'FAIL') + '  ' + label); if (!ok) fails++; };

// C1 guard: base img rule must keep height:auto, or images styled width:100%
// render at their fixed height attribute and distort.
const css = readFileSync('css/style.css', 'utf8');
check(/(^|[}\s])img\{[^}]*height:auto/m.test(css), 'style.css base img rule has height:auto (C1)');

const pages = readdirSync('.').filter(f => f.endsWith('.html') && f !== 'google78aa9ab305f54d52.html');

// M1 guard: every page ships the noscript reveal fallback.
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  check(html.includes('<noscript><style>.reveal{opacity:1!important'), `${p} has noscript reveal fallback (M1)`);
}

// Schema guard: every JSON-LD block parses.
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let ok = true;
  for (const b of blocks) { try { JSON.parse(b[1]); } catch { ok = false; } }
  check(ok, `${p} JSON-LD parses (${blocks.length} blocks)`);
}

// Indexability guard: no accidental noindex on indexable pages (historical failure mode).
const noindexAllowed = new Set(['thank-you.html', '404.html']);
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
  const ok = noindexAllowed.has(p) ? true : !robots.includes('noindex');
  check(ok, `${p} robots meta not noindex ("${robots}")`);
}

// N2 guard: no image in media/ over 200 KB (videos exempt).
for (const f of readdirSync('media')) {
  if (!/\.(webp|jpg|jpeg|png)$/i.test(f)) continue;
  const kb = Math.round(statSync('media/' + f).size / 1024);
  check(kb <= 200, `media/${f} <= 200KB (${kb}KB)`);
}

console.log(fails ? `\n${fails} check(s) FAILED` : '\nAll checks passed');
process.exit(fails ? 1 : 0);
