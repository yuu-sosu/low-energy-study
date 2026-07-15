import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  DURATION_OPTIONS,
  FOCUS_MODES,
  FONT_SIZE,
  HP_OPTIONS,
  NEXT_STEP_SUGGESTIONS,
  SPACING,
} from '../constants';
import { AdMobBanner } from '../components/AdMobBanner';
import { getDefaultTaskTitle, MAX_TASK_LENGTH } from '../domain/focus';
import { HomeStackParamList } from '../navigation/types';
import { FocusMode, HPLevel } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [hpLevel, setHpLevel] = useState<HPLevel>('normal');
  const [mode, setMode] = useState<FocusMode>('study');
  const [taskTitle, setTaskTitle] = useState('');
  const [plannedSeconds, setPlannedSeconds] = useState(25 * 60);

  function chooseHp(nextHp: HPLevel) {
    setHpLevel(nextHp);
    const recommended = HP_OPTIONS.find((item) => item.value === nextHp)?.recommendedSeconds;
    if (recommended) setPlannedSeconds(recommended);
  }

  function chooseSuggestion() {
    const suggestions = NEXT_STEP_SUGGESTIONS[mode];
    const index = Math.floor(Math.random() * suggestions.length);
    setTaskTitle(suggestions[index]);
  }

  function startFocus() {
    const title = taskTitle.trim() || getDefaultTaskTitle(mode);
    navigation.navigate('FocusTimer', {
      draft: {
        mode,
        hpLevel,
        taskTitle: title.slice(0, MAX_TASK_LENGTH),
        plannedDurationSeconds: plannedSeconds,
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.appName}>低燃費スタディ</Text>
          <Text style={styles.subtitle}>やる気がない日でも、まず5分だけ。</Text>
        </View>

        <Section title="今のHPは？">
          <View style={styles.segmentedRow}>
            {HP_OPTIONS.map((item) => (
              <ChoiceButton
                key={item.value}
                label={item.label}
                active={hpLevel === item.value}
                onPress={() => chooseHp(item.value)}
              />
            ))}
          </View>
        </Section>

        <Section title="何を進める？">
          <View style={styles.wrapRow}>
            {FOCUS_MODES.map((item) => (
              <ChoiceButton
                key={item.value}
                label={item.label}
                active={mode === item.value}
                onPress={() => setMode(item.value)}
              />
            ))}
          </View>
        </Section>

        <Section title="次にやることを1つだけ">
          <TextInput
            value={taskTitle}
            onChangeText={(value) => setTaskTitle(value.slice(0, MAX_TASK_LENGTH))}
            placeholder={getDefaultTaskTitle(mode)}
            placeholderTextColor={COLORS.textSecondary}
            style={styles.input}
            maxLength={MAX_TASK_LENGTH}
            returnKeyType="done"
          />
          <View style={styles.inputFooter}>
            <Pressable style={styles.smallButton} onPress={chooseSuggestion}>
              <Text style={styles.smallButtonText}>次の一手ガチャ</Text>
            </Pressable>
            <Text style={styles.counter}>{taskTitle.length}/{MAX_TASK_LENGTH}</Text>
          </View>
        </Section>

        <Section title="どれくらいやる？">
          <View style={styles.segmentedRow}>
            {DURATION_OPTIONS.map((item) => (
              <ChoiceButton
                key={item.seconds}
                label={item.label}
                active={plannedSeconds === item.seconds}
                onPress={() => setPlannedSeconds(item.seconds)}
              />
            ))}
          </View>
        </Section>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={startFocus}>
            <Text style={styles.primaryButtonText}>この一手を始める</Text>
          </Pressable>
          <Pressable style={styles.linkButton} onPress={() => navigation.navigate('TodaySummary')}>
            <Text style={styles.linkButtonText}>今日の積み上げを見る</Text>
          </Pressable>
        </View>
      </ScrollView>
      <View style={styles.bottomAd}>
        <AdMobBanner compact />
      </View>
    </SafeAreaView>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ChoiceButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.choice, active && styles.choiceActive]} onPress={onPress}>
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  page: {
    padding: SPACING.lg,
    paddingBottom: 72,
    gap: SPACING.lg,
  },
  hero: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  appName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.base,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  choice: {
    minHeight: 44,
    minWidth: 76,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
  },
  choiceActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  choiceText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  choiceTextActive: {
    color: COLORS.white,
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
  actions: {
    gap: SPACING.sm,
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
  linkButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  bottomAd: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 50,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
