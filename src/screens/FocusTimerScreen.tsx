import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdMobBanner } from '../components/AdMobBanner';
import { COLORS, FONT_SIZE, SPACING } from '../constants';
import { formatClock, formatMinutes, getHpLabel } from '../domain/focus';
import { useSettings } from '../hooks/useSettings';
import { HomeStackParamList } from '../navigation/types';
import { requestNotificationPermission, sendFocusEndNotification } from '../notifications';
import { getModeLabel } from '../storage/sessionStorage';
import { SessionResult, TimerStatus } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'FocusTimer'>;

export function FocusTimerScreen({ navigation, route }: Props) {
  const { draft } = route.params;
  const { settings } = useSettings();
  const [status, setStatus] = useState<TimerStatus>('running');
  const [secondsLeft, setSecondsLeft] = useState(draft.plannedDurationSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const lastTickAtRef = useRef(Date.now());
  const finishedRef = useRef(false);

  useEffect(() => {
    if (settings.notificationEnabled) {
      requestNotificationPermission().catch(() => {});
    }
  }, [settings.notificationEnabled]);

  useEffect(() => {
    if (status !== 'running') return;
    lastTickAtRef.current = Date.now();
    const interval = setInterval(() => applyElapsedTime(), 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [status]);

  function handleAppStateChange(nextState: AppStateStatus) {
    if (status !== 'running') return;
    if (nextState === 'active') {
      applyElapsedTime();
    }
  }

  function applyElapsedTime() {
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - lastTickAtRef.current) / 1000));
    if (diff === 0) return;
    lastTickAtRef.current = now;
    setElapsedSeconds((current) => {
      const nextElapsed = Math.min(draft.plannedDurationSeconds, current + diff);
      if (nextElapsed >= draft.plannedDurationSeconds) {
        finish('done', draft.plannedDurationSeconds);
      }
      return nextElapsed;
    });
    setSecondsLeft((current) => Math.max(0, current - diff));
  }

  function togglePause() {
    if (status === 'running') {
      applyElapsedTime();
      setStatus('paused');
      return;
    }
    lastTickAtRef.current = Date.now();
    setStatus('running');
  }

  function finish(result: SessionResult, fixedElapsedSeconds?: number) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStatus('idle');
    if (settings.vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    if (settings.notificationEnabled) {
      sendFocusEndNotification().catch(() => {});
    }
    navigation.replace('Record', {
      draft,
      elapsedSeconds: fixedElapsedSeconds ?? elapsedSeconds,
      initialResult: result,
    });
  }

  const progress = Math.min(1, elapsedSeconds / draft.plannedDurationSeconds);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.mode}>{getModeLabel(draft.mode)}</Text>
          <Text style={styles.hp}>HP: {getHpLabel(draft.hpLevel)}</Text>
        </View>
        <Text style={styles.task}>{draft.taskTitle}</Text>
        <Text style={styles.clock}>{formatClock(secondsLeft)}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.meta}>
          {formatMinutes(elapsedSeconds)} / {formatMinutes(draft.plannedDurationSeconds)}
        </Text>
        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={togglePause}>
            <Text style={styles.secondaryButtonText}>
              {status === 'running' ? '一時停止' : '再開'}
            </Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => finish('partial')}>
            <Text style={styles.secondaryButtonText}>中断</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => finish('done')}>
            <Text style={styles.primaryButtonText}>完了</Text>
          </Pressable>
        </View>
        {status !== 'running' ? (
          <View style={styles.adSlot}>
            <AdMobBanner />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  mode: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
  },
  hp: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  task: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  clock: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZE.timer,
    fontWeight: '300',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceMuted,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  meta: {
    color: COLORS.textSecondary,
  },
  actions: {
    width: '100%',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  adSlot: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  primaryButton: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
  },
});
