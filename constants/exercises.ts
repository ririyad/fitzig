import { ExerciseType } from '@/types/workout';

export const EXERCISES: ExerciseType[] = [
  { id: 'push_up', name: 'Push Up', iconName: 'arrow-down-circle-outline' },
  { id: 'pull_up', name: 'Pull Up', iconName: 'arrow-up-circle-outline' },
  { id: 'squat', name: 'Squat', iconName: 'fitness-outline' },
  { id: 'lunge', name: 'Lunge', iconName: 'walk-outline' },
  { id: 'plank', name: 'Plank', iconName: 'remove-outline' },
  { id: 'burpee', name: 'Burpee', iconName: 'flash-outline' },
  { id: 'mountain_climber', name: 'Mountain Climber', iconName: 'trending-up-outline' },
  { id: 'jumping_jack', name: 'Jumping Jack', iconName: 'sync-outline' },
  { id: 'glute_bridge', name: 'Glute Bridge', iconName: 'barbell-outline' },
  { id: 'sit_up', name: 'Sit Up', iconName: 'chevron-up-circle-outline' },
];

const EXERCISE_META_BY_ID: Record<string, ExerciseType> = EXERCISES.reduce<Record<string, ExerciseType>>(
  (accumulator, exercise) => {
    accumulator[exercise.id] = exercise;
    return accumulator;
  },
  {}
);

const FALLBACK_ICON_NAME = 'barbell-outline';

export function getExerciseMeta(exerciseId: string): ExerciseType {
  const resolved = EXERCISE_META_BY_ID[exerciseId];
  if (resolved) {
    return resolved;
  }

  return {
    id: exerciseId,
    name: exerciseId,
    iconName: FALLBACK_ICON_NAME,
  };
}
