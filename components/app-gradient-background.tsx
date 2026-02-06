import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppGradientVariant, getGradientSpec } from '@/constants/gradients';
import { UI } from '@/constants/ui';

type AppGradientBackgroundProps = {
  variant?: AppGradientVariant;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function AppGradientBackground({
  variant = 'default',
  style,
  children,
}: AppGradientBackgroundProps) {
  const spec = getGradientSpec(variant);

  return (
    <View style={[styles.container, style]}>
      <View pointerEvents="none" style={[styles.absoluteFill, { backgroundColor: UI.bgFallback }]} />
      <LinearGradient
        pointerEvents="none"
        colors={spec.backgroundColors}
        start={spec.backgroundStart}
        end={spec.backgroundEnd}
        style={styles.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
});
