import AsyncStorage from '@react-native-async-storage/async-storage';
import { FOCUS_MODES } from '../constants';
import { FocusMode, FocusSession, Session } from '../types';

const SESSIONS_KEY = 'sessions';

export type StatsPeriod = 'today' | 'week' | 'month' | 'all';

type StoredSession = Session | FocusSession;

function isFocusSession(session: StoredSession): session is FocusSession {
  return 'createdAt' in session && 'mode' in session && 'actualDurationSeconds' in session;
}

function normalizeFocusMode(mode: string): FocusMode {
  return FOCUS_MODES.some((item) => item.value === mode) ? (mode as FocusMode) : 'other';
}

export async function loadSessions(): Promise<FocusSession[]> {
  const json = await AsyncStorage.getItem(SESSIONS_KEY);
  if (!json) return [];
  const sessions = JSON.parse(json) as StoredSession[];
  return sessions.map((session) => {
    if (isFocusSession(session)) {
      return {
        ...session,
        mode: normalizeFocusMode(session.mode),
      };
    }
    return {
      id: session.id,
      createdAt: session.completedAt,
      mode: 'study',
      hpLevel: 'normal',
      taskTitle: 'ポモドーロ',
      plannedDurationSeconds: session.duration * 60,
      actualDurationSeconds: session.duration * 60,
      result: 'done',
      note: '',
    };
  });
}

export async function saveSession(session: FocusSession): Promise<void> {
  const sessions = await loadSessions();
  sessions.push(session);
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getLocalDateString(isoDate: string): string {
  const date = new Date(isoDate);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getModeLabel(mode: FocusSession['mode']): string {
  return FOCUS_MODES.find((item) => item.value === mode)?.label ?? mode;
}

export function getTodaySessions(sessions: FocusSession[]) {
  const today = getTodayString();
  return sessions.filter((session) => getLocalDateString(session.createdAt) === today);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getWeekStart(date: Date): Date {
  const start = startOfLocalDay(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

function isInPeriod(session: FocusSession, period: StatsPeriod, now = new Date()): boolean {
  if (period === 'all') return true;
  const createdAt = new Date(session.createdAt);
  const sessionDay = startOfLocalDay(createdAt).getTime();

  if (period === 'today') {
    return sessionDay === startOfLocalDay(now).getTime();
  }

  if (period === 'week') {
    const weekStart = getWeekStart(now).getTime();
    const nextWeekStart = new Date(getWeekStart(now));
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    return sessionDay >= weekStart && sessionDay < nextWeekStart.getTime();
  }

  return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
}

export function getSessionsForPeriod(sessions: FocusSession[], period: StatsPeriod) {
  return sessions
    .filter((session) => isInPeriod(session, period))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function calcStats(sessions: FocusSession[], period: StatsPeriod = 'today') {
  const periodSessions = getSessionsForPeriod(sessions, period);
  const totalSeconds = periodSessions.reduce((sum, session) => sum + session.actualDurationSeconds, 0);
  const byMode = FOCUS_MODES.map((mode) => ({
    mode: mode.value,
    label: mode.label,
    seconds: periodSessions
      .filter((session) => session.mode === mode.value)
      .reduce((sum, session) => sum + session.actualDurationSeconds, 0),
  })).filter((item) => item.seconds > 0);

  return {
    period,
    periodSessions,
    todaySessions: period === 'today' ? periodSessions : getTodaySessions(sessions),
    totalSeconds,
    byMode,
    totalCount: periodSessions.length,
    doneCount: periodSessions.filter((session) => session.result === 'done').length,
    partialCount: periodSessions.filter((session) => session.result === 'partial').length,
    failedCount: periodSessions.filter((session) => session.result === 'failed').length,
  };
}
