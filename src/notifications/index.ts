import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Phase } from '../types';

// フォアグラウンドでも通知バナーを表示する
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

const PHASE_MESSAGE: Record<Phase, { title: string; body: string }> = {
  work: { title: '作業終了！', body: 'お疲れさまでした。休憩しましょう。' },
  shortBreak: { title: '休憩終了！', body: '次のポモドーロを始めましょう。' },
  longBreak: { title: '長い休憩終了！', body: '集中タイムを再開しましょう。' },
};

// 終了したフェーズを渡す（終わったのが作業 → 「作業終了」メッセージ）
export async function sendTimerEndNotification(completedPhase: Phase): Promise<void> {
  if (Platform.OS === 'web') return;
  const { title, body } = PHASE_MESSAGE[completedPhase];
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // 即時送信
  });
}

export async function sendFocusEndNotification(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '一手おしまい',
      body: 'お疲れさまでした。できた分だけ記録しましょう。',
    },
    trigger: null,
  });
}

export async function sendBreakEndNotification(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '休憩おしまい',
      body: '戻れそうなら、次の一手を選びましょう。',
    },
    trigger: null,
  });
}
