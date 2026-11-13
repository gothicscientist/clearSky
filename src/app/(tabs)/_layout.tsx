import { Tabs } from 'expo-router/js-tabs';

import { useTheme } from '@/theme';
import { TabBar } from '@/ui/TabBar';

export const unstable_settings = { anchor: 'today' };

export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg }, animation: 'fade' }}>
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="calm" options={{ title: 'Calm' }} />
      <Tabs.Screen name="fly" options={{ title: 'Fly' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
    </Tabs>
  );
}
