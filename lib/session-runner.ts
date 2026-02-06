import { SessionTemplate, SessionStatus } from '@/types/workout';

export type RunningStatus = 'exercise' | 'cooldown';

export type RuntimeSessionState = {
  status: SessionStatus;
  currentExerciseIndex: number;
  currentSetIndex: number;
  remainingSeconds: number;
  phaseStartedAt: number | null;
  startedAt: number | null;
  pausedAt: number | null;
  pausedPhase: RunningStatus | null;
};

export type AdvanceRuntimeResult = {
  nextState: RuntimeSessionState;
  completed: boolean;
};

const MAX_TRANSITIONS_PER_TICK = 512;

export function isRunningStatus(status: SessionStatus): status is RunningStatus {
  return status === 'exercise' || status === 'cooldown';
}

export function getCurrentRemainingSeconds(runtime: RuntimeSessionState, now: number): number {
  if (!isRunningStatus(runtime.status) || runtime.phaseStartedAt === null) {
    return Math.max(0, runtime.remainingSeconds);
  }

  const elapsedSeconds = Math.floor(Math.max(0, now - runtime.phaseStartedAt) / 1000);
  return Math.max(0, runtime.remainingSeconds - elapsedSeconds);
}

function moveToNextExercise(
  state: RuntimeSessionState,
  template: SessionTemplate,
  phaseStartAt: number
): RuntimeSessionState | null {
  const nextExerciseIndex = state.currentExerciseIndex + 1;
  if (nextExerciseIndex < template.exercises.length) {
    const nextExercise = template.exercises[nextExerciseIndex];
    return {
      ...state,
      status: 'exercise',
      currentExerciseIndex: nextExerciseIndex,
      remainingSeconds: nextExercise.durationSeconds,
      phaseStartedAt: phaseStartAt,
      pausedAt: null,
      pausedPhase: null,
    };
  }

  const nextSetIndex = state.currentSetIndex + 1;
  if (nextSetIndex < template.setsCount) {
    const firstExercise = template.exercises[0];
    return {
      ...state,
      status: 'exercise',
      currentSetIndex: nextSetIndex,
      currentExerciseIndex: 0,
      remainingSeconds: firstExercise.durationSeconds,
      phaseStartedAt: phaseStartAt,
      pausedAt: null,
      pausedPhase: null,
    };
  }

  return null;
}

function transitionAtBoundary(
  state: RuntimeSessionState,
  template: SessionTemplate,
  boundaryTime: number
): RuntimeSessionState | null {
  if (state.status === 'exercise' && template.cooldownSeconds > 0) {
    return {
      ...state,
      status: 'cooldown',
      remainingSeconds: template.cooldownSeconds,
      phaseStartedAt: boundaryTime,
      pausedAt: null,
      pausedPhase: null,
    };
  }

  return moveToNextExercise(state, template, boundaryTime);
}

export function advanceRuntimeToNow(
  runtime: RuntimeSessionState,
  template: SessionTemplate,
  now: number
): AdvanceRuntimeResult {
  if (!isRunningStatus(runtime.status) || runtime.phaseStartedAt === null) {
    return { nextState: runtime, completed: false };
  }

  let nextState = runtime;

  for (let transitions = 0; transitions < MAX_TRANSITIONS_PER_TICK; transitions += 1) {
    if (!isRunningStatus(nextState.status) || nextState.phaseStartedAt === null) {
      return { nextState, completed: false };
    }

    const elapsedSeconds = Math.floor(Math.max(0, now - nextState.phaseStartedAt) / 1000);
    if (elapsedSeconds < nextState.remainingSeconds) {
      return { nextState, completed: false };
    }

    const boundaryTime = nextState.phaseStartedAt + nextState.remainingSeconds * 1000;
    const transitioned = transitionAtBoundary(nextState, template, boundaryTime);
    if (!transitioned) {
      return { nextState, completed: true };
    }

    nextState = transitioned;
  }

  return { nextState, completed: true };
}
