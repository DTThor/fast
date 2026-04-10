export type FastingProtocolId =
  | '16:8'
  | '18:6'
  | '20:4'
  | 'OMAD'
  | '5:2'
  | '4:3'
  | '36h'
  | '48h'
  | 'custom';

export interface FastingProtocol {
  id: FastingProtocolId;
  name: string;
  fastHours: number;
  eatHours: number;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface HealthStage {
  hour: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface FastSession {
  id: string;
  startTime: number; // unix ms
  endTime: number | null; // null if ongoing
  targetHours: number;
  protocolId: FastingProtocolId;
  note?: string;
  completed: boolean; // reached target
}

export interface WeightEntry {
  id: string;
  date: number; // unix ms
  weight: number;
  unit: 'kg' | 'lbs';
  note?: string;
}

export interface WaterEntry {
  id: string;
  timestamp: number;
  amount: number; // ml
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultProtocol: FastingProtocolId;
  weightUnit: 'kg' | 'lbs';
  dailyWaterGoal: number; // ml
  notificationsEnabled: boolean;
  reminderInterval: number; // minutes
  customFastHours: number;
}

export interface AppState {
  currentFast: FastSession | null;
  fastHistory: FastSession[];
  weightLog: WeightEntry[];
  waterLog: WaterEntry[];
  settings: AppSettings;
}
