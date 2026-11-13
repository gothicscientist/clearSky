# Stream A — Entry: onboarding, paywall, settings, legal, crisis

## You own (exclusively)

- `src/features/{onboarding,paywall,settings,legal}/**`
- `src/app/onboarding/**`, `src/app/paywall.tsx`, `src/app/settings/**`, `src/app/legal/**`, `src/app/crisis.tsx`
- `src/content/sources/entry.ts`
- `docs/legal/**` (terms of use / EULA, privacy policy — markdown sources of truth)
- `tests/e2e/flows/a-*.mjs`
- this file (Requests / Notes / Device checklist sections)

## Contract testIDs (other flows depend on these — keep them exactly)

- `onboarding.hook` (first onboarding screen root) and `onboarding.hook.continue`
- `paywall.screen` (paywall root) and `paywall.cta` (purchase button)
- `settings.home` (settings root), `legal.doc` (legal page root), `crisis.screen` (crisis root)

## Build

### Onboarding (PLAN §3, 13 steps → paywall)
Under 2 minutes, one decision per screen, a progress bar, resumable after app kill
(`useProfileStore().onboardingStep`; resume where they left off). Answers go to
`useProfileStore().setAnswers` (types in `src/types.ts`). Steps: hook → fear type (multi-select,
then pick the primary) → when it peaks → body response → mirror (reflects their answers back) →
next flight (booked + date / nothing booked / avoiding) → what you've tried (non-judgemental) →
felt demo (60-s extended-exhale breath with `useBreathPacer` + `BreathRing`, haptics, the
`HorizonLine` levels as it completes; skippable after 15 s) → check-in (a little / a lot / not yet,
each with honest copy) → truth card (`TRUTHS[primaryFear]` from `src/content/truths.ts` with its
`SourceNote`) → goal → reminders priming (explain, then `reminders.request()`; skipping is one tap
and never nags; set `settings.reminders`) → plan reveal (visibly built from fear type, peak moment
and flight date; lists what's inside; includes `DISCLAIMER` from `src/content/safety.ts`; the route
arc / horizon draws in) → `completeOnboarding()` then push the paywall.

The demo breath must log nothing to `progress` (it's onboarding). Track analytics events with
`track()` from `src/lib/analytics` (no identifiers ever).

### Paywall (PLAN §3, every state reachable in tests)
Headline "Unlock your plan", three plan-specific bullets (from their answers), yearly preselected
showing the full billed `priceString` as the most prominent figure and a per-week equivalent
computed from `price`/`currencyCode` (use `Intl.NumberFormat`) smaller; weekly with equal
legibility; CTA "Continue"; auto-renew disclosure text; Restore Purchases, Terms of Use (EULA) and
Privacy Policy (`routes.legal('terms' | 'privacy')`) visible without scrolling on a 6.1" screen;
no close button (Back returns to the plan reveal). If `introOffer` is non-null describe it with the
store's string; otherwise no trial language anywhere. In mock mode show a small "Test mode — no
charge" note (`purchases.isMock`).

States: loading (skeletons, CTA disabled, Restore live) · offerings failed/offline ("The App Store
isn't answering. Nothing was charged." + Retry; no prices shown) · cancelled (silent) · failed
(inline message, selection kept) · pending/Ask to Buy ("Waiting for approval", re-check on
foreground via `purchases.refresh()`) · restoring · restored · nothing to restore · already
subscribed (guards skip the paywall) · lapsed (paywall returns, data intact). After a successful
purchase or restore the root guards move the user into the app automatically (don't navigate
manually into protected routes; verify it works).

### Settings (`/settings`, PLAN §4)
Manage subscription (opens `https://apps.apple.com/account/subscriptions`), Restore, voice /
haptics / sound toggles, appearance (dark / light / system), reminders (permission-aware; re-request
or explain how to enable in iOS Settings), export all data (`exportAllData()` → share sheet via
`expo-sharing` writing a JSON file; on web offer a download), delete all data (confirm dialog →
`resetAllStores()`, `reminders.cancelAll()`; subscription is untouched and the copy says so),
sources & licences (`allSources()` + font/data licences: Fraunces OFL, OurAirports public domain),
disclaimer, crisis resources (→ `routes.crisis`), privacy statement (`PRIVACY_PROMISE`), terms,
support contact (`Constants.expoConfig.extra.supportEmail`; hide the row if null), app version.
A Developer section appears only when `purchases.isMock`: next purchase outcome, expire
subscription now, reset app.

### Legal and crisis
- `/legal/[doc]` renders `terms`, `privacy`, `licences` from TS content you generate from
  `docs/legal/*.md` (write both). Terms must include Apple's standard EULA reference, auto-renewal
  terms, the wellness disclaimer. Privacy: no account, no tracking, data on device, RevenueCat as the
  only processor (anonymous ID, purchase history), NOAA requests carry no identifiers, export/delete.
  Mark the owner-specific fields (legal entity name, contact email, governing law) as clear
  `[OWNER: …]` placeholders.
- `/crisis` (always reachable, offline): `CRISIS_RESOURCES`, `SEEK_HELP_POINTS`, tap-to-call where
  `dial` is set (`Linking.openURL`), medication and alcohol stance.

## e2e flows to write (`tests/e2e/flows/a-*.mjs`)
- full onboarding happy path (answers persisted, plan reveal reflects them, lands on paywall)
- resume after relaunch mid-onboarding; skipping the demo after 15 s; reminders skip
- paywall: yearly preselected, prices from store, per-week math, legal links reachable, every state
  above (use `t.offerings`, `t.purchaseOutcome`, `t.restoreOutcome`, `t.offline`)
- restore with nothing to restore / restored / failed; purchase while offline says nothing charged
- settings: toggles persist across relaunch, appearance switches theme, export produces JSON,
  delete all returns to onboarding, developer panel only in mock mode
- crisis reachable from settings and directly while not subscribed

## Device checklist (add yours)
- StoreKit sandbox purchase, cancel, Ask to Buy, restore; per-week price in a non-USD storefront
- Notification permission prompt timing; Manage subscription link opens the right sheet

## Requests
_(foundation changes you need — the orchestrator applies them at merge)_

## Notes
