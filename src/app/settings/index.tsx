import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

/** Placeholder — owned by stream A. */
export default function SettingsPlaceholder() {
  return (
    <Screen testID="settings.home" title="Settings" close>
      <Text tone="secondary">Stream A builds settings here.</Text>
    </Screen>
  );
}
