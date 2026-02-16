import { StyleSheet, View, ViewProps } from 'react-native';
import { UI } from '@/constants/ui';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'surface' | 'strong';
}

export function Card({ style, variant = 'surface', ...props }: CardProps) {
  const backgroundColor = 
    variant === 'elevated' ? UI.bgElevated : 
    variant === 'strong' ? UI.cardStrong : 
    UI.card;

  return (
    <View 
      style={[
        styles.card, 
        { backgroundColor }, 
        variant === 'elevated' && styles.elevated,
        style
      ]} 
      {...props} 
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 16,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
