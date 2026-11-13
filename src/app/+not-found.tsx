import { router } from 'expo-router';

import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

export default function NotFound() {
  return (
    <Screen testID="app.not-found" title="Off the map" back>
      <Text tone="secondary">That screen doesn’t exist. Let’s get you back on course.</Text>
      <Button
        label="Go to clearSky"
        testID="app.not-found.home"
        onPress={() => router.replace('/')}
        style={{ marginTop: 24 }}
      />
    </Screen>
  );
}
