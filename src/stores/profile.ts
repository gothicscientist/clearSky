import type { OnboardingAnswers, Settings } from '@/types';

import { clock } from '@/lib/clock';

import { createPersistedStore } from './persist';

export const emptyAnswers: OnboardingAnswers = {
  fears: [],
  primaryFear: null,
  peaks: [],
  body: [],
  nextFlight: null,
  nextFlightDate: null,
  tried: [],
  demoCheckIn: null,
  goal: null,
};

export const defaultSettings: Settings = {
  appearance: 'dark',
  haptics: true,
  voice: true,
  sound: true,
  reminders: false,
  breathingPattern: 'extended-exhale',
};

interface ProfileState {
  answers: OnboardingAnswers;
  /** Index of the furthest onboarding step reached, so a relaunch resumes there. */
  onboardingStep: number;
  onboardingCompletedAt: number | null;
  settings: Settings;

  setAnswers: (patch: Partial<OnboardingAnswers>) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  setSettings: (patch: Partial<Settings>) => void;
}

export const useProfileStore = createPersistedStore<ProfileState>(
  { name: 'profile', version: 1 },
  (set) => ({
    answers: emptyAnswers,
    onboardingStep: 0,
    onboardingCompletedAt: null,
    settings: defaultSettings,

    setAnswers: (patch) => set((s) => ({ answers: { ...s.answers, ...patch } })),
    setOnboardingStep: (step) => set({ onboardingStep: step }),
    completeOnboarding: () => set({ onboardingCompletedAt: clock.now() }),
    setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  }),
);

export const useSettings = () => useProfileStore((s) => s.settings);
export const useOnboarded = () => useProfileStore((s) => s.onboardingCompletedAt != null);
