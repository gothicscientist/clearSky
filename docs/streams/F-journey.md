# Stream F — Journey: debrief, logbook, landing card

## You own (exclusively)

- `src/features/{debrief,logbook,card}/**`
- `src/app/journey/**`
- `src/content/sources/journey.ts`
- `tests/e2e/flows/f-*.mjs`
- this file (Requests / Notes / Device checklist sections)

## Contract testIDs

- `journey.logbook` (logbook root)
- Routes: `routes.debrief(flightId)` → `/journey/debrief/[flightId]`, `routes.logbook` →
  `/journey/logbook`, `routes.card(flightId)` → `/journey/card/[flightId]`. Keep these paths.

## Build

### Debrief (`/journey/debrief/[flightId]`, PLAN §4)
Reached from the companion's "We've landed" and Today's "debrief waiting". Capture actual fear
0–10 (`FearScale`), the hardest moment (a `PeakMoment` or none), tools used (pre-filled from
`progress.sessions` logged between the flight's session start and end, editable), and an optional
short reflection. Save with `saveDebrief(flightId, …)`. Then show expected vs actual honestly —
including when it was worse ("Harder than you expected. You still did it, and that counts.") and
when expected was never captured. Validate, then inform; no exclamation marks, no confetti. Offer
the landing card and the logbook. One `track('debrief_completed')`.

### Logbook (`/journey/logbook`)
Flights list (landed first, newest first; upcoming separately), each with route (`flightTitle`),
date, duration, expected → actual. An expected-vs-actual chart (react-native-svg; accessible: every
point has a VoiceOver label and the chart has a text summary). Totals derived from the data: flights
flown, hours in the air (from session timestamps), minutes of calming tools (`totalSeconds` from
`progress.sessions` — never separate counters). Empty state for no flights yet.

### Landing card (`/journey/card/[flightId]`)
A 9:16 boarding-pass-stub image: route arc (`greatCirclePoints`, drawn in SVG; for `quick` flights
no arc — show duration and date), date, "flight #N", optional fear numbers (off by default, a
toggle), the clearSky wordmark and "search clearSky on the App Store" small. Rendered offline.
Preview first, then share via `shareView` (`src/lib/share.ts`); on web it reports 'unavailable' —
show "Sharing isn't available here" calmly. One haptic as it "prints" (Reduce Motion: no slide).
`track('card_shared')` on success.

## e2e flows (`tests/e2e/flows/f-*.mjs`)
- debrief from the `landed` seed: save, honest gap copy for better / same / worse / no expectation,
  flight shows debriefed, Today stops showing "debrief waiting"
- tools-used prefill from sessions logged during the flight window (seed sessions via the bridge)
- logbook: totals match the session log exactly; chart summary text; empty state; quick flights
- card: preview renders route and date, fear numbers hidden by default and shown when toggled,
  share on web shows the unavailable state and logs `share` once
- everything works offline after relaunch

## Device checklist (add yours)
- Share sheet saves the PNG to Photos and posts to TikTok/Instagram at 1080×1920

## Requests

## Notes
