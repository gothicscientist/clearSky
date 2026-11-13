import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

/** Placeholder — owned by stream B. */
export default function CalmHome() {
  return (
    <Screen testID="calm.home" title="Calm" tabRoot>
      <Text tone="secondary">Stream B builds this tab.</Text>
    </Screen>
  );
}
