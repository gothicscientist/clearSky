import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

/** Placeholder — owned by stream A (terms, privacy, licences; readable before purchase). */
export default function LegalDoc() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  return (
    <Screen testID="legal.doc" title={doc === 'privacy' ? 'Privacy' : 'Terms of Use'} close>
      <Text tone="secondary">Stream A writes the legal documents.</Text>
    </Screen>
  );
}
