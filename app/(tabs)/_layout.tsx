import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { UI } from '@/constants/ui';

const TAB_BACKGROUND = UI.tabFallback;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarActiveTintColor: UI.accent,
        tabBarInactiveTintColor: UI.textMuted,
        tabBarStyle: {
          backgroundColor: TAB_BACKGROUND,
          borderTopColor: UI.border,
          borderTopWidth: 1,
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
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
