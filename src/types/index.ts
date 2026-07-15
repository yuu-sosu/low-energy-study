export type Phase = 'work' | 'shortBreak' | 'longBreak';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // 分
  completedAt: string; // ISO8601
}

export interface Settings {
  notificationEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PomodoroState {
  phase: Phase;
  status: TimerStatus;
  secondsLeft: number;
  completedCount: number;
}

export type HPLevel = 'low' | 'normal' | 'high';

export type FocusMode = 'study' | 'work' | 'reading' | 'other';

export type SessionResult = 'done' | 'partial' | 'failed';

export interface FocusDraft {
  mode: FocusMode;
  hpLevel: HPLevel;
  taskTitle: string;
  plannedDurationSeconds: number;
}

export interface FocusSession extends FocusDraft {
  id: string;
  createdAt: string;
  actualDurationSeconds: number;
  result: SessionResult;
  note: string;
}
