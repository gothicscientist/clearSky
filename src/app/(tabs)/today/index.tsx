import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

/** Placeholder — owned by stream D. */
export default function TodayHome() {
  return (
    <Screen testID="today.home" title="Today" tabRoot>
      <Text tone="secondary">Stream D builds this tab.</Text>
    </Screen>
  );
}
