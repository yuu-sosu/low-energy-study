import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, SPACING } from '../constants';
import { AdMobBanner } from '../components/AdMobBanner';
import {
  formatMinutes,
  getResultLabel,
  periodLabel,
  periodRangeLabel,
  sessionDateLabel,
} from '../domain/focus';
import { HomeStackParamList } from '../navigation/types';
import { calcStats, getModeLabel, loadSessions, StatsPeriod } from '../storage/sessionStorage';
import { FocusSession } from '../types';

type Stats = ReturnType<typeof calcStats>;
type TodaySummaryProps = NativeStackScreenProps<HomeStackParamList, 'TodaySummary'>;

const EMPTY_STATS = calcStats([]);
const PERIOD_OPTIONS: StatsPeriod[] = ['today', 'week', 'month', 'all'];
const MAX_VISIBLE_SESSIONS = 10;

export function StatsScreen() {
  return <TodaySummaryContent />;
}

export function TodaySummaryScreen({ navigation }: TodaySummaryProps) {
  return <TodaySummaryContent onHomePress={() => navigation.popToTop()} showHomeButton />;
}

function TodaySummaryContent({
  onHomePress,
  showHomeButton = false,
}: {
  onHomePress?: () => void;
  showHomeButton?: boolean;
}) {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [period, setPeriod] = useState<StatsPeriod>('today');
  const [loadError, setLoadError] = useState('');

  const refresh = useCallback(() => {
    loadSessions()
      .then((sessions) => {
        setStats(calcStats(sessions, period));
        setLoadError('');
      })
      .catch(() => setLoadError('記録を読み込めませんでした。'));
  }, [period]);

  useFocusEffect(refresh);

  const visibleSessions = stats.periodSessions.slice(0, MAX_VISIBLE_SESSIONS);
  const hiddenSessionCount = Math.max(0, stats.periodSessions.length - visibleSessions.length);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.title}>積み上げ</Text>
        <Text style={styles.date}>{periodRangeLabel(period)}</Text>
        <View style={styles.periodTabs}>
          {PERIOD_OPTIONS.map((item) => (
            <Pressable
              key={item}
              style={[styles.periodTab, period === item && styles.periodTabActive]}
              onPress={() => setPeriod(item)}
            >
              <Text style={[styles.periodTabText, period === item && styles.periodTabTextActive]}>
                {periodLabel(item)}
              </Text>
            </Pressable>
          ))}
        </View>
        {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
        <View style={styles.cards}>
          <StatCard label="合計" value={formatMinutes(stats.totalSeconds)} />
          <StatCard label="記録" value={`${stats.totalCount}件`} />
          <StatCard label="完了" value={`${stats.doneCount}`} />
          <StatCard label="途中まで" value={`${stats.partialCount}`} />
          <StatCard label="無理だった" value={`${stats.failedCount}`} />
        </View>

        <Text style={styles.sectionTitle}>モード別</Text>
        <View style={styles.panel}>
          {stats.byMode.length > 0 ? (
            stats.byMode.map((item) => (
              <View key={item.mode} style={styles.modeRow}>
                <Text style={styles.modeName}>{item.label}</Text>
                <Text style={styles.modeMinutes}>{formatMinutes(item.seconds)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>まだ記録はありません。</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>{periodLabel(period)}の記録</Text>
        <View style={styles.list}>
          {visibleSessions.length > 0 ? (
            visibleSessions.map((session) => <SessionItem key={session.id} session={session} />)
          ) : (
            <Text style={styles.empty}>ホームから一手を始めると、ここに残ります。</Text>
          )}
          {hiddenSessionCount > 0 ? (
            <Text style={styles.moreText}>ほか {hiddenSessionCount} 件</Text>
          ) : null}
        </View>

        {showHomeButton && onHomePress ? (
          <Pressable style={styles.primaryButton} onPress={onHomePress}>
            <Text style={styles.primaryButtonText}>ホームへ戻る</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <View style={styles.bottomAd}>
        <AdMobBanner compact />
      </View>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

function SessionItem({ session }: { session: FocusSession }) {
  return (
    <View style={styles.session}>
      <Text style={styles.sessionTitle}>{session.taskTitle}</Text>
      <Text style={styles.sessionMeta}>
        {sessionDateLabel(session.createdAt)} | {formatMinutes(session.actualDurationSeconds)} |{' '}
        {getModeLabel(session.mode)} | {getResultLabel(session.result)}
      </Text>
      {session.note ? <Text style={styles.note}>{session.note}</Text> : null}
    </View>
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
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  date: {
    color: COLORS.textSecondary,
    marginTop: -SPACING.sm,
  },
  error: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    alignSelf: 'stretch',
  },
  card: {
    flexBasis: 160,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 78,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  cardValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  periodTabs: {
    flexDirection: 'row',
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 8,
    padding: SPACING.xs,
  },
  periodTab: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  periodTabActive: {
    backgroundColor: COLORS.surface,
  },
  periodTabText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  periodTabTextActive: {
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  modeRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modeName: {
    color: COLORS.text,
    fontWeight: '600',
  },
  modeMinutes: {
    color: COLORS.textSecondary,
  },
  list: {
    gap: SPACING.sm,
  },
  session: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  sessionTitle: {
    color: COLORS.text,
    fontWeight: '700',
  },
  sessionMeta: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  note: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
  },
  empty: {
    color: COLORS.textSecondary,
    paddingVertical: SPACING.md,
  },
  moreText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
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
