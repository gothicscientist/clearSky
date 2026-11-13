# Content sources ledger

Every factual claim the app makes, the source that supports it, and its status. A claim ships only
when its status is `verified` (someone read the cited source and it says this). Source ids resolve
in `src/content/sources/*.ts`.

Status values: `verified` · `needs-check` (must be verified or cut before release) · `cut`.

## Foundation (src/content)

| Where | Claim | Source ids | Status |
|---|---|---|---|
| truths.turbulence | Transport-category structure must carry ultimate loads = 1.5 × limit loads (the maximum loads expected in service) without failure | cfr-25-303, cfr-25-305 | needs-check |
| truths.turbulence | Gust/turbulence loads are part of the certified design loads | cfr-25-341 | needs-check |
| truths.turbulence | The realistic risk in turbulence is to people who are unbelted or out of their seat | faa-turbulence, faa-ac-120-88a | needs-check |
| truths.crashing | Systems are certified on a fail-safe principle: no single failure should prevent continued safe flight and landing | cfr-25-1309 | needs-check |
| truths.crashing / control / takeoffLanding | Airline pilots receive recurrent proficiency checks / simulator training (PIC at least every 6 months under Part 121) | cfr-121-441 | needs-check |
| truths.control | Part 121 operations require at least two pilots | cfr-121-385 | needs-check |
| truths.panic | Panic attacks are frightening but not dangerous, and pass on their own, usually within minutes | nhs-panic | needs-check |
| truths.panic / breathing | Slow breathing with a longer out-breath helps calm the body's stress response | nhs-breathing | needs-check |
| truths.takeoffLanding | The thump after takeoff is the landing gear retracting; flaps/slats make whirring sounds as they move | faa-afh | needs-check |
| safety.CRISIS_RESOURCES | US 988 Suicide & Crisis Lifeline (call or text 988); Samaritans 116 123 (UK & Ireland) | 988lifeline.org, samaritans.org | needs-check |
| geo.estimateDurationMin | Gate-to-gate estimate ≈ 30 min + distance at ~830 km/h (labelled as an editable estimate, not a fact) | — | verified (estimate, labelled) |

## Streams

_(Stream E consolidates entries from every stream here.)_
