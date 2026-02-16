import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { UI } from '@/constants/ui';

const APP_BACKGROUND = UI.bgFallback;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const activeTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...activeTheme,
    dark: true,
    colors: {
      ...activeTheme.colors,
      primary: UI.accent,
      text: UI.text,
      border: UI.border,
      notification: UI.accentStrong,
      background: APP_BACKGROUND,
      card: APP_BACKGROUND,
    },
  };
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <View style={styles.appBackground} />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider value={navigationTheme}>
        <View style={styles.appBackground}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: APP_BACKGROUND },
              statusBarStyle: 'light',
              navigationBarColor: APP_BACKGROUND,
              freezeOnBlur: false,
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="session/create" />
            <Stack.Screen name="session/run" />
            <Stack.Screen name="session/complete" />
          </Stack>
        </View>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appBackground: {
    flex: 1,
    backgroundColor: APP_BACKGROUND,
  },
});
