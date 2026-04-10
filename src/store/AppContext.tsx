import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, FastSession, WeightEntry, WaterEntry, AppSettings, FastingProtocolId } from '../types';
import { loadState, saveState } from '../utils/storage';
import { getProtocol } from '../utils/protocols';

type Action =
  | { type: 'START_FAST'; payload: { protocolId: FastingProtocolId; targetHours: number } }
  | { type: 'END_FAST'; payload?: { note?: string } }
  | { type: 'CANCEL_FAST' }
  | { type: 'ADD_WEIGHT'; payload: Omit<WeightEntry, 'id'> }
  | { type: 'DELETE_WEIGHT'; payload: string }
  | { type: 'ADD_WATER'; payload: { amount: number } }
  | { type: 'RESET_WATER' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'DELETE_FAST'; payload: string }
  | { type: 'UPDATE_FAST_NOTE'; payload: { id: string; note: string } }
  | { type: 'UPDATE_CURRENT_START'; payload: number }
  | { type: 'UPDATE_CURRENT_TARGET'; payload: number };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_FAST': {
      const protocol = getProtocol(action.payload.protocolId);
      const newFast: FastSession = {
        id: crypto.randomUUID(),
        startTime: Date.now(),
        endTime: null,
        targetHours: action.payload.targetHours || protocol.fastHours,
        protocolId: action.payload.protocolId,
        completed: false,
      };
      return { ...state, currentFast: newFast };
    }
    case 'END_FAST': {
      if (!state.currentFast) return state;
      const endTime = Date.now();
      const elapsed = endTime - state.currentFast.startTime;
      const targetMs = state.currentFast.targetHours * 3600000;
      const completed = elapsed >= targetMs;
      const ended: FastSession = {
        ...state.currentFast,
        endTime,
        completed,
        note: action.payload?.note,
      };
      return {
        ...state,
        currentFast: null,
        fastHistory: [ended, ...state.fastHistory],
      };
    }
    case 'CANCEL_FAST':
      return { ...state, currentFast: null };
    case 'ADD_WEIGHT': {
      const entry: WeightEntry = { ...action.payload, id: crypto.randomUUID() };
      return { ...state, weightLog: [entry, ...state.weightLog] };
    }
    case 'DELETE_WEIGHT':
      return { ...state, weightLog: state.weightLog.filter((w) => w.id !== action.payload) };
    case 'ADD_WATER': {
      const entry: WaterEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        amount: action.payload.amount,
      };
      return { ...state, waterLog: [entry, ...state.waterLog] };
    }
    case 'RESET_WATER': {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return {
        ...state,
        waterLog: state.waterLog.filter((w) => w.timestamp < today.getTime()),
      };
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'DELETE_FAST':
      return { ...state, fastHistory: state.fastHistory.filter((f) => f.id !== action.payload) };
    case 'UPDATE_FAST_NOTE':
      return {
        ...state,
        fastHistory: state.fastHistory.map((f) =>
          f.id === action.payload.id ? { ...f, note: action.payload.note } : f,
        ),
      };
    case 'UPDATE_CURRENT_START':
      if (!state.currentFast) return state;
      return { ...state, currentFast: { ...state.currentFast, startTime: action.payload } };
    case 'UPDATE_CURRENT_TARGET':
      if (!state.currentFast) return state;
      return { ...state, currentFast: { ...state.currentFast, targetHours: action.payload } };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  startFast: (protocolId: FastingProtocolId, targetHours?: number) => void;
  endFast: (note?: string) => void;
  cancelFast: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Apply theme
  useEffect(() => {
    const { theme } = state.settings;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [state.settings.theme]);

  const startFast = useCallback((protocolId: FastingProtocolId, targetHours?: number) => {
    const protocol = getProtocol(protocolId);
    dispatch({ type: 'START_FAST', payload: { protocolId, targetHours: targetHours ?? protocol.fastHours } });
  }, []);

  const endFast = useCallback((note?: string) => {
    dispatch({ type: 'END_FAST', payload: { note } });
  }, []);

  const cancelFast = useCallback(() => {
    dispatch({ type: 'CANCEL_FAST' });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, startFast, endFast, cancelFast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
