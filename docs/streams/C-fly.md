# Stream C — Fly: in-flight companion, sounds & sensations, G-meter

## You own (exclusively)

- `src/features/{companion,sounds,gmeter}/**`
- `src/app/(tabs)/fly/**`
- `src/content/sources/fly.ts`
- `tests/e2e/flows/c-*.mjs`
- this file (Requests / Notes / Device checklist sections)

## Contract testIDs

- `fly.home` (Fly tab root)
- Routes used by others: `routes.companion(flightId?)` → `/fly/companion`, `routes.sounds` →
  `/fly/sounds`, `routes.gmeter` → `/fly/gmeter`. Keep these paths.

## Build

### Fly tab home
Entry to Companion (resume the active flight if one is in the air: `selectActiveFlight`), Sounds &
Sensations, G-meter.

### Companion (`/fly/companion?flightId=`, PLAN §4)
Pick a flight (upcoming ones from `useFlightsStore`) or quick-start with a duration only
(`addQuickFlight(durationMin)` — such flights have `quick: true`; show `flightTitle(f)`, never a
route). If `expectedFear` is still null, ask it once at "Doors closed" with `FearScale` (skippable).
"Doors closed" → `startSession(id)`; "We've taken off" → `markTakeoff(id)` (airborne phases anchor
there; until tapped, phases run from doors-closed with a typical taxi). Phases (taxi out, takeoff,
initial climb, climb, cruise, descent, approach, landing, taxi in) come from a pure function of
(startedAt, takeoffAt, durationMin, offsetMs, now): fixed minutes at both ends, stretchy cruise.
Always labelled "estimated"; "We're now at…" lets the user pick the current phase and re-syncs in
one tap (`resyncSession`). Survives app kill (only timestamps are persisted — derive everything).
Each phase shows what you'll hear and feel next (from your sounds content) and links the relevant
lesson (`LESSON.goArounds` on approach, etc. from `src/content/links.ts`). Optional keep-awake
(`expo-keep-awake`). "We've landed" → `endSession(id)`, a sunrise wash on the timeline (Reduce
Motion: crossfade), one success haptic, then `router.replace(routes.debrief(id))`. Log one
`logSession('companion', flightId, seconds)` at landing.

### Sounds & Sensations (`/fly/sounds`, `/fly/sounds/[id]`)
≥ 24 entries browsable by phase and searchable (offline). Each: what it is, why it's normal, when it
happens, a calming line, sources (`fly.ts` sources with primary references — FAA handbooks,
manufacturer docs; no invented numbers). Examples: engine spool-up, gear retraction thump, flaps
whirr, the "double ding", PTU "barking dog" (A320 family), cabin pressurisation ear pressure,
seatbelt chime, thrust reduction after takeoff ("engines went quiet"), speed brakes rumble,
turbulence types, wing flex, go-around, reverse thrust, APU, cargo door, fuel pumps, air
conditioning packs, autopilot disconnect tone (cockpit-side, explain). Surfaced contextually in the
companion by phase.

### G-meter (`/fly/gmeter`, PLAN §4)
Accelerometer magnitude via `motion.subscribe` (`src/lib/motion.ts`), a calm dial ±0.5 g centred
on 1.0 g and a slow trace. No peak-hold record, no red zones, no danger wording. States "This is
your phone's reading, not the aircraft's." Certification context with citations: limit
manoeuvring load 2.5 g for transport airplanes (`cfr-25-337`), ultimate load = 1.5 × limit
(`cfr-25-303`, `cfr-25-305`); link `LESSON.howStrong`. Sensor unavailable (web, simulator,
permission denied): a clear state plus a demo trace clearly labelled "Demo". Logs one `gmeter` session.
Make the trace screen-record friendly (9:16, large type).

## e2e flows (`tests/e2e/flows/c-*.mjs`)
- companion from a seeded flight (`proWithFlight`) and from quick start; phases advance with
  `t.advance`; takeoff anchoring; re-sync; relaunch mid-flight resumes the right phase (`midflight`
  seed + `t.relaunch()`); offline throughout; landing routes to `/journey/debrief/<id>` and the flight
  is `landed`
- sounds: browse by phase, search, open an entry, sources shown, offline
- g-meter: unavailable state + demo label on web; injected samples (`t.bridge('motion.push([...])')`)
  move the dial; no "danger" text anywhere

## Device checklist (add yours)
- Real accelerometer feel in a car / lift; keep-awake during cruise; companion after phone restart

## Requests

## Notes
