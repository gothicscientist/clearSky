# clearSky — rules for every session working in this repo

clearSky is a premium iOS fear-of-flying app (Expo SDK 58, React Native 0.88, React 19.3,
expo-router, TypeScript strict, zustand). Read these before writing code:

1. `docs/PLAN.md` — product, IA, acceptance criteria, design language, aviation accuracy rules (§7, binding).
2. `docs/RESEARCH.md` — why each decision exists (competitor failures we answer).
3. `AGENTS.md` — Expo rules (fetch versioned docs; don't trust memory for Expo APIs).
4. Your stream brief in `docs/streams/<stream>.md` if you are a workstream session.

## Commands

```bash
npm run typecheck          # tsc --noEmit — must pass
npm run lint               # expo lint — must pass with 0 errors
npm run e2e                # build web bundle (if sources changed) + run every e2e flow
npm run e2e -- --only <x>  # just flows whose file/name contains <x>
npm run e2e:failed         # rerun only what failed last time
```

Fresh git worktree? Run `npm ci --prefer-offline --no-audit --no-fund` first (node_modules is not shared).

## Architecture contract (frozen unless you are the orchestrator)

- Routes are thin files in `src/app/**`; screens/components/logic live in `src/features/<name>/**`.
- Shared primitives: `src/ui/*` (Screen, Text, Button, IconButton, Icon, Card, Choice, ListRow,
  ToggleRow, Segmented, TextField, FearScale, Notice, Skeleton, ProgressBar, Stat, SourceNote,
  HorizonLine, BreathRing, SOSButton, TabBar). Use them; don't fork them. Need a change? Shim it in
  your feature folder and write the request in `docs/streams/<stream>.md`.
- Theme: `useTheme()` → `{ c, isDark }`; tokens in `src/theme/tokens.ts` (space, radius, type,
  motion, hit, layout). Never hard-code colours. Dark is the default.
- State: `src/stores/*` (profile, entitlement, flights, progress) built with `createPersistedStore`.
  A feature that needs its own persisted store creates it in its own folder with `createPersistedStore`.
  Stats are always derived from `progress.sessions` (`logSession` exactly once per finished use).
- Time: only `clock.now()` from `src/lib/clock` (tests move it). Never persist a ticking value; store
  wall-clock anchors and derive.
- Network: only `fetchWithTimeout` from `src/lib/net` (offline + timeout handling, test-controllable).
- Navigation between features: only `routes` from `src/lib/routes.ts`.
- Cross-feature content: `src/content/*` (breathing patterns, truths, program index, lesson ids,
  safety copy, sources registry). Each stream owns exactly one sources file in `src/content/sources/`.
- Features never import from another feature.
- Purchases: only `purchases` from `src/lib/purchases` (mock in Expo Go/web/e2e, RevenueCat in
  native builds). Prices always come from the store (`priceString`), never hard-coded.

## Expo SDK 58 specifics already verified in this repo

- Tabs: `import { Tabs } from 'expo-router/js-tabs'` (the `expo-router` export is deprecated).
  Custom tab bars receive `{ state, descriptors, emitter, navigateToTab, insets }`.
- Stacks: `import { Stack } from 'expo-router'`; guards use `<Stack.Protected guard={...}>`;
  layouts set `export const unstable_settings = { anchor: 'index' }`.
- React 19: `ref` is a normal prop (no `forwardRef`). Lint enforces React Compiler rules: no
  `setState` directly in an effect body, no ref writes during render.
- Web export uses `web.output: "single"` (SPA) so e2e can serve it statically.

## UI, copy and accessibility rules

- Every screen root is `<Screen testID="<feature>.<screen>">`; every interactive element has a
  testID `<feature>.<screen>.<element>` (kebab-case after the dots). e2e flows depend on them.
- Voice: second person, short sentences, present tense. Validate, then inform. No exclamation
  marks. Never "just relax", "deep breaths", "cure", "treat", "clinically proven", crash odds,
  "100% safe". Say "bumps", not "air pockets".
- Dynamic Type must not truncate (no fixed heights on text containers); 44 pt targets (56 in SOS);
  VoiceOver labels on every control; never colour-only meaning; honour Reduce Motion
  (`useReduceMotion()` → crossfade instead of movement).
- Every factual claim cites a source id (`<SourceNote ids=[...] />`) that exists in
  `src/content/sources/*` and is listed in `docs/CONTENT_SOURCES.md`. No number without a primary source.
- No confetti, purple gradients, glassmorphism or mascots. The horizon line is the motif.

## Testing

End-to-end first (no unit-test suites). Flows live in `tests/e2e/flows/<stream-letter>-<topic>.mjs`
and use the helpers documented in `tests/e2e/README.md` (seeds, purchases, clock, offline, NOAA
fixtures). Anything you build must be covered by at least one flow, including its offline,
empty and error states. Device-only behaviour (haptics, sensors, StoreKit, notifications, share
sheet) goes in `docs/DEVICE_CHECKLIST.md` requests.

## Git

Workstream sessions commit only to their own branch, only files they own (see the brief), with
clear messages. Never edit frozen files, never commit `ios/`, `android/`, `dist*/`, `.env`.
