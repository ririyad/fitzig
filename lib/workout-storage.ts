import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ActiveSessionSnapshot,
  AppSettings,
  SessionRun,
  SessionStatus,
  SessionTemplate,
  StreakCache,
} from '@/types/workout';

const STORAGE_KEY = 'fitzig:v1';
const ACTIVE_SESSION_KEY = 'fitzig:active-session:v1';
const SETTINGS_KEY = 'fitzig:settings:v1';
const STREAK_CACHE_KEY = 'fitzig:streak-cache:v1';

type StorageState = {
  templates: SessionTemplate[];
  runs: SessionRun[];
};

const emptyState: StorageState = {
  templates: [],
  runs: [],
};

const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  soundEnabled: false,
  countdownEnabled: true,
  countdownSeconds: 3,
};

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function loadState(): Promise<StorageState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as StorageState;
    return {
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
      runs: Array.isArray(parsed.runs) ? parsed.runs : [],
    };
  } catch {
    return emptyState;
  }
}

async function saveState(state: StorageState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeSettings(input: unknown): AppSettings {
  if (!input || typeof input !== 'object') return DEFAULT_SETTINGS;
  const candidate = input as Partial<AppSettings>;

  const countdownSeconds =
    typeof candidate.countdownSeconds === 'number' && Number.isFinite(candidate.countdownSeconds)
      ? Math.max(1, Math.min(10, Math.round(candidate.countdownSeconds)))
      : DEFAULT_SETTINGS.countdownSeconds;

  return {
    hapticsEnabled:
      typeof candidate.hapticsEnabled === 'boolean'
        ? candidate.hapticsEnabled
        : DEFAULT_SETTINGS.hapticsEnabled,
    soundEnabled:
      typeof candidate.soundEnabled === 'boolean' ? candidate.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
    countdownEnabled:
      typeof candidate.countdownEnabled === 'boolean'
        ? candidate.countdownEnabled
        : DEFAULT_SETTINGS.countdownEnabled,
    countdownSeconds,
  };
}

function normalizeSessionStatus(input: unknown): SessionStatus | null {
  if (input === 'idle' || input === 'exercise' || input === 'cooldown' || input === 'paused') {
    return input;
  }
  return null;
}

function normalizeActiveSnapshot(input: unknown): ActiveSessionSnapshot | null {
  if (!input || typeof input !== 'object') return null;
  const candidate = input as Partial<ActiveSessionSnapshot>;

  const status = normalizeSessionStatus(candidate.status);
  if (!status) return null;
  if (typeof candidate.templateId !== 'string' || candidate.templateId.length === 0) return null;
  if (
    typeof candidate.currentExerciseIndex !== 'number' ||
    !Number.isFinite(candidate.currentExerciseIndex)
  ) {
    return null;
  }
  if (typeof candidate.currentSetIndex !== 'number' || !Number.isFinite(candidate.currentSetIndex)) {
    return null;
  }
  if (typeof candidate.remainingSeconds !== 'number' || !Number.isFinite(candidate.remainingSeconds)) {
    return null;
  }
  if (typeof candidate.updatedAt !== 'number' || !Number.isFinite(candidate.updatedAt)) {
    return null;
  }

  return {
    templateId: candidate.templateId,
    currentExerciseIndex: Math.max(0, Math.floor(candidate.currentExerciseIndex)),
    currentSetIndex: Math.max(0, Math.floor(candidate.currentSetIndex)),
    status,
    remainingSeconds: Math.max(0, Math.floor(candidate.remainingSeconds)),
    phaseStartedAt:
      typeof candidate.phaseStartedAt === 'number' && Number.isFinite(candidate.phaseStartedAt)
        ? candidate.phaseStartedAt
        : null,
    pausedAt:
      typeof candidate.pausedAt === 'number' && Number.isFinite(candidate.pausedAt)
        ? candidate.pausedAt
        : null,
    startedAt:
      typeof candidate.startedAt === 'number' && Number.isFinite(candidate.startedAt)
        ? candidate.startedAt
        : null,
    updatedAt: candidate.updatedAt,
    pausedPhase:
      candidate.pausedPhase === 'exercise' || candidate.pausedPhase === 'cooldown'
        ? candidate.pausedPhase
        : null,
    countdownRemaining:
      typeof candidate.countdownRemaining === 'number' && Number.isFinite(candidate.countdownRemaining)
        ? Math.max(0, Math.floor(candidate.countdownRemaining))
        : undefined,
    countdownTargetStatus:
      candidate.countdownTargetStatus === 'exercise' || candidate.countdownTargetStatus === 'cooldown'
        ? candidate.countdownTargetStatus
        : null,
  };
}

export function newTemplateId() {
  return createId('template');
}

export function newRunId() {
  return createId('run');
}

export async function listSessionTemplates(): Promise<SessionTemplate[]> {
  const state = await loadState();
  return state.templates.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSessionTemplateById(id: string): Promise<SessionTemplate | undefined> {
  const state = await loadState();
  return state.templates.find((template) => template.id === id);
}

export async function saveSessionTemplate(template: SessionTemplate): Promise<void> {
  const state = await loadState();
  const nextTemplates = state.templates.filter((t) => t.id !== template.id);
  nextTemplates.push(template);
  await saveState({ ...state, templates: nextTemplates });
}

export async function listSessionRuns(): Promise<SessionRun[]> {
  const state = await loadState();
  return state.runs.slice().sort((a, b) => b.completedAt - a.completedAt);
}

export async function saveSessionRun(run: SessionRun): Promise<void> {
  const state = await loadState();
  const nextRuns = state.runs.filter((r) => r.id !== run.id);
  nextRuns.push(run);
  await saveState({ ...state, runs: nextRuns });
}

export async function getActiveSessionSnapshot(): Promise<ActiveSessionSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeActiveSnapshot(parsed);
  } catch {
    return null;
  }
}

export async function saveActiveSessionSnapshot(snapshot: ActiveSessionSnapshot): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(snapshot));
}

export async function clearActiveSessionSnapshot(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
}

export async function clearAllAppData(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY, ACTIVE_SESSION_KEY, SETTINGS_KEY, STREAK_CACHE_KEY]);
}

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return normalizeSettings(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  const normalized = normalizeSettings(settings);
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
}

export async function getStreakCache(): Promise<StreakCache | null> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.longestStreak === 'number' &&
      typeof parsed.longestStreakDate === 'number' &&
      typeof parsed.lastCalculatedAt === 'number'
    ) {
      return parsed as StreakCache;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveStreakCache(cache: StreakCache): Promise<void> {
  await AsyncStorage.setItem(STREAK_CACHE_KEY, JSON.stringify(cache));
}

export async function updateLongestStreak(currentStreak: number): Promise<number> {
  const cache = await getStreakCache();
  const longestStreak = cache?.longestStreak ?? 0;

  if (currentStreak > longestStreak) {
    await saveStreakCache({
      longestStreak: currentStreak,
      longestStreakDate: Date.now(),
      lastCalculatedAt: Date.now(),
    });
    return currentStreak;
  }

  return longestStreak;
}
