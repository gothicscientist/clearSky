# Stream B — Calm: SOS, breathing, grounding, games, ambient audio

## You own (exclusively)

- `src/features/{sos,breathing,grounding,games,audio}/**`
- `src/app/(tabs)/calm/**`, `src/app/sos.tsx`
- `assets/audio/**`, `scripts/gen-audio.mjs`
- `src/content/sources/calm.ts`
- `tests/e2e/flows/b-*.mjs`
- this file (Requests / Notes / Device checklist sections)

## Contract testIDs

- `calm.home` (Calm tab root), `sos.screen` (SOS root)
- Routes used by others: `routes.breathe(pattern?)` → `/calm/breathe`, `routes.ground` → `/calm/ground`,
  `routes.games` → `/calm/games`, `routes.sos` → `/sos`. Keep these paths.

## Build

### Calm tab home
A calm launcher: one big "Breathe" entry (last-used pattern), grounding, games, ambient sound
beds, and "SOS" explained. Uses `progress.sessions` to show gentle, derived totals ("12 minutes
of breathing this week") — never streaks, never guilt.

### SOS (`/sos`, full-screen modal, PLAN §4)
One tap from any tab (the floating button already routes here). First calming instruction
visible within 1 s, no choices up front. Sequence: paced breath (panic-safe pattern, no holds:
`getPattern('extended-exhale')`) → grounding → "what's happening in your body" (plain physiology,
cite `nhs-panic`) → "stay with me" loop. Dims everything to a single breathing ring. Fully offline.
56-pt targets (`hit.sos`). Voice cues via `narrator` if Settings → voice is on (always optional, every
spoken line also on screen). Exit asks "Better / Still hard" and logs exactly one
`logSession('sos', 'sos', seconds, outcome)`. "Still hard" offers crew guidance and
`routes.crisis`. Closing at any point logs once (unmount-safe) with real seconds.

### Breathing (`/calm/breathe?pattern=`)
Patterns from `src/content/breathing.ts` (extended exhale default, coherent, box — labelled for
focus not panic — and double-inhale sigh). Never 4-7-8, never long holds as a panic tool, never
"deep breaths". Durations 1 / 3 / 5 min. Paced by `useBreathPacer` + `BreathRing` (+ haptics:
soft ramp on inhale, tick on hold, nothing on exhale), optional voice, usable eyes-closed by
haptics alone. Timing from the wall clock (survives backgrounding; `clock.onJump` already handled
by the pacer). Logs exactly one `logSession('breathing', patternId, seconds)` when it ends or the
screen unmounts. Remember the last pattern in `settings.breathingPattern`.

### Grounding (`/calm/ground`)
5-4-3-2-1 with cabin-specific prompts (the seat-back, the window shade, the hum…), one step per
screen, no typing; plus "feet on floor, back on seat". Logs one `grounding` session.

### Games (`/calm/games`, `/calm/games/[id]`)
Serial sevens, Colour-word match (Stroop), Trace the route (follow a slow-moving dot along a
flight path with your finger). No fail states, no time pressure, no scores to beat, no streaks.
Each logs one `game` session.

### Ambient audio (sound setting)
Procedurally generated, offline, loopable beds (e.g. cabin hum, soft rain, brown noise) made by
`scripts/gen-audio.mjs` into `assets/audio/` (pure Node PCM → WAV; if `ffmpeg` is on PATH you may
transcode to AAC `.m4a` to keep the bundle small — keep total under ~3 MB). Play with `expo-audio`
(looping, fade in/out, respects Settings → sound, keeps playing with the screen locked — background
audio is already enabled in app.config). Expose play/stop on the Calm home and inside breathing.

## e2e flows (`tests/e2e/flows/b-*.mjs`)
- SOS opens from each tab, shows the first instruction fast, walks the sequence, exit logs once
  with outcome; closing mid-way logs once; works with `t.offline(true)` after relaunch
- breathing: pattern picker, durations, phase cues advance with `t.advance`, one session logged with
  real seconds, unmount mid-session logs once, last pattern remembered
- grounding and each game complete without fail states; sessions logged
- haptics fire per pattern rules (`t.logs('haptics')`), voice lines only when the setting is on
  (`t.logs('narrator')`)

## Device checklist (add yours)
- Haptic ramp feels right eyes-closed; audio continues with screen locked; mixes with other audio

## Requests

## Notes
