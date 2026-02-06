import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

const APP_BACKGROUND = '#0b0f1a';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const activeTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
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
      <ThemeProvider
        value={{
          ...activeTheme,
          colors: {
            ...activeTheme.colors,
            background: APP_BACKGROUND,
            card: APP_BACKGROUND,
          },
        }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: APP_BACKGROUND },
            statusBarStyle: 'light',
            statusBarColor: APP_BACKGROUND,
            navigationBarColor: APP_BACKGROUND,
            freezeOnBlur: true,
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="session/create" />
          <Stack.Screen name="session/run" />
          <Stack.Screen name="session/complete" />
        </Stack>
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
