import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export const unstable_settings = { anchor: 'index' };

export default function LearnLayout() {
  const { c } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />;
}
