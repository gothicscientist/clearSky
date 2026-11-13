#!/usr/bin/env node
// clearSky end-to-end runner.
//
//   node tests/e2e/run.mjs                 build (if sources changed) + run every flow
//   node tests/e2e/run.mjs --failed        rerun only the cases that failed last time
//   node tests/e2e/run.mjs --only paywall  run cases whose file or name contains "paywall"
//   node tests/e2e/run.mjs --jobs 3        run on 3 browsers in parallel
//   node tests/e2e/run.mjs --record        save a video per case under .results/videos
//   node tests/e2e/run.mjs --no-build      reuse dist-e2e as is
//   node tests/e2e/run.mjs --headed        watch it happen
//   node tests/e2e/run.mjs --list          list cases
//
// Flows live in tests/e2e/flows/*.mjs and default-export an array of { name, run(t) }.
// Results: tests/e2e/.results/last.json (+ screens/ and videos/).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { Browser } from './lib/browser.mjs';
import { createContext } from './lib/context.mjs';
import { startServer } from './server.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = resolve(here, '..', '..');
const require = createRequire(import.meta.url);
const outDir = join(here, '.results');
const lastFile = join(outDir, 'last.json');
const distDir = join(repo, 'dist-e2e');

const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const opt = (f, d) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};

const ONLY = opt('--only', null);
const JOBS = Math.max(1, Number(opt('--jobs', 2)));
const FAILED = flag('--failed');
const RECORD = flag('--record');
const HEADED = flag('--headed');
const CASE_TIMEOUT = Number(opt('--case-timeout', 120000));
const VIEWPORT = { w: 393, h: 852 }; // iPhone 15 / 16 logical points

// ---------- build ----------

function newestMtime(paths) {
  let newest = 0;
  const walk = (p) => {
    if (!existsSync(p)) return;
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const f of readdirSync(p)) if (f !== 'node_modules' && !f.startsWith('.')) walk(join(p, f));
    } else newest = Math.max(newest, st.mtimeMs);
  };
  paths.forEach((p) => walk(join(repo, p)));
  return newest;
}

async function build() {
  const stamp = join(distDir, '.built');
  const srcTime = newestMtime(['src', 'assets', 'app.config.ts', 'package.json', 'babel.config.js', 'metro.config.js']);
  if (flag('--no-build') && existsSync(join(distDir, 'index.html'))) return;
  if (existsSync(stamp) && Number(readFileSync(stamp, 'utf8')) >= srcTime) {
    console.log('• web build is up to date');
    return;
  }
  console.log('• building web bundle for e2e (EXPO_PUBLIC_E2E=1)…');
  const cli = require.resolve('expo/bin/cli', { paths: [repo] });
  await new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [cli, 'export', '--platform', 'web', '--output-dir', 'dist-e2e'], {
      cwd: repo,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        CI: '1',
        EXPO_PUBLIC_E2E: '1',
        EXPO_PUBLIC_PURCHASES_MODE: 'mock',
        EXPO_PUBLIC_AWC_BASE: '/__awc',
      },
    });
    let log = '';
    child.stdout.on('data', (d) => (log += d));
    child.stderr.on('data', (d) => (log += d));
    child.on('close', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`expo export failed (${code}):\n${log.slice(-4000)}`));
    });
  });
  writeFileSync(stamp, String(srcTime));
}

// ---------- discovery ----------

async function discover() {
  const dir = join(here, 'flows');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort() : [];
  const cases = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    const list = Array.isArray(mod.default) ? mod.default : mod.default ? [mod.default] : [];
    for (const c of list) {
      if (!c || typeof c.run !== 'function') continue;
      cases.push({ id: `${f}::${c.name}`, file: f, name: c.name, run: c.run, skip: c.skip });
    }
  }
  return cases;
}

function readLast() {
  try {
    return JSON.parse(readFileSync(lastFile, 'utf8'));
  } catch {
    return null;
  }
}

// ---------- run ----------

async function runCase(browser, baseUrl, c) {
  const started = Date.now();
  const t = createContext({ browser, baseUrl, caseName: `${c.file}-${c.name}`, outDir, record: RECORD });
  try {
    await Promise.race([
      c.run(t),
      new Promise((_, rej) => setTimeout(() => rej(new Error(`case timed out after ${CASE_TIMEOUT} ms`)), CASE_TIMEOUT)),
    ]);
    if (RECORD) await browser.recordStop();
    return { id: c.id, file: c.file, name: c.name, status: 'passed', ms: Date.now() - started };
  } catch (e) {
    const shot = await t.screenshot('FAILED').catch(() => null);
    if (RECORD) await browser.recordStop();
    return {
      id: c.id,
      file: c.file,
      name: c.name,
      status: 'failed',
      ms: Date.now() - started,
      error: String(e?.message ?? e).slice(0, 2000),
      screenshot: shot ? relative(repo, shot) : null,
    };
  }
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  let cases = await discover();

  if (flag('--list')) {
    cases.forEach((c) => console.log(c.id));
    return 0;
  }

  const last = readLast();
  if (FAILED) {
    const failedIds = new Set((last?.cases ?? []).filter((r) => r.status === 'failed').map((r) => r.id));
    cases = cases.filter((c) => failedIds.has(c.id));
    if (cases.length === 0) {
      console.log('No failed cases to rerun.');
      return 0;
    }
  }
  if (ONLY) cases = cases.filter((c) => c.id.toLowerCase().includes(ONLY.toLowerCase()));
  const runnable = cases.filter((c) => !c.skip);
  if (runnable.length === 0) {
    console.log('No cases selected.');
    return 0;
  }

  await build();
  const server = await startServer({ root: distDir });
  console.log(`• serving ${relative(repo, distDir)} at ${server.url}`);
  console.log(`• running ${runnable.length} case(s) on ${Math.min(JOBS, runnable.length)} browser(s)\n`);

  const queue = [...runnable];
  const results = [];
  const workers = Array.from({ length: Math.min(JOBS, runnable.length) }, async (_, i) => {
    const browser = new Browser({ session: `clearsky-e2e-${i}`, headed: HEADED });
    await browser.open('about:blank');
    await browser.viewport(VIEWPORT.w, VIEWPORT.h, 2);
    await browser.media('dark');
    while (queue.length) {
      const c = queue.shift();
      const r = await runCase(browser, server.url, c);
      results.push(r);
      const mark = r.status === 'passed' ? '✓' : '✗';
      console.log(`${mark} ${c.file} › ${c.name} (${(r.ms / 1000).toFixed(1)}s)${r.error ? `\n    ${r.error.split('\n')[0]}` : ''}`);
      if (r.status === 'failed') {
        // A failure can leave the page wedged; start the next case on a clean tab.
        await browser.open('about:blank').catch(() => {});
      }
    }
    if (!flag('--keep-open')) await browser.close();
  });
  await Promise.all(workers);
  await server.close();

  for (const c of cases.filter((x) => x.skip)) {
    results.push({ id: c.id, file: c.file, name: c.name, status: 'skipped', ms: 0, error: String(c.skip) });
  }

  // Merge with the previous run so --failed keeps a complete picture.
  const merged = new Map((FAILED || ONLY ? (last?.cases ?? []) : []).map((r) => [r.id, r]));
  for (const r of results) merged.set(r.id, r);
  const all = [...merged.values()].sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(
    lastFile,
    JSON.stringify({ finishedAt: new Date().toISOString(), viewport: VIEWPORT, cases: all }, null, 2),
  );

  const failed = results.filter((r) => r.status === 'failed');
  const passed = results.filter((r) => r.status === 'passed');
  console.log(`\n${passed.length} passed, ${failed.length} failed, ${results.length - passed.length - failed.length} skipped`);
  if (failed.length) console.log('Rerun just the failures with: node tests/e2e/run.mjs --failed');
  return failed.length ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e);
    process.exit(2);
  });
