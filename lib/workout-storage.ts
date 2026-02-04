import AsyncStorage from '@react-native-async-storage/async-storage';

import { SessionRun, SessionTemplate } from '@/types/workout';

const STORAGE_KEY = 'fitzig:v1';

type StorageState = {
  templates: SessionTemplate[];
  runs: SessionRun[];
};

const emptyState: StorageState = {
  templates: [],
  runs: [],
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
