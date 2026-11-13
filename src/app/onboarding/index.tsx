import { router } from 'expo-router';

import { routes } from '@/lib/routes';
import { useProfileStore } from '@/stores/profile';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

/** Placeholder — owned by stream A (replaced by the 13-step onboarding). */
export default function OnboardingPlaceholder() {
  const complete = useProfileStore((s) => s.completeOnboarding);
  return (
    <Screen
      testID="onboarding.hook"
      title="Flying is safe. Your body didn’t get the memo."
      footer={
        <Button
          label="Continue"
          testID="onboarding.hook.continue"
          onPress={() => {
            complete();
            router.push(routes.paywall);
          }}
        />
      }>
      <Text tone="secondary">Stream A builds onboarding here.</Text>
    </Screen>
  );
}
