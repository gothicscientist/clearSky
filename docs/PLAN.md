# clearSky — consolidated build plan

Synthesised from three parallel plans (product/UX, architecture, content/trust/growth) and refined through adversarial review (see "Review log" at the end). Read `docs/RESEARCH.md` for the competitor evidence behind these choices.

## 1. Product

**Positioning:** *The calm, honest co-pilot that works at 38,000 feet.*

**Pillars (each one is a direct answer to a Steady failure):**
1. **Honest instruments, not invented scores.** Real sensor readings, raw sourced reports with timestamps and stated limits. No "smoothness score", no confidence %, no flight-number guessing, no crash odds.
2. **Built for airplane mode.** Everything except the optional weather outlook works with zero connectivity, and that is proven by an offline e2e suite.
3. **Private and uncapped.** No account, no tracking, no community/UGC, two prices, no usage limits.

**Business model (fixed by the owner):** hard paywall immediately after onboarding; weekly $5.99 and yearly $39.99; nothing but onboarding is usable before purchase. Growth is faceless organic TikTok.

**Non-negotiable ethics/App Review rules:** no fabricated testimonials, user counts, statistics, countdown timers, fake discounts or guilt copy. Prices always come from the store's localised strings. Restore, Terms and Privacy are always visible on the paywall. Wellness positioning only: never "cure", "treat", "clinically proven", "therapist-approved", success percentages or "flying is 100% safe".

## 2. Information architecture

Four tabs + floating SOS button on every tab screen. Settings is a gear on Today.

| Area | Routes (under `src/app`) | Owner |
|---|---|---|
| Onboarding | `onboarding/*` | A |
| Paywall | `paywall.tsx` | A |
| Settings + legal | `settings/*` | A |
| **Calm** tab | `(tabs)/calm/*` — index, `breathe`, `ground`, `games/*` ; root `sos.tsx` | B |
| **Fly** tab | `(tabs)/fly/*` — index, `companion`, `sounds`, `gmeter` | C |
| **Today** tab | `(tabs)/today/*` — index, `add-flight`, `flight/[id]`, `outlook/[id]` | D |
| **Learn** tab | `(tabs)/learn/*` — index, `lesson/[id]`, `program/[id]`, `sources` | E |
| Journey | `journey/*` — `debrief/[flightId]`, `logbook`, `card/[flightId]` | F |

Cross-feature navigation uses only the constants in `src/lib/routes.ts`.

## 3. Onboarding → paywall (stream A)

Target: under 2 minutes, one decision per screen, progress bar, resumable after app kill (`onboardingStep` is persisted). Arc: recognition → understanding → a felt moment of relief → a plan → commitment.

1. **Hook** — "Flying is safe. Your body didn't get the memo." Single CTA.
2. **Fear type** — multi-select, then primary: turbulence / crashing / loss of control or feeling trapped / panic sensations / takeoff & landing.
3. **When it peaks** — days before / at the gate / takeoff / bumps in cruise / landing.
4. **Body response** — racing heart, tight chest, sweaty hands, spiralling thoughts, dizzy.
5. **Mirror** — reflects their answers: "That's a false alarm from a system doing its job."
6. **Next flight** — booked (pick date) / nothing booked / I've been avoiding flying.
7. **What you've tried** — non-judgemental acknowledgement only.
8. **Felt demo** — 60-second guided extended-exhale breath with haptics and the horizon line levelling. Skippable after 15 s.
9. **Check-in** — "Any calmer?" a little / a lot / not yet (each gets honest copy; "not yet" → "That's normal. It takes practice.").
10. **Truth card** — one sourced fact matched to the primary fear, citation visible.
11. **Goal** — board calmly / stop dreading the week before / take a specific trip / fly more often.
12. **Reminders priming** — optional local notifications; skipping is one tap and never nags.
13. **Plan reveal** — "Your plan" visibly built from fear type, peak moment and flight date; lists what's inside. Includes the wellness disclaimer line.
14. **Paywall.**

**Paywall:** headline "Unlock your plan"; three plan-specific bullets; yearly preselected with the full billed price as the most prominent figure and the per-week equivalent (computed from the store price) smaller; weekly shown with equal legibility; CTA "Continue"; auto-renew disclosure; Restore Purchases, Terms of Use (EULA) and Privacy Policy visible without scrolling on a 6.1" screen; no close button (Back returns to the plan reveal). If the store returns an intro offer it is described using the store's own strings; otherwise no trial language appears anywhere.

**Paywall states (all must be reachable in tests):** loading (skeleton rows, CTA disabled, Restore live) · offerings failed/offline ("The App Store isn't answering. Nothing was charged." + Retry; no hard-coded prices) · purchase cancelled (silent) · purchase failed (inline message, selection kept) · pending/Ask to Buy ("Waiting for approval", re-check on foreground) · restoring · restored · nothing to restore · already subscribed at launch (paywall skipped from cache) · lapsed (paywall returns, on-device data intact).

## 4. Features and acceptance criteria

**SOS (B)** — one tap from any tab; first calming instruction visible within 1 s; no choices up front. Sequence: paced breath → grounding → "what's happening in your body" → "stay with me" loop. Fully offline. Exit asks "Better / Still hard" and logs once. "Still hard" offers crew/crisis guidance. 56 pt targets.

**Breathing (B)** — patterns: Extended exhale 4-6 (default), Coherent 5-5, Box 4-4-4-4 (focus), Physiological sigh. No 4-7-8 and no long holds as panic tools; never "deep breaths". Paced by shape + haptics + optional voice; usable eyes-closed by haptics alone. 1/3/5 min. Timing derives from the wall clock (no drift, survives backgrounding). Logs exactly one session with real seconds when it ends or unmounts.

**Grounding (B)** — 5-4-3-2-1 with cabin-specific prompts, one step per screen, no typing; plus "feet on floor, back on seat".

**Games (B)** — Serial sevens, Colour-word match, Trace the route. No fail states, no time pressure, no streaks.

**Companion (C)** — pick a flight (or quick-start with duration only) → "Doors closed". Phases (taxi out, takeoff, initial climb, climb, cruise, descent, approach, landing, taxi in) derived by a pure function from wall-clock start + duration: fixed minutes at both ends, stretchy cruise. Labelled "estimated"; "We're now at…" re-syncs in one tap. Survives app kill (only timestamps persisted). Each phase shows what you'll hear and feel next. "We've landed" ends the session and routes to the debrief. Keeps screen awake optionally.

**Sounds & Sensations (C)** — ≥ 24 entries browsable by phase and searchable; each: what it is, why it's normal, when it happens, calming line, source. Surfaced contextually inside Companion.

**G-meter (C)** — accelerometer magnitude with a calm ±0.5 g dial centred on 1.0 g and a slow trace. No peak-hold record, no red zones, no danger wording. States "This is your phone's reading, not the aircraft's." Certification context with citation (limit load 2.5 g, ultimate = 1.5 ×, 14 CFR 25.337/25.303). Handles sensor unavailable (web, simulator, permission denied) with a clear state and a demo trace labelled as a demo.

**Today (D)** — next-flight card with countdown, today's program step, quick tools, "debrief waiting" prompt, in-flight banner when a session is active. **Add flight:** airport search over a bundled offline database (OurAirports, public domain; ~3.2k scheduled-service airports), date/time, auto-estimated duration from great-circle distance that the user can edit, explicit route confirmation. No flight-number lookup.

**Outlook (D)** — fetches public reports from the NOAA Aviation Weather Center (`aviationweather.gov/api/data`: `/pirep`, `/airsigmet`, `/isigmet`, `/gairmet`, `/metar`, `/taf`), filtered on-device to a corridor around the route. Headline is one of three plain bands — "Mostly smooth expected" / "Some bumps likely" / "Bumpy stretches likely — expect the seatbelt sign" — or an explicit "no reports" / "outside coverage" / "too far ahead" state. Below: the raw reports with timestamps, altitude, aircraft type and a plain-language translation; a standing limits statement; FAA AIM light/moderate/severe definitions. No score, no percentage. Anti-compulsion without caps: "Checked 14:05 · reports update about hourly", quiet refresh button, after the third check in an hour a gentle nudge with a breathing shortcut. Every band ends: "Whatever the air does, belted in, you are fine." States: loading, fresh, stale (cached with age), failed, offline. 8 s timeout, one retry, 30-minute cache.

**Learn (E)** — ~24 explainers ≤ 3 minutes each in six modules (turbulence, the aircraft, people & system, phases of flight, weather, "what if"). Every factual claim carries a source in a "Sources" footer and appears in `docs/CONTENT_SOURCES.md` (claim → source → status). **Accuracy rules:** follow the "facts apps get wrong" list in §7; any number that cannot be tied to a primary source is removed, not guessed.

**Program (E)** — 7 sessions built on CBT/ACT principles (how fear works · your body's alarm · thoughts on trial · your ladder · making room · flight-day plan · after landing), with emphasis and examples swapped by primary fear type. Labelled self-help, not treatment.

**Debrief, Logbook, Landing Card (F)** — predicted fear 0–10 captured before the flight, actual after; the gap is shown honestly (including when it was worse). Logbook lists flights with an expected-vs-actual chart and totals derived from the session log (never separate counters). Landing card: 9:16 boarding-pass-stub image (route arc, date, flight count; fear numbers off by default), rendered offline, shared via the system sheet with a preview first.

**Settings (A)** — manage subscription (deep link), Restore, voice/haptics/sound, appearance, reminders, export all data, delete all data (confirm), sources & licences, disclaimer, crisis resources, privacy statement, terms, support contact, app version; a developer panel only in mock-purchases mode.

## 5. Design language — "Dusk at altitude"

Tokens live in `src/theme/tokens.ts` (palette, spacing, radius, type, motion). Dark is the default (cabins are dim). Fraunces for display and numerals, system font for body, tabular figures on instruments. Motion is slow, interruptible, springs without bounce; the horizon line is the one recurring motif; no confetti, no purple gradients, no glassmorphism, no mascots. Haptics: soft ramp on inhale, tick on hold, nothing on exhale; never the error buzz. Reduce Motion swaps movement for crossfades.

**Signature moments:** (1) the horizon line levels as the onboarding breath completes; (2) plan reveal draws the route arc; (3) SOS dims everything to a single breathing ring; (4) "Wheels down" resolves the timeline into a warm sunrise wash; (5) the landing card prints like a boarding-pass stub with one haptic.

**Voice:** second person, short sentences, present tense. Validate, then inform. No exclamation marks, no "just relax". Say "bumps". Examples: "I'm here. Breathe out slowly with me." · "That thump is the landing gear folding away. Right on schedule." · "This is your phone's reading, not the aircraft's."

**Accessibility:** Dynamic Type without truncation, VoiceOver labels/values/hints on every control, breathing phases announced, Reduce Motion honoured, ≥ 4.5:1 text contrast (checked by script), never colour-only meaning, 44 pt targets (56 in SOS).

## 6. Architecture

- **Stack:** Expo SDK 58 (React Native 0.88, React 19.3, React Compiler on), expo-router, TypeScript strict, zustand + AsyncStorage, Reanimated 4, react-native-svg. Managed workflow only — never commit `ios/` or `android/`.
- **Targets:** Expo Go on the owner's iPhone (mock purchases), EAS development build / TestFlight (RevenueCat), and web (react-native-web) for e2e.
- **Layout:** `src/app` (routes, thin), `src/features/<name>` (screens, components, logic, content), `src/ui` (primitives), `src/theme`, `src/stores`, `src/lib` (services), `src/content` (cross-feature indexes), `tests/e2e`.
- **State:** every store is created with `createPersistedStore` (`src/stores/persist.ts`): versioned, migratable, corrupt payloads quarantined, hydration observable. Foundation stores: `profile` (answers, settings), `entitlement`, `flights` (flights, companion session, debrief), `progress` (lessons, program, one append-only tool-session log; all stats are derived from it). Features may add their own stores in their own folders.
- **Timers:** nothing ticking is ever persisted. Sessions store wall-clock anchors; UI derives from `clock.now()` and recomputes on foreground.
- **Purchases:** `src/lib/purchases` exposes one interface with three providers — RevenueCat (native builds with a key), Mock (Expo Go, web, or `EXPO_PUBLIC_PURCHASES_MODE=mock`), Unavailable (release build without a key: paywall shows the store-unreachable state and never grants access). Entitlement "pro"; cached for offline use with a bounded 72 h grace after `expiresAt`.
- **Services (`src/lib`)** with web-safe fallbacks: `haptics`, `narrator` (expo-speech on-device voice; always optional), `motion` (accelerometer; injectable samples for tests), `share` (view-shot + share sheet; web download fallback), `net`, `clock`, `notifications`, `analytics` (typed no-op by default; no identifiers ever).
- **Privacy:** no analytics or attribution SDK. RevenueCat is the only third party (anonymous app user ID; declared as Purchases, not linked, not tracking). Weather requests carry no identifiers.

## 7. Aviation accuracy rules (binding on all content)

Never ship these; use the defensible phrasing instead:

| Do not say | Say instead |
|---|---|
| "Turbulence has never crashed a plane" / "nobody is hurt by turbulence" | Modern airliners are certified for loads well beyond what turbulence normally produces; the realistic risk is injury to people who are not belted in. |
| "Planes drop thousands of feet" | Typical bumps move the aircraft by a few feet to tens of feet; it feels far larger. |
| "Air pockets" | There are no pockets; it is moving air. |
| "Pilots can see all turbulence on radar" | Weather radar shows precipitation, not clear-air turbulence; pilots also use forecasts and reports from aircraft ahead. |
| "Lightning can't hurt a plane" / specific strike frequencies | Airliners are designed and certified to take lightning strikes safely and are inspected afterwards. |
| Fixed glide distances ("100 miles") | An airliner without engine power is still a glider and can travel many miles from cruise altitude. |
| Wing-bend feet/degree figures | Wings are tested to 150% of the highest load expected in service. |
| Any crash odds, "1 in 11 million", "X times safer than driving" | Omit entirely. |
| "No fatal crash since <year>" | Omit entirely. |
| "Autopilot lands the plane" | Most landings are flown by hand; autoland exists for low visibility. |
| "Doors cannot be opened in flight" | At cruising altitude, cabin pressure holds plug-type doors shut with far more force than a person can overcome. |
| "Unlimited oxygen from masks" | Masks supply oxygen for the minutes it takes to descend to air you can breathe normally. |
| "Pilots are tested every six months" | Airline pilots are checked in simulators at least yearly, and often every six months. |

Anything marked VERIFY by the planners (injury counts, HEPA exchange rates, go-around rates, G-AIRMET horizon, comparison g-values) ships only if a primary source is cited in `docs/CONTENT_SOURCES.md`; otherwise it is cut.

**Safety guardrails:** disclaimer in onboarding, Settings and store listing ("clearSky is a self-help wellness tool. It does not diagnose, treat or cure any condition and is not a substitute for professional care."); crisis screen reachable offline (local emergency number; US 988; UK & Ireland Samaritans 116 123; on board, tell cabin crew; chest pain, fainting or trouble breathing → treat as medical); recommend a professional when fear generalises beyond flying, with trauma/depression/substance concerns, or with heart/lung conditions or pregnancy before interoceptive exercises; medication stance "follow your prescriber"; alcohol not recommended as a coping tool.

## 8. Workstreams (parallel, isolated worktrees, disjoint ownership)

| Stream | Owns (exclusively) | Delivers |
|---|---|---|
| **A Entry** | `src/features/{onboarding,paywall,settings}/**`, `src/app/onboarding/**`, `src/app/paywall.tsx`, `src/app/settings/**`, `docs/legal/**`, `tests/e2e/flows/a-*` | Onboarding, paywall (all states), settings, legal documents |
| **B Calm** | `src/features/{sos,breathing,grounding,games}/**`, `src/app/(tabs)/calm/**`, `src/app/sos.tsx`, `assets/audio/**`, `scripts/gen-audio.mjs`, `tests/e2e/flows/b-*` | SOS, breathing, grounding, games, procedural ambient audio |
| **C Fly** | `src/features/{companion,sounds,gmeter}/**`, `src/app/(tabs)/fly/**`, `tests/e2e/flows/c-*` | Companion timeline, sounds & sensations, G-meter |
| **D Today** | `src/features/{home,flightSetup,airports,outlook}/**`, `src/app/(tabs)/today/**`, `assets/data/**`, `scripts/build-airports.mjs`, `tests/e2e/fixtures/awc/**`, `tests/e2e/flows/d-*` | Home, add-flight, airport DB, weather outlook |
| **E Learn** | `src/features/{learn,program}/**`, `src/app/(tabs)/learn/**`, `docs/CONTENT_SOURCES.md`, `tests/e2e/flows/e-*` | Curriculum, program, sources ledger |
| **F Journey** | `src/features/{debrief,logbook,card}/**`, `src/app/journey/**`, `tests/e2e/flows/f-*` | Debrief, logbook, landing card |

**Frozen for all streams:** everything else — `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/index.tsx`, `src/ui/**`, `src/theme/**`, `src/stores/**`, `src/lib/**`, `src/content/**`, `src/types.ts`, `package.json`, lockfile, `app.config.ts`, `eas.json`, `tests/e2e/{run.mjs,lib/**}`. A stream that needs a foundation change shims locally inside its own feature folder and records the request in `docs/streams/<stream>.md`; the orchestrator applies requests at merge. New dependencies are requested the same way (none should be needed).

Features never import from another feature; they meet only through stores, `src/lib/routes.ts` and `src/content`.

## 9. Testing

End-to-end first. `tests/e2e/run.mjs` drives the exported web build with the `agent-browser` CLI at an iPhone-sized viewport, one flow file per customer workflow, results in `tests/e2e/.results/last.json`, `--failed` reruns only failures. A zero-dependency server serves the build plus same-origin NOAA fixtures (the real API does not allow CORS) with switchable scenarios (ok / empty / error / hang / malformed). A test bridge (`window.__CS__`, compiled in only when `EXPO_PUBLIC_E2E=1`) resets and seeds state, sets purchase/restore outcomes, advances the clock, injects accelerometer samples and toggles offline. A mandatory offline suite walks SOS, breathing, grounding, companion, learn and logbook with the network off. Maestro flows (`tests/maestro`) mirror the critical paths for the iOS simulator and run on EAS Workflows (macOS) — they cannot run on the Windows dev machine. Haptics, real sensors, StoreKit sandbox, notifications and the share sheet are covered by `docs/DEVICE_CHECKLIST.md`.

## 10. Growth (faceless TikTok)

Screen-record-ready surfaces built into the product (9:16-safe, large type, no personal data): live G-meter trace, sound explainer cards, animated phase timeline, breathing ring, raw-report "translator" in Outlook, landing card. Attribution without SDKs: App Store Connect campaign links per content format; on-screen CTA "search clearSky on the App Store". No "how did you hear about us" question (it would require collecting data). Playbook, hooks, ASO metadata and screenshot captions live in `docs/GROWTH.md`.

## Review log

_(appended by the orchestrator after each adversarial round)_
