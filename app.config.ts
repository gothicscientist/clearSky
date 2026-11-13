import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * clearSky app config. Everything account-specific comes from env vars so the
 * repo holds no secrets and no personal identifiers (see docs/SETUP.md):
 *
 *   EAS_PROJECT_ID          set after `npx eas-cli@latest init`
 *   EXPO_OWNER              Expo account or organisation slug (optional)
 *   CLEARSKY_BUNDLE_ID      iOS bundle identifier registered in App Store Connect
 *   EXPO_PUBLIC_*           runtime flags read by the app (purchases mode, keys, e2e)
 */

const PROJECT_ID = process.env.EAS_PROJECT_ID;
const BUNDLE_ID = process.env.CLEARSKY_BUNDLE_ID || 'com.gothicscientist.clearsky';
const BG = '#0B1418';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'clearSky',
  slug: 'clearsky',
  ...(process.env.EXPO_OWNER ? { owner: process.env.EXPO_OWNER } : {}),
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'clearsky',
  userInterfaceStyle: 'automatic',
  backgroundColor: BG,
  ios: {
    bundleIdentifier: BUNDLE_ID,
    buildNumber: '1',
    supportsTablet: false,
    icon: './assets/images/icon.png',
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      // Calm sound beds keep playing with the screen locked during a flight.
      UIBackgroundModes: ['audio'],
    },
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyCollectedDataTypes: [],
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
      ],
    },
  },
  android: {
    package: BUNDLE_ID.replace(/-/g, '_'),
    adaptiveIcon: {
      backgroundColor: BG,
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    // Single-page export: the e2e suite serves it from a tiny static server.
    output: 'single',
    favicon: './assets/images/favicon.png',
    name: 'clearSky',
    backgroundColor: BG,
    themeColor: BG,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: BG,
        image: './assets/images/splash-icon.png',
        imageWidth: 132,
        dark: { backgroundColor: BG, image: './assets/images/splash-icon.png' },
      },
    ],
    ['expo-audio', { microphonePermission: false, enableBackgroundPlayback: true }],
    [
      'expo-sensors',
      {
        motionPermission:
          'clearSky reads your phone’s motion sensor to draw the G-meter. The readings never leave your phone.',
      },
    ],
    // Local reminders only: no push entitlement, no server.
    ['expo-notifications', { enableRemoteNotifications: false }],
    'expo-sharing',
    'expo-localization',
    'expo-font',
    'expo-web-browser',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...(PROJECT_ID ? { eas: { projectId: PROJECT_ID } } : {}),
    // Shown in Settings and the legal pages; set before submitting to the App Store.
    supportEmail: process.env.CLEARSKY_SUPPORT_EMAIL || null,
    privacyPolicyUrl: process.env.CLEARSKY_PRIVACY_URL || null,
    termsUrl: process.env.CLEARSKY_TERMS_URL || null,
  },
  ...(PROJECT_ID
    ? {
        runtimeVersion: { policy: 'appVersion' as const },
        updates: { url: `https://u.expo.dev/${PROJECT_ID}` },
      }
    : {}),
});
