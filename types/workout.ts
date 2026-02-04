export type ExerciseType = {
  id: string;
  name: string;
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
