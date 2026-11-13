// Builds assets/data/airports.json from the public-domain OurAirports dataset.
// Usage: node scripts/build-airports.mjs
// Keeps large/medium airports with an IATA code and scheduled service, and adds
// an IANA time zone per airport (computed from coordinates at build time).
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tzlookup = require('@photostructure/tz-lookup');

const SRC = 'https://davidmegginson.github.io/ourairports-data/airports.csv';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const res = await fetch(SRC);
if (!res.ok) throw new Error(`Download failed: ${res.status}`);
const rows = parseCsv(await res.text());
const head = rows[0];
const col = (name) => {
  const i = head.indexOf(name);
  if (i < 0) throw new Error(`Missing column ${name}`);
  return i;
};
const C = {
  type: col('type'),
  name: col('name'),
  lat: col('latitude_deg'),
  lon: col('longitude_deg'),
  country: col('iso_country'),
  city: col('municipality'),
  sched: col('scheduled_service'),
  icao: col('icao_code'),
  gps: col('gps_code'),
  ident: col('ident'),
  iata: col('iata_code'),
};

const seen = new Set();
const out = [];
for (const r of rows.slice(1)) {
  const type = r[C.type];
  if (type !== 'large_airport' && type !== 'medium_airport') continue;
  if (r[C.sched] !== 'yes') continue;
  const iata = (r[C.iata] || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{3}$/.test(iata) || seen.has(iata)) continue;
  const lat = Number(r[C.lat]);
  const lon = Number(r[C.lon]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  let tz = 'UTC';
  try {
    tz = tzlookup(lat, lon);
  } catch {
    tz = 'UTC';
  }
  seen.add(iata);
  const icao = (r[C.icao] || r[C.gps] || r[C.ident] || '').trim().toUpperCase();
  // Compact tuple: [iata, icao, name, city, country, lat, lon, tz, large(1/0)]
  out.push([
    iata,
    icao,
    r[C.name].trim(),
    (r[C.city] || '').trim(),
    r[C.country].trim(),
    Math.round(lat * 1e4) / 1e4,
    Math.round(lon * 1e4) / 1e4,
    tz,
    type === 'large_airport' ? 1 : 0,
  ]);
}
out.sort((a, b) => b[8] - a[8] || a[0].localeCompare(b[0]));
writeFileSync(
  new URL('../assets/data/airports.json', import.meta.url),
  JSON.stringify({ source: 'OurAirports (public domain) — ourairports.com', built: new Date().toISOString().slice(0, 10), airports: out }),
);
console.log(`airports: ${out.length}, large: ${out.filter((a) => a[8]).length}`);
