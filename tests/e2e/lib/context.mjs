// The `t` object every flow receives. Flows talk in testIDs (`<feature>.<screen>.<element>`)
// and customer actions; the bridge (`globalThis.__CS__`, built in only with EXPO_PUBLIC_E2E=1)
// seeds state, scripts purchases, moves the clock and simulates airplane mode.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

export class AssertionError extends Error {}

// Runs in the page: is this element actually showing (not in a hidden tab/stack screen)?
const VISIBLE_FN = `((el)=>{if(!el)return false;const r=el.getBoundingClientRect();if(r.width<1&&r.height<1)return false;for(let n=el;n&&n.nodeType===1;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||n.getAttribute('aria-hidden')==='true')return false;}return true;})`;
const q = (id) => JSON.stringify(`[data-testid="${id}"]`);
const firstVisible = (id) => `(Array.from(document.querySelectorAll(${q(id)})).find(${VISIBLE_FN}))`;

export function createContext({ browser, baseUrl, caseName, outDir, record }) {
  let marker = 0;
  const slug = caseName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 80);
  const shots = join(outDir, 'screens');
  mkdirSync(shots, { recursive: true });

  const t = {
    baseUrl,
    browser,

    // ---------- lifecycle ----------

    /** Reset all app data, apply a seed, then cold-start the app at `path`. */
    async start(seed = 'fresh', path = '/') {
      await browser.open(`${baseUrl}/`);
      await t.ready();
      await browser.eval(`globalThis.__CS__.seed(${JSON.stringify(seed)}).then(() => new Promise(r => setTimeout(r, 80)))`, {
        timeoutMs: 20000,
      });
      await fetch(`${baseUrl}/__control/awc?scenario=ok`).catch(() => {});
      await browser.open(`${baseUrl}${path}`);
      await t.ready();
      if (record) await browser.recordStart(join(outDir, 'videos', `${slug}.webm`));
    },

    /** Wait until the bridge is installed and stores are hydrated. */
    async ready(timeoutMs = 30000) {
      await browser.waitFn(
        `!!(globalThis.__CS__) && !document.querySelector('[data-testid="app.loading"]')`,
        timeoutMs,
      );
      await browser.eval('globalThis.__CS__.ready()');
    },

    /** Kill and relaunch the app (full page reload; in-memory state is lost, storage survives). */
    async relaunch() {
      await browser.reload();
      await t.ready();
    },

    /** Cold-open a deep link. */
    async goto(path) {
      await browser.open(`${baseUrl}${path}`);
      await t.ready();
    },

    // ---------- seeing ----------

    async see(id, { timeout = 10000 } = {}) {
      try {
        await browser.waitFn(`!!${firstVisible(id)}`, timeout);
      } catch {
        const ids = await t.visibleTestIDs().catch(() => []);
        throw new AssertionError(`Expected to see "${id}". Visible testIDs: ${ids.slice(0, 40).join(', ')}`);
      }
    },

    async notSee(id, { timeout = 5000 } = {}) {
      try {
        await browser.waitFn(`!${firstVisible(id)}`, timeout);
      } catch {
        throw new AssertionError(`Expected "${id}" to be gone, but it is still visible`);
      }
    },

    async isVisible(id) {
      return !!(await browser.eval(`!!${firstVisible(id)}`));
    },

    /** Wait for text to appear anywhere visible on the page. */
    async seeText(text, { timeout = 10000 } = {}) {
      const needle = JSON.stringify(String(text).toLowerCase());
      try {
        await browser.waitFn(`document.body.innerText.toLowerCase().includes(${needle})`, timeout);
      } catch {
        throw new AssertionError(`Expected to see text "${text}"`);
      }
    },

    async notSeeText(text, { timeout = 3000 } = {}) {
      const needle = JSON.stringify(String(text).toLowerCase());
      try {
        await browser.waitFn(`!document.body.innerText.toLowerCase().includes(${needle})`, timeout);
      } catch {
        throw new AssertionError(`Did not expect text "${text}"`);
      }
    },

    /** innerText of the first visible element with this testID. */
    async text(id) {
      await t.see(id);
      return String(await browser.eval(`(${firstVisible(id)})?.innerText ?? ''`));
    },

    async attr(id, name) {
      await t.see(id);
      return browser.eval(`(${firstVisible(id)})?.getAttribute(${JSON.stringify(name)}) ?? null`);
    },

    /** aria-checked / aria-selected / aria-disabled as booleans. */
    async state(id) {
      await t.see(id);
      return browser.eval(`(() => { const el = ${firstVisible(id)}; return {
        checked: el?.getAttribute('aria-checked') === 'true',
        selected: el?.getAttribute('aria-selected') === 'true',
        disabled: el?.getAttribute('aria-disabled') === 'true',
        busy: el?.getAttribute('aria-busy') === 'true',
      }; })()`);
    },

    async visibleTestIDs() {
      return browser.eval(
        `Array.from(document.querySelectorAll('[data-testid]')).filter(${VISIBLE_FN}).map(e => e.getAttribute('data-testid'))`,
      );
    },

    // ---------- doing ----------

    /** Real mouse click on the first visible element with this testID. */
    async tap(id, { timeout = 10000 } = {}) {
      await t.see(id, { timeout });
      const m = `e2e-${++marker}`;
      await browser.eval(`(() => { const el = ${firstVisible(id)}; el.setAttribute('data-e2e', ${JSON.stringify(m)}); el.scrollIntoView({ block: 'center' }); return true; })()`);
      await browser.click(`[data-e2e="${m}"]`);
    },

    async fill(id, text) {
      await t.see(id);
      const m = `e2e-${++marker}`;
      await browser.eval(`(() => { const el = ${firstVisible(id)}; const input = el.matches('input,textarea') ? el : el.querySelector('input,textarea'); input.setAttribute('data-e2e', ${JSON.stringify(m)}); return true; })()`);
      await browser.fill(`[data-e2e="${m}"]`, text);
    },

    async press(key) {
      await browser.press(key);
    },

    async scrollTo(id) {
      await browser.eval(`(() => { const el = document.querySelector(${q(id)}); el?.scrollIntoView({ block: 'center' }); return !!el; })()`);
    },

    async wait(ms) {
      await new Promise((r) => setTimeout(r, ms));
    },

    // ---------- app control (test bridge) ----------

    /** Evaluate an expression against the bridge: t.bridge('state().flights.length') */
    async bridge(expr, opts) {
      return browser.eval(`globalThis.__CS__.${expr}`, opts);
    },

    async appState() {
      return browser.eval(`JSON.parse(JSON.stringify(globalThis.__CS__.state()))`);
    },

    /** Move the app clock forward (timers recompute immediately). */
    async advance(ms) {
      await browser.eval(`globalThis.__CS__.clock.advance(${Number(ms)})`);
    },

    /**
     * Airplane mode. Sets the app's forced-offline flag (which survives relaunch) and makes
     * every request to the weather API fail at the network layer, so nothing can leak through.
     * (Browser-level offline would also stop a relaunch from loading the bundle itself.)
     */
    async offline(on = true) {
      await browser.eval(`globalThis.__CS__.net.setOffline(${on ? 'true' : 'false'})`);
      if (on) await browser.run(['network', 'route', '**/__awc/**', '--abort'], { allowFail: true });
      else await browser.run(['network', 'unroute', '**/__awc/**'], { allowFail: true });
    },

    /** Next purchase outcome: success | cancelled | pending | failed | network */
    async purchaseOutcome(v) {
      await browser.eval(`globalThis.__CS__.purchases.setNext(${JSON.stringify(v)})`);
    },

    /** Next restore outcome: auto | restored | nothing | failed */
    async restoreOutcome(v) {
      await browser.eval(`globalThis.__CS__.purchases.setRestore(${JSON.stringify(v)})`);
    },

    /** Offerings behaviour: ok | fail | hang */
    async offerings(v) {
      await browser.eval(`globalThis.__CS__.purchases.setOfferings(${JSON.stringify(v)})`);
    },

    /** NOAA fixture scenario on the e2e server: ok | empty | error | hang | malformed | <dir name> */
    async awc(scenario) {
      await fetch(`${baseUrl}/__control/awc?scenario=${encodeURIComponent(scenario)}`);
    },

    async awcRequests({ clear = false } = {}) {
      const res = await fetch(`${baseUrl}/__control/requests${clear ? '?clear=1' : ''}`);
      return res.json();
    },

    async logs(kind) {
      return browser.eval(`globalThis.__CS__.logs.${kind}()`);
    },

    // ---------- evidence ----------

    async screenshot(name) {
      const path = join(shots, `${slug}--${name}.png`);
      await browser.screenshot(path);
      return path;
    },
  };

  return t;
}

// ---------- assertions ----------

export function expect(cond, message) {
  if (!cond) throw new AssertionError(message);
}

export function eq(actual, expected, message) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new AssertionError(`${message}: expected ${e}, got ${a}`);
}

export function includes(haystack, needle, message) {
  if (!String(haystack).toLowerCase().includes(String(needle).toLowerCase())) {
    throw new AssertionError(`${message}: expected "${String(haystack).slice(0, 300)}" to include "${needle}"`);
  }
}

export function excludes(haystack, needle, message) {
  if (String(haystack).toLowerCase().includes(String(needle).toLowerCase())) {
    throw new AssertionError(`${message}: did not expect "${needle}" in "${String(haystack).slice(0, 300)}"`);
  }
}
