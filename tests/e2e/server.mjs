// Zero-dependency static server for the e2e web build.
//
//  - serves dist-e2e/ with SPA fallback (expo web output: "single")
//  - /__awc/<endpoint>  same-origin stand-in for aviationweather.gov/api/data/<endpoint>
//    (the real API sends no CORS headers, so the web build is pointed here via
//    EXPO_PUBLIC_AWC_BASE=/__awc). Responses come from tests/e2e/fixtures/awc/<scenario>/<endpoint>.json
//  - /__control/awc?scenario=ok|empty|error|hang|malformed   switch scenario
//  - /__control/requests                                    AWC requests seen so far (and ?clear=1)
//
// Usage: node tests/e2e/server.mjs [--port 8099] [--root dist-e2e]
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = resolve(here, '..', '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.map': 'application/json',
};

export function startServer({ port = 0, root = join(repo, 'dist-e2e') } = {}) {
  const fixturesDir = join(here, 'fixtures', 'awc');
  let scenario = 'ok';
  const requests = [];

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = decodeURIComponent(url.pathname);

    if (path === '/__control/awc') {
      scenario = url.searchParams.get('scenario') ?? 'ok';
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ scenario }));
      return;
    }
    if (path === '/__control/requests') {
      if (url.searchParams.get('clear')) requests.length = 0;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(requests));
      return;
    }

    if (path.startsWith('/__awc/')) {
      const endpoint = path.slice('/__awc/'.length).replace(/[^a-z0-9_-]/gi, '');
      requests.push({ endpoint, query: Object.fromEntries(url.searchParams), at: Date.now(), headers: { ...req.headers } });
      if (scenario === 'hang') return; // never answer: the client must time out
      if (scenario === 'error') {
        res.writeHead(502, { 'content-type': 'text/plain' });
        res.end('Bad gateway');
        return;
      }
      if (scenario === 'malformed') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('{"this is not": json');
        return;
      }
      if (scenario === 'empty') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('[]');
        return;
      }
      const file = join(fixturesDir, scenario, `${endpoint}.json`);
      const fallback = join(fixturesDir, 'ok', `${endpoint}.json`);
      const chosen = existsSync(file) ? file : existsSync(fallback) ? fallback : null;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(chosen ? readFileSync(chosen) : '[]');
      return;
    }

    // Static files with SPA fallback.
    const safe = normalize(path).replace(/^([/\\])+/, '');
    let file = join(root, safe);
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) {
      const asHtml = `${file}.html`;
      file = existsSync(asHtml) ? asHtml : join(root, 'index.html');
    }
    if (!existsSync(file)) {
      res.writeHead(404);
      res.end('Build not found. Run: node tests/e2e/run.mjs (it builds dist-e2e first).');
      return;
    }
    res.writeHead(200, {
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(res);
  });

  return new Promise((resolvePromise) => {
    server.listen(port, '127.0.0.1', () => {
      const address = server.address();
      const actual = typeof address === 'object' && address ? address.port : port;
      resolvePromise({
        url: `http://127.0.0.1:${actual}`,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const get = (flag, dflt) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const { url } = await startServer({
    port: Number(get('--port', 8099)),
    root: resolve(repo, get('--root', 'dist-e2e')),
  });
  console.log(`clearSky e2e server on ${url}`);
}
