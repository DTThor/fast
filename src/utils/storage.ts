import type { AppState, AppSettings } from '../types';

const STORAGE_KEY = 'fasting-tracker-v1';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  defaultProtocol: '16:8',
  weightUnit: 'lbs',
  dailyWaterGoal: 2500,
  notificationsEnabled: false,
  reminderInterval: 60,
  customFastHours: 16,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    return { ...getDefaultState(), ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full — silently fail
  }
}

function getDefaultState(): AppState {
  return {
    currentFast: null,
    fastHistory: [],
    weightLog: [],
    waterLog: [],
    settings: DEFAULT_SETTINGS,
  };
}

export { DEFAULT_SETTINGS };
