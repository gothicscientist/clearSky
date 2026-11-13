# clearSky end-to-end tests

Customer workflows are driven in a real Chrome (via the `agent-browser` CLI) against the
**web build** of the app at an iPhone-sized viewport (393×852). The web build is compiled with
`EXPO_PUBLIC_E2E=1`, which installs a test bridge (`globalThis.__CS__`) — it is compiled out of
every normal build.

```bash
npm run e2e                       # build if sources changed, run everything (2 browsers)
npm run e2e -- --only paywall     # filter by file or case name
npm run e2e:failed                # rerun only last run's failures
npm run e2e -- --jobs 4 --record  # 4 browsers, save a video per case
npm run e2e -- --headed           # watch
```

Results: `tests/e2e/.results/last.json`, failure screenshots in `.results/screens/`.

## Writing a flow

One file per customer workflow area: `flows/<stream>-<topic>.mjs` (a = entry, b = calm, c = fly,
d = today, e = learn, f = journey, x = cross-cutting). Default-export an array of cases:

```js
import { eq, expect, includes } from '../lib/context.mjs';

export default [
  {
    name: 'breathing logs one session with real seconds',
    async run(t) {
      await t.start('pro', '/calm/breathe');        // seed + cold start at a route
      await t.tap('breathing.player.start');
      await t.advance(60_000);                       // move the app clock 60 s
      await t.tap('breathing.player.stop');
      const s = await t.appState();
      eq(s.progress.sessions.length, 1, 'one session logged');
    },
  },
];
```

### Seeds (`t.start(seed, path)`)

| seed | state |
|---|---|
| `fresh` | nothing: first launch |
| `onboarded` | onboarding answers saved (turbulence-first, booked flight in 2 days), no subscription |
| `pro` | onboarded + active yearly subscription |
| `proWithFlight` | pro + JFK→LAX departing in 2 days (id `seed-flight`) |
| `midflight` | pro + that flight in the air (companion started 60 min ago, takeoff 45 min ago) |
| `landed` | pro + that flight landed 2 h ago, no debrief yet |

### Context API

- `see(id)`, `notSee(id)`, `isVisible(id)`, `seeText(text)`, `notSeeText(text)`, `text(id)`, `attr(id, name)`,
  `state(id)` → `{checked, selected, disabled, busy}`, `visibleTestIDs()`
- `tap(id)`, `fill(id, text)`, `press(key)`, `scrollTo(id)`, `wait(ms)` (avoid; prefer `see`)
- `relaunch()` (app kill + relaunch: memory lost, storage kept), `goto(path)` (cold deep link)
- `appState()` → `{ profile, entitlement, flights, progress }`; `bridge('<expr>')` for anything else
- `advance(ms)` app clock jump (survives relaunch) · `offline(true|false)` airplane mode (survives relaunch)
- Purchases: `purchaseOutcome('success'|'cancelled'|'pending'|'failed'|'network')`,
  `restoreOutcome('auto'|'restored'|'nothing'|'failed')`, `offerings('ok'|'fail'|'hang')`
- NOAA fixtures: `awc('ok'|'empty'|'error'|'hang'|'malformed'|'<fixture dir>')`, `awcRequests({clear})`
- Logs: `logs('haptics'|'narrator'|'analytics'|'share')`
- Evidence: `screenshot(name)`

Assertions: `expect(cond, msg)`, `eq(a, b, msg)`, `includes(text, sub, msg)`, `excludes(text, sub, msg)`.

### NOAA fixtures

`fixtures/awc/<scenario>/<endpoint>.json` where endpoint is the last path segment of
`aviationweather.gov/api/data/<endpoint>` (`pirep`, `airsigmet`, `isigmet`, `gairmet`, `metar`, `taf`).
The web build calls `/__awc/<endpoint>` (same origin) instead of the real API.

## iOS simulator

`tests/maestro/*.yaml` mirror the critical paths for the native app; they run on macOS
(EAS Workflows or a Mac with Xcode) — see `docs/TESTING.md`.
