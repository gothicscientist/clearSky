import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

/** Placeholder — owned by stream B (replaced by the SOS sequence). */
export default function SOSPlaceholder() {
  return (
    <Screen testID="sos.screen" close title="I’m here.">
      <Text tone="secondary">Breathe out slowly with me.</Text>
    </Screen>
  );
}
