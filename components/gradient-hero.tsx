import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppGradientVariant, getGradientSpec } from '@/constants/gradients';
import { UI } from '@/constants/ui';

type GradientHeroProps = {
  variant?: AppGradientVariant;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function GradientHero({ variant = 'default', style, children }: GradientHeroProps) {
  const spec = getGradientSpec(variant);

  return (
    <View style={[styles.hero, style]}>
      <View pointerEvents="none" style={[styles.absoluteFill, { backgroundColor: UI.heroFallback }]} />
      <LinearGradient
        pointerEvents="none"
        colors={spec.heroColors}
        start={spec.heroStart}
        end={spec.heroEnd}
        style={styles.absoluteFill}
      />
      {spec.heroOverlayOpacity ? (
        <View
          pointerEvents="none"
          style={[styles.absoluteFill, { opacity: spec.heroOverlayOpacity, backgroundColor: '#ffffff' }]}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.heroFallback,
    overflow: 'hidden',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
});
