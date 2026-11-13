# Stream D — Today: home, add flight, airports UI, weather outlook

## You own (exclusively)

- `src/features/{home,flightSetup,airports,outlook}/**`
- `src/app/(tabs)/today/**`
- `scripts/build-airports.mjs` (data in `assets/data/airports.json`; regenerate only if needed)
- `tests/e2e/fixtures/awc/**`
- `src/content/sources/today.ts`
- `tests/e2e/flows/d-*.mjs`
- this file (Requests / Notes / Device checklist sections)

`src/lib/airports.ts`, `src/lib/geo.ts`, `src/lib/time.ts` are foundation (frozen): use them; if
search ranking needs changing, request it.

## Contract testIDs

- `today.home` (Today tab root) with a settings gear `today.home.settings` → `routes.settings`
- Routes: `routes.addFlight` → `/today/add-flight`, `routes.flight(id)` → `/today/flight/[id]`,
  `routes.outlook(id)` → `/today/outlook/[id]`. Keep these paths.

## Build

### Today home (PLAN §4)
Next-flight card (`selectNextFlight`) with calm coarse countdown (`describeTimeUntil`), today's
program step (`nextProgramStep(progress.programDone)` from `src/content/program.ts` →
`routes.program(id)`), quick tools (breathe / ground / SOS / companion), "debrief waiting" prompt
(`selectAwaitingDebrief` → `routes.debrief(id)`), in-flight banner when a session is active
(`selectActiveFlight` → `routes.companion(id)`), empty state that invites adding a flight without
pressure. Settings gear top-right.

### Add flight (`/today/add-flight`)
Airport search over the bundled offline DB (`searchAirports`, `airportLabel`): from and to, then
date and time (local time at the origin — what the ticket says; store `departLocal`), auto-estimated
duration from great-circle distance (`distanceKm`, `estimateDurationMin`) that the user can edit,
optional expected fear (`FearScale`), and an explicit route confirmation step ("JFK → LAX, Sat 14
Nov, 14:05 local, about 6 h") before saving with `addFlight`. No flight-number lookup anywhere
(state why in a quiet footnote: "We never guess your flight from a number"). Schedule reminders with
`reminders.scheduleForFlight` when `settings.reminders` is on. Validate: from ≠ to, date not in the
past (allow today), duration 20 min–20 h.

### Flight detail (`/today/flight/[id]`)
Route, local departure time at the origin and the traveller's own zone if different, duration,
expected fear (editable), actions: open Companion (`routes.companion(id)`), Outlook, edit, delete
(confirm; cancels reminders).

### Outlook (`/today/outlook/[id]`, PLAN §4 — read it carefully)
Fetch public NOAA Aviation Weather Center reports with `fetchWithTimeout` from
`${process.env.EXPO_PUBLIC_AWC_BASE ?? 'https://aviationweather.gov/api/data'}/<endpoint>` —
endpoints `pirep`, `airsigmet`, `isigmet`, `gairmet`, `metar`, `taf` (look up the real query
parameters and JSON formats at https://aviationweather.gov/data/api/ and capture real responses for
your fixtures). No identifiers or custom headers in requests. Filter on-device to a corridor around
the route (`distanceToRouteKm`, `greatCirclePoints`). Headline is exactly one of: "Mostly smooth
expected" / "Some bumps likely" / "Bumpy stretches likely — expect the seatbelt sign", or an explicit
"No reports along your route right now" / "Outside report coverage" (AWC coverage is US-centric;
say so honestly for routes outside it) / "Too far ahead — check back the day before". Below: the
raw reports with timestamps, altitude, aircraft type and a plain-language translation (a PIREP
"translator"); a standing limits statement (reports are snapshots, the air changes, pilots get more
data than this); FAA AIM light/moderate/severe definitions (`faa-aim-7-1`) and a link to
`LESSON.turbulenceLevels`. No score, no percentage, no confidence. Anti-compulsion without caps:
"Checked 14:05 · reports update about hourly", a quiet refresh button, and after the third check in an
hour a gentle nudge with a breathing shortcut (`routes.breathe()`). Every band ends: "Whatever the air
does, belted in, you are fine." States: loading, fresh, stale (cached with age), failed, offline.
8 s timeout, one retry, 30-minute cache (persist the cache in your own `createPersistedStore`).
Log `logSession('outlook', flightId, seconds)` once per view.

Fixtures: `tests/e2e/fixtures/awc/ok/<endpoint>.json` (realistic reports along JFK→LAX, mixed
intensities), plus extra scenario dirs you need (e.g. `smooth/`, `bumpy/`). The server already
supports `empty`, `error`, `hang`, `malformed`.

## e2e flows (`tests/e2e/flows/d-*.mjs`)
- add flight end to end (search by code, city and accent-free name; edit duration; confirm; saved
  with correct `departAt` for the origin zone); validation errors; delete
- home states: empty, next flight, program step, debrief waiting (`landed` seed), in-flight banner
  (`midflight` seed)
- outlook: each band from fixtures, no-reports, outside coverage, too far ahead, failed, hang →
  timeout + retry, malformed, offline with cache (stale label) and without cache, 30-min cache (no
  new request within 30 min: `t.awcRequests()`), nudge after 3 checks in an hour, no identifiers in
  request headers/query

## Device checklist (add yours)
- Reminder notifications arrive at the right local times; countdown correct across zones

## Requests

## Notes
