// Generates every app icon/splash asset from one vector mark ("sun on the horizon").
// Usage: node scripts/gen-icons.mjs
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const out = (p) => new URL(`../assets/images/${p}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
mkdirSync(out(''), { recursive: true });

const AMBER = '#F2B872';
const INK = '#0B1418';

/** The mark alone, centred in a `size` box with the horizon at 62.5% height. */
function mark({ size = 1024, color = AMBER, mono = false, rings = true, glow = true } = {}) {
  const cx = size / 2;
  const hy = size * 0.625;
  const r = size * 0.205;
  const sunFill = mono ? color : 'url(#sun)';
  return `
  <defs>
    <radialGradient id="sun" cx="${cx}" cy="${hy}" r="${r * 1.2}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFE2B3"/>
      <stop offset="0.55" stop-color="${AMBER}"/>
      <stop offset="1" stop-color="#E3925E"/>
    </radialGradient>
    <radialGradient id="glow" cx="${cx}" cy="${hy}" r="${size * 0.45}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${AMBER}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hz" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${color}" stop-opacity="0"/>
      <stop offset="0.16" stop-color="${color}" stop-opacity="1"/>
      <stop offset="0.84" stop-color="${color}" stop-opacity="1"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="above"><rect x="0" y="0" width="${size}" height="${hy}"/></clipPath>
  </defs>
  ${glow && !mono ? `<circle cx="${cx}" cy="${hy}" r="${size * 0.45}" fill="url(#glow)" clip-path="url(#above)"/>` : ''}
  ${
    rings
      ? `<circle cx="${cx}" cy="${hy}" r="${r * 1.42}" fill="none" stroke="${color}" stroke-opacity="${mono ? 0.5 : 0.2}" stroke-width="${size * 0.006}" clip-path="url(#above)"/>
  <circle cx="${cx}" cy="${hy}" r="${r * 1.78}" fill="none" stroke="${color}" stroke-opacity="${mono ? 0.3 : 0.1}" stroke-width="${size * 0.006}" clip-path="url(#above)"/>`
      : ''
  }
  <circle cx="${cx}" cy="${hy}" r="${r}" fill="${sunFill}" clip-path="url(#above)"/>
  <rect x="${size * 0.08}" y="${hy - size * 0.004}" width="${size * 0.84}" height="${size * 0.008}" rx="${size * 0.004}" fill="url(#hz)"/>
  <rect x="${cx - size * 0.2}" y="${hy + size * 0.034}" width="${size * 0.4}" height="${size * 0.006}" rx="${size * 0.003}" fill="${color}" opacity="${mono ? 0.6 : 0.26}"/>
  <rect x="${cx - size * 0.125}" y="${hy + size * 0.064}" width="${size * 0.25}" height="${size * 0.006}" rx="${size * 0.003}" fill="${color}" opacity="${mono ? 0.4 : 0.14}"/>`;
}

const sky = (size) => `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#091317"/>
      <stop offset="0.5" stop-color="#132C34"/>
      <stop offset="0.625" stop-color="#1F3B41"/>
      <stop offset="0.63" stop-color="#0F1E23"/>
      <stop offset="1" stop-color="${INK}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#sky)"/>`;

const svg = (size, body) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`);

// iOS app icon: full-bleed, opaque (App Store rejects alpha).
await sharp(svg(1024, sky(1024) + mark({ size: 1024 })))
  .flatten({ background: INK })
  .png()
  .toFile(out('icon.png'));

// Splash: the mark on transparent, shown centred on the ink background.
await sharp(svg(512, mark({ size: 512, rings: true }))).png().toFile(out('splash-icon.png'));

// Favicon (web build only).
await sharp(svg(1024, sky(1024) + mark({ size: 1024, rings: false }))).resize(48, 48).png().toFile(out('favicon.png'));

// Android adaptive icon layers (kept valid even though iOS is the target).
const fg = 432;
await sharp(svg(fg, `<g transform="translate(${fg * 0.17} ${fg * 0.14}) scale(0.66)">${mark({ size: fg, glow: false })}</g>`))
  .png()
  .toFile(out('android-icon-foreground.png'));
await sharp(svg(fg, sky(fg))).png().toFile(out('android-icon-background.png'));
await sharp(
  svg(fg, `<g transform="translate(${fg * 0.17} ${fg * 0.14}) scale(0.66)">${mark({ size: fg, color: '#FFFFFF', mono: true, glow: false })}</g>`),
)
  .png()
  .toFile(out('android-icon-monochrome.png'));

console.log('icons written to assets/images');
