// タイマー時間（秒）
export const WORK_DURATION = 25 * 60;
export const SHORT_BREAK_DURATION = 5 * 60;
export const LONG_BREAK_DURATION = 15 * 60;

// 長い休憩に入るまでのポモドーロ数
export const POMODOROS_UNTIL_LONG_BREAK = 4;

// カラー
export const COLORS = {
  background: '#F7F3EA',
  surface: '#FFFDF8',
  surfaceMuted: '#EEE8D8',
  primary: '#2F6F5E',
  primaryLight: '#A9D4C5',
  accent: '#D86F45',
  shortBreak: '#5B8C7A',
  longBreak: '#6E6A9E',
  text: '#20231F',
  textSecondary: '#686D63',
  border: '#DDD5C5',
  danger: '#B84C4C',
  white: '#FFFFFF',
} as const;

// スペーシング
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
} as const;

// フォントサイズ
export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 24,
  xl: 32,
  timer: 68,
} as const;

export const HP_OPTIONS = [
  { value: 'low', label: '低い', recommendedSeconds: 5 * 60 },
  { value: 'normal', label: '普通', recommendedSeconds: 25 * 60 },
  { value: 'high', label: 'いける', recommendedSeconds: 50 * 60 },
] as const;

export const FOCUS_MODES = [
  { value: 'study', label: '勉強', defaultTaskTitle: '勉強を少し進める' },
  { value: 'work', label: '仕事', defaultTaskTitle: '仕事を少し進める' },
  { value: 'reading', label: '読書', defaultTaskTitle: '本を少し読む' },
  { value: 'other', label: 'その他', defaultTaskTitle: '少し進める' },
] as const;

export const DURATION_OPTIONS = [
  { seconds: 5 * 60, label: '5分' },
  { seconds: 25 * 60, label: '25分' },
  { seconds: 50 * 60, label: '50分' },
] as const;

export const RESULT_OPTIONS = [
  { value: 'done', label: '完了' },
  { value: 'partial', label: '途中まで' },
  { value: 'failed', label: '無理だった' },
] as const;

export const NEXT_STEP_SUGGESTIONS = {
  study: ['5分だけ教科書を読む', '目次だけ確認する', '1問だけ解く', '前回のメモを見返す', 'わからない言葉を1つ調べる', '今日やらない範囲を決める'],
  work: ['一番軽いタスクだけ片付ける', 'メールを1件だけ確認する', '作業ファイルを開く', '次にやることを1行で書く', '15分だけ進める'],
  reading: ['5ページだけ読む', '目次を眺める', '気になる章だけ読む', '1段落だけ読む', '読んだ内容を1行でメモする'],
  other: ['5分だけ進める', '準備だけする', '一番軽いところだけ触る', '次の一手を1行で書く', 'やらない範囲を決める'],
} as const;
