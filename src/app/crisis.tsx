import { CRISIS_RESOURCES } from '@/content/safety';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

/** Placeholder — owned by stream A (full crisis & medical guidance screen). */
export default function CrisisPlaceholder() {
  return (
    <Screen testID="crisis.screen" title="Getting help" close>
      {CRISIS_RESOURCES.map((r) => (
        <Text key={r.id} tone="secondary">
          {r.label}
        </Text>
      ))}
    </Screen>
  );
}
