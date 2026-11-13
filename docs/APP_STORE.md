# clearSky — App Store listing kit

Everything here obeys PLAN §1 and §7: wellness positioning only, no invented numbers, no ratings or "as seen on", no crash odds, no "cure / treat / therapy / clinically proven". Character counts were measured, not eyeballed. Placeholders are written `[OWNER: …]`.

## 1. Name and subtitle (30 characters each)

Apple indexes name + subtitle + keywords together, so words used in the name or subtitle are **not repeated** in the keyword field.

| # | Name | Chars |
|---|---|---|
| **N1 (recommended)** | `clearSky: Fear of Flying` | 24 |
| N2 | `clearSky: Flight Anxiety Calm` | 29 |
| N3 | `clearSky: Calm Flying` | 21 |

| # | Subtitle | Chars |
|---|---|---|
| **S1 (recommended)** | `Calm, honest flight companion` | 29 |
| S2 | `Understand every bump & sound` | 29 |
| S3 | `Breathe. Learn. Board calmly.` | 29 |
| S4 | `Turbulence, sounds, breathing` | 29 |

Recommended pair: **N1 + S1**. "Fear of Flying" is the highest-intent phrase people actually type; "honest" is the differentiator against invented-score competitors. Use S2 in a Custom Product Page variant for the sounds/G-meter ad formats.

## 2. Promotional text (170 max — editable any time without review)

```
Hit a bump? Heard a thump? clearSky explains what is happening, breathes with you, and works in airplane mode. No account, no tracking. Search clearSky on the App Store.
```
169 characters. Swap freely for seasonal copy (see §12) — never for countdowns or discounts you are not really running.

## 3. Description (limit 4000; this one is 3,678)

```
Flying is safe. Your body didn't get the memo.

clearSky is a calm, honest co-pilot for nervous flyers. It explains what you are hearing and feeling, helps your body settle, and keeps working at 38,000 feet, because almost everything runs with no signal at all.

NO INVENTED NUMBERS
Other apps hand you a "smoothness score" built from thin data. clearSky doesn't. You get real instruments and real sources, with the limits stated plainly.

WHAT'S INSIDE

• SOS, one tap away
A single breathing ring, a slow voice if you want one, then grounding. No choices to make while you are struggling. Works offline.

• Breathing that fits the moment
Extended-exhale, coherent and box patterns, 1, 3 or 5 minutes, paced by shape and haptics so you can follow it with your eyes closed.

• Flight Companion
See the phases of your flight, from pushback to taxi-in, and what you will hear and feel in each one. Labelled "estimated", and one tap re-syncs it to where you really are.

• Sounds & Sensations
The thump after takeoff. The whirr. The "double ding". Engines that seem to go quiet. More than 24 plain-language explainers: what it is, why it is normal, when it happens.

• G-meter
Your phone's own motion sensor, drawn as a slow, calm trace. It is your phone's reading, not the aircraft's, and it comes with real certification context and sources.

• Weather outlook for your route
Public NOAA aviation weather reports, filtered to your route and shown raw, with timestamps, altitude and a plain-language translation. Three simple bands, never a score or a percentage. The only feature that needs a connection.

• Learn
About 24 short lessons on turbulence, the aircraft, the people and systems behind your flight, weather and "what if". Every factual claim has a source you can read.

• A 7-session self-help program
Built on CBT and ACT principles: how fear works, your body's alarm, thoughts on trial, your ladder, making room, flight-day plan, after landing. Personalised to the fear you tell us about.

• Debrief, logbook and landing card
Note how scary you expected the flight to be and how it really felt. See the honest gap, including the days it was harder. Share a boarding-pass-style card if you like.

BUILT TO BE TRUSTED
• No account, no sign-up, no community feed
• No tracking and no advertising
• Your data stays on your device; export or delete it any time in Settings
• Two plans, no usage caps, no surprise tiers
• Works in airplane mode (except the weather outlook)
• Accessible: Dynamic Type, VoiceOver, Reduce Motion

SUBSCRIPTION
clearSky requires a subscription after a short setup. Choose clearSky Pro Weekly or clearSky Pro Yearly (prices shown in the app in your local currency; US prices are $5.99 per week or $39.99 per year). Payment is charged to your Apple ID at confirmation of purchase. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Your account is charged for renewal within 24 hours before the end of the current period. Manage or cancel any time in Settings > Apple ID > Subscriptions. Restore Purchases is always available.

Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacy Policy: [OWNER: privacy policy URL]

IMPORTANT
clearSky is a self-help wellness tool. It does not diagnose, treat or cure any condition and is not a substitute for professional care. If you feel unsafe, or your fear reaches beyond flying, please talk to a doctor or a qualified professional. In an emergency, call your local emergency number. On board, tell the cabin crew. Weather information comes from public NOAA reports, is a snapshot, and is not a flight-safety tool.
```

If the owner publishes custom Terms instead of Apple's standard EULA, replace the Terms line and set the custom EULA in App Store Connect (App Information > License Agreement).

## 4. Keyword field (100 max, comma-separated, no spaces)

```
turbulence,anxiety,nervous,flyer,aerophobia,plane,airplane,panic,breathing,sounds,g-force,takeoff
```
97 characters. Rules applied: no words already in the recommended name/subtitle (fear, flying, flight, calm, honest, companion), no competitor names or trademarks (Steady, SOAR, SkyGuru, ReadytoFly, VALK), no "cure/therapy/treatment", singular forms (Apple matches plurals), no spaces after commas. Backups to rotate in after 4 weeks if a term is dead: `jitters`, `pilot`, `cabin`, `landing`, `relax`, `mindful`.

## 5. Category

| | Choice | Reasoning |
|---|---|---|
| Primary | **Health & Fitness** | Where the audience of calming/breathing apps browses. Matches the wellness positioning; the closest competitor sits here, so we appear in the same lists. |
| Secondary | **Travel** | Route, flight phases and weather outlook are genuinely travel-adjacent and give a second chart to rank in. |
| Avoid | Medical | Invites diagnostic/treatment scrutiny that contradicts "self-help wellness tool". |

## 6. Age rating (App Store Connect questionnaire — answer honestly, re-read each question as shown)

| Question | Answer | Note |
|---|---|---|
| Violence, sexual content, nudity, profanity, horror/fear themes | None | Fear is addressed as an experience; no frightening imagery. |
| Alcohol, tobacco, drug use or references | None / Infrequent | Settings text says alcohol is not recommended as a coping tool. If the form asks about "references", pick the lowest option that is true. |
| Medical or wellness topics | Yes, wellness only | Self-help breathing/education. Not diagnosis or treatment. |
| Gambling, contests, loot boxes | None | |
| Unrestricted web access | No | Only links to Apple's Terms/Subscriptions pages and the privacy policy. |
| User-generated content, chat, messaging | None | No community. |
| Mentions of self-harm or suicide | Check the question wording | The crisis screen only lists helplines (988, Samaritans); it depicts nothing. If Apple's wording would count this, answer the lowest true option and mention it in Review Notes. |
| Parental controls / age assurance | No | |

Expected result is a low rating (4+ to 9+; do not accept a rating you cannot justify, and do not answer "None" to anything that is not true). The in-app audience is adults; do not market to children.

## 7. Screenshots (8)

Sizes: **6.9"** 1320 × 2868 px (iPhone 16/17 Pro Max class) and **6.5"** 1284 × 2778 px. Upload both sets; smaller classes scale from these. Dark theme only, real screens, no device mockups needed. Headlines go in the top third in Fraunces, max 5 words, no punctuation tricks. The first three screenshots carry the sale (they show without scrolling).

| # | Headline | Screen shown | Why |
|---|---|---|---|
| 1 | Calm, at 38,000 feet | Onboarding mirror ("That's a false alarm from a system doing its job") over the horizon line | Positioning and tone in one frame |
| 2 | One tap when it's hard | SOS breathing ring | The emotional promise |
| 3 | What was that sound? | Sounds & Sensations entry card (gear thump) | The most searched worry |
| 4 | See your flight, phase by phase | Companion timeline with "estimated" label | Differentiator vs. guessy apps |
| 5 | Real readings. No fake scores. | G-meter dial and trace, "This is your phone's reading" | Trust pillar |
| 6 | Weather reports, in plain words | Outlook raw-report translator under the band headline | Honest forecasts |
| 7 | Works in airplane mode | Breathing or Companion with the airplane-mode status icon visible | Practical proof |
| 8 | Private. No account. | Settings > privacy statement, or the logbook (debrief chart) | Privacy plus journey |

Rules: no star ratings, awards, user numbers or "#1"; no price in screenshots (store shows it); the G-meter capture must be a real device or a frame clearly showing the "Demo" label; the Outlook frame uses real public report text or the bundled fixture, never an invented report presented as live. Custom Product Pages (§13) reorder these per ad format.

## 8. App Privacy ("nutrition label")

Reasoning. The app has no analytics, advertising, crash-reporting or attribution SDK and no account. RevenueCat is the only third party; it receives an **anonymous App User ID** and the **purchase history** for that ID. Apple defines "linked to the user" as data connected to an identity *by any means, including a device or user ID*. An ID that persistently ties purchase records to one install is therefore safest to declare as **linked**, even though it is anonymous and cannot identify a person by name. That is the conservative, rejection-proof reading; it costs nothing in marketing because "no tracking" stays true. (PLAN §6 and the in-app privacy text currently say "not linked": align the privacy policy and `PRIVACY_PROMISE` to this table before submitting, or consciously keep the PLAN wording and accept the review risk.)

| Question | Answer |
|---|---|
| Do you or your third-party partners collect data from this app? | **Yes** (purchase data via RevenueCat) |
| Data types collected | **Purchases > Purchase History**; **Identifiers > User ID** (RevenueCat anonymous app user ID) |
| Linked to the user's identity? | Yes for both (conservative reading above) |
| Used to track the user (ads, data brokers, other companies' apps/sites)? | **No**, for both |
| Purpose | **App Functionality** only (verifying and restoring the subscription) |
| Contact info, health & fitness, financial info, location, contacts, user content, browsing/search history, usage data, diagnostics, sensitive info | **Not collected** |
| Tracking (ATT) | None. No `NSUserTrackingUsageDescription`; no ATT prompt. |

Notes to keep the label true:
- Breathing logs, fear ratings, flights, debriefs and notes stay in on-device storage and never leave the phone; "Health & Fitness" data is therefore **not collected**. Export is a user-initiated file share.
- Motion sensor data is read on-device for the G-meter and never transmitted.
- Weather requests go to NOAA with no identifiers or custom headers. The developer does not receive them. (NOAA's servers see an IP address as any website would; this is not collection by the developer or a partner, so it is not declared. Mention it in the privacy policy.)
- Local notifications (reminders) need no server and no push token.
- If an analytics, crash or attribution SDK is ever added, this table and the policy must change first.

## 9. Subscription group setup (App Store Connect > Subscriptions)

| Field | Value |
|---|---|
| Subscription group reference name | `clearsky_pro` |
| Group display name (shown to users, localised) | `clearSky Pro` |
| Products | one group; yearly ranked above weekly (Level 1 yearly, Level 2 weekly) |
| Introductory offer | **None** unless the owner decides to configure one. If configured, the app displays it with the store's own strings; no "free" wording otherwise. |

| | Weekly | Yearly |
|---|---|---|
| Product ID | `clearsky_pro_weekly` | `clearsky_pro_yearly` |
| Reference name | clearSky Pro Weekly | clearSky Pro Yearly |
| Duration | 1 week | 1 year |
| Price (US base) | $5.99 | $39.99 |
| Display name (max 30) | `clearSky Pro Weekly` (19) | `clearSky Pro Yearly` (19) |
| Description (max 45) | `Full access. Renews weekly.` (27) | `Full access. Renews yearly.` (27) |
| Family Sharing | Off | Off |

Review screenshot (required per product): the paywall at 6.9", yearly selected, showing both plans, the full billed price, auto-renew disclosure, Restore Purchases, Terms and Privacy links. Review notes per product: "Unlocks all features. Auto-renews. Entitlement id: pro."

Also fill in: tax category; localisations for every storefront language you ship; the Subscription Terms section in App Information links (privacy policy + EULA). Let App Store Connect auto-convert other territories' prices from US base, and review them once; the app always shows the store's localised string.

## 10. Required URLs

| Field | URL | Notes |
|---|---|---|
| Privacy Policy URL | `[OWNER: https://…/privacy]` | Required. Must match `docs/legal/privacy` and §8. Host a plain page you control. |
| Terms of Use / EULA | Apple standard EULA (`https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`) or `[OWNER: https://…/terms]` | Link inside the description and in the app (Settings and paywall). |
| Support URL | `[OWNER: https://…/support]` | Required. A one-page site with a contact email and 3 FAQs (restore purchases, cancel, delete data). |
| Marketing URL | `[OWNER: optional]` | Optional landing page. |
| Support email | `[OWNER: email]` | Same as Settings > Support contact. |

## 11. App Review notes (paste into App Review Information)

```
Hello, and thank you for reviewing clearSky.

SIGN-IN: None. The app has no accounts, no login and no demo account is needed.

PAYWALL: clearSky is a subscription app with a hard paywall shown immediately after a ~2-minute onboarding (13 short screens; the first is "Flying is safe. Your body didn't get the memo."). There is no free tier by design. Two auto-renewing subscriptions in one group: clearsky_pro_weekly and clearsky_pro_yearly. The paywall shows the full billed price from the App Store, the per-week equivalent, the auto-renew disclosure, Restore Purchases, Terms of Use and Privacy Policy links. There is no trial or discount language unless the store returns an introductory offer.

HOW TO TEST: Run onboarding, reach the paywall, and purchase either plan with a sandbox Apple ID. Restore Purchases is on the paywall and in Settings. After purchase the app opens automatically. Manage Subscription (Settings) opens Apple's subscriptions page.

DATA: No tracking, no analytics SDK, no advertising. RevenueCat handles purchase validation with an anonymous app user ID. Weather data is public NOAA Aviation Weather Center data (aviationweather.gov), requested with no identifiers. It is optional and only used in the Weather Outlook screen; everything else works offline.

SENSORS / PERMISSIONS: Motion sensor (accelerometer) is used only on-device for the G-meter. Notifications are optional local reminders; the app works if you decline.

HEALTH CLAIMS: clearSky is a self-help wellness tool and says so in onboarding, Settings and the listing. It makes no diagnosis or treatment claims. A Crisis screen with helplines is reachable offline without a subscription (Settings > Crisis resources).

Contact: [OWNER: name, email, phone]
```
Before submitting: verify the Crisis screen link is reachable while unsubscribed (e2e `a-*` covers this) and that the paywall shows all required disclosures on a 6.1" device.

## 12. In-app events and promotional offers (all honest)

In-app events need a real, dated thing a user can do in the app, a deep link, and their own card art. Nothing below uses countdowns you are not truly running, fake "limited" language, guilt or invented savings.

| Idea | Type | When | What it really is |
|---|---|---|---|
| Holiday travel week: build your flight-day plan | Event (Major update/Special event) | Before US Thanksgiving, December holidays, summer break | Points to the existing "flight-day plan" program session; dated because travel is dated |
| Turbulence season explainer | Event | Spring/summer convective season | Highlights the Learn turbulence module and the Outlook translator, new lessons only if actually shipped |
| New sounds added | Event (New content) | Whenever sounds ship | Real changelog with the new entries named |
| "Before your first flight in a while" | Event (Challenge-free) | Quarterly | The 7-session program as a self-paced path, no streaks |
| Win-back offer for lapsed subscribers | Promotional offer (real, store-configured) | Any time | Only a real price or period reduction configured in App Store Connect; show it with the store's strings; never fake an original price |
| Offer codes for creators/press/friends | Offer codes | Ongoing | Free access you actually grant; do not call it a giveaway unless you run one under TikTok's rules |
| Seasonal promotional-text swaps | Promotional text | Anytime | Free, instant, no review (see §2) |

Do not run an introductory free trial purely to chase conversion without telling the user exactly what happens at the end; if you add one, the paywall copy must state the post-trial price and renewal date from the store's strings.

## 13. Custom Product Pages (ties the listing to GROWTH.md attribution)

Create one Custom Product Page per TikTok format (App Store Connect > Custom Product Pages; up to 35 can run at once). Each uses the same icon and description but reorders screenshots so the first frame matches the video the viewer just watched (see the format map in `docs/GROWTH.md`). The campaign link for each page includes its `ppid`, so downloads attribute to the page and the format.

## 14. Pre-submission checklist

- Name, subtitle, keywords, promo text and description lengths match §1–§4.
- Subscription group, both products, localisations and review screenshots complete; both products "Ready to Submit" and attached to the version.
- Privacy label (§8) equals the privacy policy and in-app statement.
- Banned-phrase sweep of listing text: cure, treat, therapy, clinically proven, percent success, crash odds, "100% safe", "never crashed", "air pocket", "#1", "award", "as seen on".
- Disclaimer sentence appears in the description exactly as written.
