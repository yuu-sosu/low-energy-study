import { FOCUS_MODES, HP_OPTIONS, RESULT_OPTIONS } from '../constants';
import type { StatsPeriod } from '../storage/sessionStorage';
import { FocusMode, HPLevel, SessionResult } from '../types';

export const MAX_TASK_LENGTH = 50;
export const MAX_NOTE_LENGTH = 100;

export function formatClock(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const rest = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
}

export function formatMinutes(seconds: number): string {
  const minutes = seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0;
  if (minutes < 60) return `${minutes}分`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}時間` : `${hours}時間${rest}分`;
}

export function getDefaultTaskTitle(mode: FocusMode): string {
  return FOCUS_MODES.find((item) => item.value === mode)?.defaultTaskTitle ?? '少し進める';
}

export function getHpLabel(hpLevel: HPLevel): string {
  return HP_OPTIONS.find((item) => item.value === hpLevel)?.label ?? hpLevel;
}

export function getResultLabel(result: SessionResult): string {
  return RESULT_OPTIONS.find((item) => item.value === result)?.label ?? result;
}

export function todayLabel(): string {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date());
}

export function periodLabel(period: StatsPeriod): string {
  if (period === 'today') return '今日';
  if (period === 'week') return '今週';
  if (period === 'month') return '今月';
  return '累計';
}

export function periodRangeLabel(period: StatsPeriod): string {
  const now = new Date();
  if (period === 'today') return todayLabel();
  if (period === 'all') return 'これまで全部';

  const formatter = new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric' });

  if (period === 'week') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = start.getDay();
    start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }

  return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long' }).format(now);
}

export function sessionDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(isoDate));
}
