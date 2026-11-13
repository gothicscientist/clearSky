import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

/** Placeholder — owned by stream C. */
export default function FlyHome() {
  return (
    <Screen testID="fly.home" title="Fly" tabRoot>
      <Text tone="secondary">Stream C builds this tab.</Text>
    </Screen>
  );
}
