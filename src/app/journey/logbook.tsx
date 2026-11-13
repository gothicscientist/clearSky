import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

/** Placeholder — owned by stream F. */
export default function LogbookPlaceholder() {
  return (
    <Screen testID="journey.logbook" title="Logbook" back>
      <Text tone="secondary">Stream F builds the logbook here.</Text>
    </Screen>
  );
}
