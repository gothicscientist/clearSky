# clearSky — competitor research (2026-11-13)

Sources: App Store listings (US) for Steady, SkyGuru, SOAR, ReadytoFly, No More Fear of Flying; Mentour Pilot's 2022 app review; ReadytoFly's 2026 comparison blog (self-interested, treated as unverified); flight-anxiety cost guides. Only a handful of reviews are visible per listing, so samples are small.

## Steady: Fear of Flying (Nordic Social Media AB) — the app to beat

- 25 ratings, 4.7 avg, v1.3.5, 21.7 MB, iOS 18+, Health & Fitness, 13+.
- Features: turbulence forecast (NOAA PIREPs + SIGMETs within 100 nm of route, "smoothness score", confidence %, segment breakdown); MonitorBuddy (community watches your flight live, radar); SOS 4-4-4-4 box breathing with bundled voice; 5-4-3-2-1 grounding with haptics; "Jello Plane"; "What's That Sound?"; distraction arcade (Subtract by 7, Color Match); Bravery Boarding Pass share card; streaks; Lock Screen Live Activity; claims fully offline.
- IAP: weekly $5.99, 72-hour pass $11.99, yearly $39.99, lifetime $49.99.
- Privacy label: identifiers **used to track you**. No accessibility features declared.

### Where Steady fails (visible reviews + its own release notes)
1. **Trust.** Reviews titled "Scam" / "scam, don't use": flight-number lookup returned an unrelated flight; forecast "uses zero credible resources"; "fabricated" information. Developer admits the route DB maps flight numbers to outdated routes.
2. **A single invented-looking number.** A "smoothness score" + "confidence %" derived from sparse PIREPs reads as fabricated precision.
3. **Reliability.** Release notes show months of fixes: stats not counting, stale flights, Live Activity out of sync, timers counting from the wrong time.
4. **Artificial caps for paying users** (forecasts limited to 2, then 4 per day on Pro).
5. **Community/UGC surface** adds moderation risk and needs connectivity — the opposite of what's needed at 38,000 ft.
6. **Tracking** in a mental-health-adjacent app.

## Other competitors
| App | Liked | Complaints |
|---|---|---|
| SOAR | Depth, CBT/exposure grounding, **G-force meter** | Dated UI, content won't scroll, 10 confusing IAPs ($19.99–$59.99, full program $595), no update since 2020, no panic button |
| SkyGuru | Real-time phase/noise explanations | Per-flight pricing ($15–20), reported in-flight crashes and lost credits, needs connection to set up, background location + tracking |
| ReadytoFly | CBT/ACT, flight-day audio, expected-vs-actual debrief | $9.99/wk or $79.99/yr, 8 SKUs, AI guide needs internet |
| VALK | Clinical evidence base, panic button | Dated UI |
| TurbCast | Cheap forecast | No therapeutic content |
| Am I Going Down? | Simple | Crash-odds framing upsets some users |
| No More Fear of Flying | — | Thin content, silent audio bug, price complaints |

## Recurring complaint themes → clearSky requirements
1. Data credibility → show sources, raw reports, timestamps and plain-language limits; never invent a precise score.
2. Wrong flight lookup → no guessed flight-number mapping; user picks airports from a bundled database and confirms the route.
3. Fails in flight → every calming/learning/in-flight feature works with zero connectivity, verified by test.
4. Paywall confusion, restore failures → two SKUs only, transparent pricing, Restore always visible, entitlement cached offline.
5. Thin content → real curriculum with cited aviation facts.
6. Alarming framing → never show crash odds; turbulence framed as comfort, not danger.
7. Forecast checking feeds anxiety (noted by clinicians/cost guides) → outlook designed to reassure and discourage compulsive re-checking.
8. Accessibility → Dynamic Type, VoiceOver labels, Reduce Motion, high contrast.
9. Privacy → no tracking, no account, data stays on device.
