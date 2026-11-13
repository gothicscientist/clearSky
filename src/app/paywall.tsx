import { useState } from 'react';

import { purchases } from '@/lib/purchases';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

/** Placeholder — owned by stream A (replaced by the real paywall with every state). */
export default function PaywallPlaceholder() {
  const [busy, setBusy] = useState(false);
  return (
    <Screen
      testID="paywall.screen"
      title="Unlock your plan"
      back
      footer={
        <Button
          label="Continue"
          testID="paywall.cta"
          loading={busy}
          onPress={async () => {
            setBusy(true);
            await purchases.purchase('yearly');
            setBusy(false);
          }}
        />
      }>
      <Text tone="secondary">Stream A builds the paywall here.</Text>
    </Screen>
  );
}
