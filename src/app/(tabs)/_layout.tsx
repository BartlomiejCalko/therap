import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { useT } from '@/i18n';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';

export default function TabsLayout() {
  const { c } = useTheme();
  const t = useT();
  const { settings } = useStore().data;

  if (!settings.onboardedAt) return <Redirect href="/welcome" />;

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="index" options={{ title: t.tabs.today }} />
      <Tabs.Screen name="capture" options={{ title: t.tabs.capture }} />
      <Tabs.Screen name="unload" options={{ title: t.tabs.unload }} />
      <Tabs.Screen name="breath" options={{ title: t.tabs.breath }} />
      <Tabs.Screen name="calendar" options={{ title: t.tabs.calendar }} />
    </Tabs>
  );
}
