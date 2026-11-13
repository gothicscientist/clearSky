// WCAG contrast check for every text/background pairing the UI primitives use.
// Usage: node scripts/check-contrast.mjs   (exits 1 on any failure)
import { palettes } from '../src/theme/tokens.ts';

function lum(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

// [foreground, background, minimum] — 4.5 for body text, 3 for large/decorative labels.
const PAIRS = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text', 'raised', 4.5],
  ['textSecondary', 'bg', 4.5],
  ['textSecondary', 'surface', 4.5],
  ['textSecondary', 'raised', 4.5],
  ['textTertiary', 'bg', 3],
  ['textTertiary', 'surface', 3],
  ['horizon', 'bg', 4.5],
  ['horizon', 'surface', 4.5],
  ['calm', 'bg', 4.5],
  ['calm', 'surface', 4.5],
  ['ember', 'bg', 4.5],
  ['ember', 'surface', 4.5],
  ['onHorizon', 'horizon', 4.5],
  ['onCalm', 'calm', 4.5],
];

let failed = 0;
for (const [scheme, p] of Object.entries(palettes)) {
  for (const [fg, bg, min] of PAIRS) {
    const r = ratio(p[fg], p[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`${ok ? '✓' : '✗'} ${scheme.padEnd(5)} ${fg.padEnd(14)} on ${bg.padEnd(8)} ${r.toFixed(2)}:1 (min ${min})`);
  }
}
if (failed) {
  console.error(`\n${failed} pairing(s) below the WCAG minimum.`);
  process.exit(1);
}
console.log('\nAll pairings pass.');
