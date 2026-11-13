// Thin async wrapper around the agent-browser CLI (https://www.npmjs.com/package/agent-browser).
// Every call runs the native binary directly (no npx overhead) with --json and an
// isolated --session, and rejects with a readable error when the command fails.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');

function resolveBinary() {
  const dir = join(repo, 'node_modules', 'agent-browser', 'bin');
  const ext = process.platform === 'win32' ? '.exe' : '';
  const native = join(dir, `agent-browser-${process.platform}-${process.arch}${ext}`);
  if (existsSync(native)) return { cmd: native, pre: [] };
  const js = join(dir, 'agent-browser.js');
  if (existsSync(js)) return { cmd: process.execPath, pre: [js] };
  return { cmd: 'agent-browser', pre: [] };
}

const BIN = resolveBinary();

export class BrowserError extends Error {}

export class Browser {
  /** @param {{ session: string, headed?: boolean, timeoutMs?: number }} opts */
  constructor({ session, headed = false, timeoutMs = 15000 }) {
    this.session = session;
    this.headed = headed;
    this.timeoutMs = timeoutMs;
  }

  /** Run one agent-browser command; resolves with parsed `data`. */
  run(args, { timeoutMs, allowFail = false } = {}) {
    const budget = timeoutMs ?? this.timeoutMs;
    const full = [...BIN.pre, '--session', this.session, '--json', ...(this.headed ? ['--headed'] : []), ...args];
    return new Promise((resolvePromise, reject) => {
      const child = spawn(BIN.cmd, full, {
        env: { ...process.env, AGENT_BROWSER_DEFAULT_TIMEOUT: String(budget) },
        windowsHide: true,
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => (stdout += d));
      child.stderr.on('data', (d) => (stderr += d));
      const killer = setTimeout(() => child.kill(), budget + 15000);
      child.on('error', (e) => {
        clearTimeout(killer);
        if (allowFail) resolvePromise(null);
        else reject(new BrowserError(`agent-browser could not start: ${e.message}`));
      });
      child.on('close', (code) => {
        clearTimeout(killer);
        const out = stdout.trim();
        let parsed = null;
        try {
          parsed = out ? JSON.parse(out.split('\n').filter(Boolean).pop()) : null;
        } catch {
          parsed = null;
        }
        const ok = code === 0 && (parsed == null || parsed.success !== false);
        if (ok) return resolvePromise(parsed?.data ?? parsed);
        if (allowFail) return resolvePromise(null);
        const msg = parsed?.error ?? (stderr || out || `exit ${code}`);
        reject(new BrowserError(`agent-browser ${args[0]} failed: ${String(msg).trim().slice(0, 600)}`));
      });
    });
  }

  open(url) {
    return this.run(['open', url], { timeoutMs: 45000 });
  }

  viewport(w, h, scale = 2) {
    return this.run(['set', 'viewport', String(w), String(h), String(scale)]);
  }

  media(...args) {
    return this.run(['set', 'media', ...args]);
  }

  offline(on) {
    return this.run(['set', 'offline', on ? 'on' : 'off']);
  }

  /** Evaluate JavaScript in the page (an expression; promises are awaited). Resolves with the JSON result. */
  async eval(js, opts) {
    const wrapped = `(async () => { return (${js}); })()`;
    const b64 = Buffer.from(wrapped, 'utf8').toString('base64');
    const data = await this.run(['eval', '-b', b64], opts);
    return data && typeof data === 'object' && 'result' in data ? data.result : data;
  }

  /** Wait until a JS expression is truthy. */
  waitFn(expr, timeoutMs) {
    return this.run(['wait', '--fn', expr], { timeoutMs });
  }

  click(selector) {
    return this.run(['click', selector]);
  }

  fill(selector, text) {
    return this.run(['fill', selector, '--', text]);
  }

  press(key) {
    return this.run(['press', key]);
  }

  screenshot(path) {
    return this.run(['screenshot', path], { allowFail: true });
  }

  recordStart(path) {
    return this.run(['record', 'start', path], { allowFail: true });
  }

  recordStop() {
    return this.run(['record', 'stop'], { allowFail: true });
  }

  reload() {
    return this.run(['reload'], { timeoutMs: 45000 });
  }

  close() {
    return this.run(['close'], { allowFail: true });
  }
}
