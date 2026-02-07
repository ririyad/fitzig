import { Ionicons } from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';

import { getExerciseMeta } from '@/constants/exercises';
import { UI } from '@/constants/ui';

type ExerciseIconProps = {
  exerciseId: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

const FALLBACK_ICON = 'barbell-outline';

export function ExerciseIcon({
  exerciseId,
  size = 16,
  color = UI.textMuted,
  style,
}: ExerciseIconProps) {
  const meta = getExerciseMeta(exerciseId);
  const iconName =
    meta.iconName in Ionicons.glyphMap ? meta.iconName : FALLBACK_ICON;

  return (
    <Ionicons
      name={iconName as keyof typeof Ionicons.glyphMap}
      size={size}
      color={color}
      style={style}
    />
  );
}
