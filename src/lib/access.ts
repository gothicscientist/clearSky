import { usePro } from '@/stores/entitlement';
import { useProfileStore } from '@/stores/profile';

/**
 * The app's single gating decision, used by the root navigator guards and the
 * index redirect. Hard paywall: nothing past onboarding is usable without Pro.
 */
export type AccessStage = 'onboarding' | 'paywall' | 'app';

export function stageFor(onboarded: boolean, pro: boolean): AccessStage {
  if (!onboarded) return 'onboarding';
  if (!pro) return 'paywall';
  return 'app';
}

export function useAccess(): { stage: AccessStage; onboarded: boolean; pro: boolean } {
  const onboarded = useProfileStore((s) => s.onboardingCompletedAt != null);
  const pro = usePro();
  return { stage: stageFor(onboarded, pro), onboarded, pro };
}
