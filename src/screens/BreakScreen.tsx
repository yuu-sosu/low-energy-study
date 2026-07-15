import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdMobBanner } from '../components/AdMobBanner';
import {
  COLORS,
  DURATION_OPTIONS,
  FOCUS_MODES,
  FONT_SIZE,
  NEXT_STEP_SUGGESTIONS,
  SPACING,
} from '../constants';
import {
  formatClock,
  formatMinutes,
  getDefaultTaskTitle,
  MAX_TASK_LENGTH,
} from '../domain/focus';
import { useSettings } from '../hooks/useSettings';
import { HomeStackParamList } from '../navigation/types';
import { sendBreakEndNotification } from '../notifications';
import { FocusMode, TimerStatus } from '../types';
import { ChoiceButton, Section } from './HomeScreen';

type Props = NativeStackScreenProps<HomeStackParamList, 'Break'>;

const BREAK_OPTIONS = [
  { label: '5分', seconds: 5 * 60 },
  { label: '15分', seconds: 15 * 60 },
];

export function BreakScreen({ navigation, route }: Props) {
  const { recommendedSeconds, previousDraft } = route.params;
  const { settings } = useSettings();
  const [selectedSeconds, setSelectedSeconds] = useState(recommendedSeconds);
  const [nextMode, setNextMode] = useState<FocusMode>(previousDraft.mode);
  const [nextTaskTitle, setNextTaskTitle] = useState('');
  const [nextDurationSeconds, setNextDurationSeconds] = useState(previousDraft.plannedDurationSeconds);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(recommendedSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const lastTickAtRef = useRef(Date.now());
  const finishedRef = useRef(false);

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
    if (status === 'running' && nextState === 'active') {
      applyElapsedTime();
    }
  }

  function applyElapsedTime() {
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - lastTickAtRef.current) / 1000));
    if (diff === 0) return;
    lastTickAtRef.current = now;
    setElapsedSeconds((current) => {
      const nextElapsed = Math.min(selectedSeconds, current + diff);
      if (nextElapsed >= selectedSeconds) {
        finishBreak();
      }
      return nextElapsed;
    });
    setSecondsLeft((current) => Math.max(0, current - diff));
  }

  function startBreak() {
    setSecondsLeft(selectedSeconds);
    setElapsedSeconds(0);
    finishedRef.current = false;
    lastTickAtRef.current = Date.now();
    setStatus('running');
  }

  function chooseSuggestion() {
    const suggestions = NEXT_STEP_SUGGESTIONS[nextMode];
    const index = Math.floor(Math.random() * suggestions.length);
    setNextTaskTitle(suggestions[index]);
  }

  function getNextDraft() {
    const title = nextTaskTitle.trim() || getDefaultTaskTitle(nextMode);
    return {
      mode: nextMode,
      hpLevel: previousDraft.hpLevel,
      taskTitle: title.slice(0, MAX_TASK_LENGTH),
      plannedDurationSeconds: nextDurationSeconds,
    };
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

  function finishBreak() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStatus('idle');
    if (settings.vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    if (settings.notificationEnabled) {
      sendBreakEndNotification().catch(() => {});
    }
    navigation.replace('FocusTimer', { draft: getNextDraft() });
  }

  const progress = selectedSeconds === 0 ? 0 : Math.min(1, elapsedSeconds / selectedSeconds);
  const isChoosing = status === 'idle' && elapsedSeconds === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>休憩</Text>
        <Text style={styles.title}>
          {isChoosing ? '次の一手を決めてから休む' : '休憩中'}
        </Text>
        <Text style={styles.copy}>
          休憩後に迷わないように、戻ったらやることを先に置いておきます。
        </Text>

        {isChoosing ? <AdMobBanner /> : null}

        {isChoosing ? (
          <View style={styles.setup}>
            <Section title="休憩時間">
              <View style={styles.options}>
                {BREAK_OPTIONS.map((item) => (
                  <ChoiceButton
                    key={item.seconds}
                    label={item.label}
                    active={selectedSeconds === item.seconds}
                    onPress={() => {
                      setSelectedSeconds(item.seconds);
                      setSecondsLeft(item.seconds);
                    }}
                  />
                ))}
              </View>
            </Section>

            <Section title="休憩後に何を進める？">
              <View style={styles.wrapRow}>
                {FOCUS_MODES.map((item) => (
                  <ChoiceButton
                    key={item.value}
                    label={item.label}
                    active={nextMode === item.value}
                    onPress={() => setNextMode(item.value)}
                  />
                ))}
              </View>
            </Section>

            <Section title="次の一手">
              <TextInput
                value={nextTaskTitle}
                onChangeText={(value) => setNextTaskTitle(value.slice(0, MAX_TASK_LENGTH))}
                placeholder={getDefaultTaskTitle(nextMode)}
                placeholderTextColor={COLORS.textSecondary}
                style={styles.input}
                maxLength={MAX_TASK_LENGTH}
                returnKeyType="done"
              />
              <View style={styles.inputFooter}>
                <Pressable style={styles.smallButton} onPress={chooseSuggestion}>
                  <Text style={styles.smallButtonText}>次の一手ガチャ</Text>
                </Pressable>
                <Text style={styles.counter}>{nextTaskTitle.length}/{MAX_TASK_LENGTH}</Text>
              </View>
            </Section>

            <Section title="次はどれくらいやる？">
              <View style={styles.options}>
                {DURATION_OPTIONS.map((item) => (
                  <ChoiceButton
                    key={item.seconds}
                    label={item.label}
                    active={nextDurationSeconds === item.seconds}
                    onPress={() => setNextDurationSeconds(item.seconds)}
                  />
                ))}
              </View>
            </Section>
          </View>
        ) : (
          <>
            <Text style={styles.clock}>{formatClock(secondsLeft)}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.meta}>
              {formatMinutes(elapsedSeconds)} / {formatMinutes(selectedSeconds)}
            </Text>
            {status !== 'running' ? (
              <View style={styles.adSlot}>
                <AdMobBanner />
              </View>
            ) : null}
          </>
        )}

        <View style={styles.actions}>
          {isChoosing ? (
            <Pressable style={styles.primaryButton} onPress={startBreak}>
              <Text style={styles.primaryButtonText}>休憩する</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.secondaryButton} onPress={togglePause}>
              <Text style={styles.secondaryButtonText}>
                {status === 'running' ? '一時停止' : '再開'}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              isChoosing
                ? navigation.replace('TodaySummary')
                : navigation.replace('FocusTimer', { draft: getNextDraft() })
            }
          >
            <Text style={styles.secondaryButtonText}>
              {isChoosing ? '休憩せず積み上げへ' : '今すぐ始める'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  copy: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 22,
    textAlign: 'center',
  },
  options: {
    width: '100%',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  setup: {
    width: '100%',
    gap: SPACING.lg,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  input: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.base,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  smallButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  smallButtonText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  counter: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textAlign: 'right',
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
