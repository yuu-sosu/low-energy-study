import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, RESULT_OPTIONS, SPACING } from '../constants';
import { AdMobBanner } from '../components/AdMobBanner';
import { formatMinutes, MAX_NOTE_LENGTH } from '../domain/focus';
import { HomeStackParamList } from '../navigation/types';
import { calcStats, loadSessions, saveSession } from '../storage/sessionStorage';
import { FocusSession, SessionResult } from '../types';
import { ChoiceButton, Section } from './HomeScreen';

type Props = NativeStackScreenProps<HomeStackParamList, 'Record'>;

export function RecordScreen({ navigation, route }: Props) {
  const { draft, elapsedSeconds, initialResult } = route.params;
  const [result, setResult] = useState<SessionResult>(initialResult);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function saveFocusSession() {
    if (saving) return;
    setSaving(true);
    setErrorMessage('');
    const session: FocusSession = {
      ...draft,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      actualDurationSeconds: Math.min(draft.plannedDurationSeconds, Math.max(0, elapsedSeconds)),
      result,
      note: note.trim().slice(0, MAX_NOTE_LENGTH),
    };

    try {
      await saveSession(session);
      const sessions = await loadSessions();
      const todayCount = calcStats(sessions, 'today').totalCount;
      navigation.replace('Break', {
        recommendedSeconds: todayCount > 0 && todayCount % 4 === 0 ? 15 * 60 : 5 * 60,
        previousDraft: draft,
      });
    } catch {
      setErrorMessage('記録を保存できませんでした。もう一度試してください。');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenTitle}>どうだった？</Text>
        <View style={styles.recordCard}>
          <Text style={styles.recordTask}>{draft.taskTitle}</Text>
          <Text style={styles.recordMeta}>{formatMinutes(elapsedSeconds)}</Text>
        </View>
        <Section title="結果">
          <View style={styles.segmentedRow}>
            {RESULT_OPTIONS.map((item) => (
              <ChoiceButton
                key={item.value}
                label={item.label}
                active={result === item.value}
                onPress={() => setResult(item.value)}
              />
            ))}
          </View>
        </Section>
        <Section title="メモ">
          <TextInput
            value={note}
            onChangeText={(value) => setNote(value.slice(0, MAX_NOTE_LENGTH))}
            placeholder="任意で一言"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.noteInput}
            multiline
            maxLength={MAX_NOTE_LENGTH}
          />
          <Text style={styles.counter}>{note.length}/{MAX_NOTE_LENGTH}</Text>
        </Section>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Pressable style={[styles.primaryButton, saving && styles.disabledButton]} onPress={saveFocusSession}>
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>記録する</Text>
          )}
        </Pressable>
        <AdMobBanner />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  page: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  recordCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  recordTask: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  recordMeta: {
    color: COLORS.textSecondary,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  noteInput: {
    minHeight: 112,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    fontSize: FONT_SIZE.base,
    textAlignVertical: 'top',
  },
  counter: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textAlign: 'right',
  },
  error: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
  },
  primaryButton: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
  },
  disabledButton: {
    opacity: 0.72,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
  },
});
