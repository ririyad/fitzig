export type ExerciseType = {
  id: string;
  name: string;
  iconName: string;
};

export type SessionExercise = {
  exerciseId: string;
  durationSeconds: number;
  order: number;
};

export type SessionTemplate = {
  id: string;
  name: string;
  setsCount: number;
  cooldownSeconds: number;
  exercises: SessionExercise[];
  createdAt: number;
};

export type SetResult = {
  exerciseId: string;
  setIndex: number;
  count: number | null;
  durationSeconds: number;
};

export type SessionRun = {
  id: string;
  templateId: string;
  templateName: string;
  startedAt: number;
  completedAt: number;
  results: SetResult[];
};

export type SessionStatus = 'idle' | 'exercise' | 'cooldown' | 'paused';

export type ActiveSessionSnapshot = {
  templateId: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  status: SessionStatus;
  remainingSeconds: number;
  phaseStartedAt: number | null;
  pausedAt: number | null;
  startedAt: number | null;
  updatedAt: number;
  pausedPhase?: 'exercise' | 'cooldown' | null;
  countdownRemaining?: number;
  countdownTargetStatus?: 'exercise' | 'cooldown' | null;
};

export type AppSettings = {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  countdownEnabled: boolean;
  countdownSeconds: number;
};

export type StreakCache = {
  longestStreak: number;
  longestStreakDate: number; // timestamp when longest streak was achieved
  lastCalculatedAt: number; // timestamp of last calculation
};
