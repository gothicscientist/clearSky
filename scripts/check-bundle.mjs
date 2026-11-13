// Proves the e2e test bridge is compiled out of normal builds: exports a production web
// bundle WITHOUT EXPO_PUBLIC_E2E and fails if any bridge code is present.
// Usage: node scripts/check-bundle.mjs
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const outDir = join(repo, 'dist-check');

const env = { ...process.env, CI: '1' };
delete env.EXPO_PUBLIC_E2E;
delete env.EXPO_PUBLIC_AWC_BASE;

const cli = require.resolve('expo/bin/cli', { paths: [repo] });
const res = spawnSync(process.execPath, [cli, 'export', '--platform', 'web', '--output-dir', 'dist-check'], {
  cwd: repo,
  env,
  encoding: 'utf8',
});
if (res.status !== 0) {
  console.error(res.stdout?.slice(-3000), res.stderr?.slice(-3000));
  process.exit(2);
}

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js')) files.push(p);
  }
};
walk(outDir);

const NEEDLES = ['__CS__', 'installTestBridge', '__cs_offline'];
const hits = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const n of NEEDLES) if (src.includes(n)) hits.push(`${n} in ${f.slice(repo.length)}`);
}
rmSync(outDir, { recursive: true, force: true });
if (hits.length) {
  console.error('✗ Test bridge code found in a production bundle:\n  ' + hits.join('\n  '));
  process.exit(1);
}
console.log(`✓ No test bridge code in ${files.length} production bundle file(s).`);
