# Testing clearSky

Three ways to put clearSky on your own iPhone, from fastest to most production-like, plus the
automated end-to-end suites.

| | Expo Go | Development build | TestFlight |
|---|---|---|---|
| Needs an Apple Developer account | No | Yes ($99/yr) | Yes |
| Time to first launch | ~5 min | ~30 min (cloud build) | ~1 h first time |
| Purchases | Simulated ("Test mode") | Simulated or real sandbox | Real sandbox (no charge) |
| Live reload while editing | Yes | Yes | No |
| Best for | Trying every screen today | Native features, RevenueCat | Final checks before release |

## 1. Expo Go — try it on your iPhone in five minutes

1. On the iPhone, install **Expo Go** from the App Store.
2. On the PC, in the `clearSky` folder:
   ```bash
   npm install
   ```
   ```bash
   npx expo start --go
   ```
   (`--go` matters: without it the server targets development builds, not Expo Go.
   `npm run start:go` does the same.)
3. Keep the phone on the **same Wi-Fi** as the PC. Open the iPhone **Camera**, point it at the QR
   code in the terminal, and tap the banner — clearSky opens in Expo Go.
   - If the phone can't connect (office/hotel Wi-Fi, VPN, firewall), stop the server and use
     `npx expo start --go --tunnel` instead, then scan again.
   - Windows may ask to allow Node.js through the firewall: allow it on private networks.
4. Purchases are simulated: the paywall shows "Test mode — no charge". Tap Continue to unlock.
   **Settings → Developer** lets you choose the next purchase result (success, cancelled, pending,
   failed), expire the subscription, or reset the app to a first launch.
5. To test airplane mode, switch the iPhone to Airplane Mode *after* the app has loaded once:
   everything except the weather outlook keeps working.

What Expo Go can't show: real App Store purchases and the final app icon/splash. Everything else —
haptics, the motion sensor (G-meter), voice, sounds, notifications, sharing — works.

## 2. Development build — your own clearSky app with native modules

One-time setup (needs an Apple Developer account):

1. Create a free Expo account at https://expo.dev/signup, then on the PC:
   ```bash
   npx eas-cli@latest login
   ```
   ```bash
   npx eas-cli@latest init
   ```
   Copy the project ID it prints into a `.env` file as `EAS_PROJECT_ID=…` (see `.env.example`).
2. Register your iPhone (opens a page you visit on the phone to install a profile):
   ```bash
   npx eas-cli@latest device:create
   ```
3. Build in the cloud (no Mac needed) and install from the link/QR it prints:
   ```bash
   npx eas-cli@latest build --profile development --platform ios
   ```
   On iOS 16+, enable **Settings → Privacy & Security → Developer Mode** when prompted.
4. Start the dev server and open the installed clearSky app on the phone:
   ```bash
   npx expo start --dev-client
   ```

The `development` profile uses simulated purchases. To try the real RevenueCat flow in a dev build,
finish `docs/SETUP.md` (products + RevenueCat key) and build with
`EXPO_PUBLIC_PURCHASES_MODE=revenuecat` set in the EAS environment.

## 3. TestFlight — the release candidate

1. Finish `docs/SETUP.md` (App Store Connect app record, the two subscription products,
   RevenueCat, environment variables, `ascAppId` in `eas.json`).
2. Build and upload:
   ```bash
   npx eas-cli@latest build --profile production --platform ios --auto-submit
   ```
   (or run the `.eas/workflows/testflight.yml` workflow:
   `npx eas-cli@latest workflow:run .eas/workflows/testflight.yml`).
3. When App Store Connect finishes processing (10–30 min), install **TestFlight** on the iPhone and
   accept the invite. Purchases use your **Sandbox Apple ID** (App Store Connect → Users and Access →
   Sandbox) and are never charged; sandbox renewals run fast (a week renews every few minutes).

Walk through `docs/DEVICE_CHECKLIST.md` on the phone — it covers what automated tests can't
(haptics, sensor feel, StoreKit sheets, notifications, share sheet, Dynamic Type, VoiceOver).

## Automated end-to-end tests

### Web flows (runs on this Windows PC)

```bash
npm run e2e
```

Builds the web version with a test bridge, serves it locally and drives Chrome through every
customer workflow at iPhone size with `agent-browser`. Rerun only what failed:

```bash
npm run e2e:failed
```

Details, seeds and helpers: `tests/e2e/README.md`. Results land in `tests/e2e/.results/`.

### iOS simulator flows (Maestro, runs in the cloud)

`tests/maestro/*.yaml` mirror the critical paths on a real iOS simulator. A Windows PC can't run
the iOS simulator, so they run on EAS (after step 2.1 above):

```bash
npx eas-cli@latest workflow:run .eas/workflows/e2e-ios.yml
```

On a Mac with Xcode you can also run them locally:
`npx expo run:ios` with `EXPO_PUBLIC_E2E=1`, then `maestro test tests/maestro`.

### Static checks

```bash
npm run check
```

Typecheck + lint + WCAG contrast. `npm run check:bundle` proves the test bridge is absent from
production bundles.
