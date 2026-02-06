import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UI } from '@/constants/ui';

const TAB_BACKGROUND = UI.tabFallback;
const TAB_BASE_HEIGHT = 56;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: UI.bgFallback },
        tabBarActiveTintColor: UI.accent,
        tabBarInactiveTintColor: UI.textMuted,
        tabBarStyle: {
          backgroundColor: TAB_BACKGROUND,
          borderTopColor: UI.border,
          borderTopWidth: 1,
          height: TAB_BASE_HEIGHT + bottomInset + 8,
          paddingTop: 8,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Manrope_600SemiBold',
          letterSpacing: 0.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
