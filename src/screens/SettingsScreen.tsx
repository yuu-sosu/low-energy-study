import React from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdsConsent } from '../ads/AdsConsentContext';
import { COLORS, FONT_SIZE, SPACING } from '../constants';
import { useSettings } from '../hooks/useSettings';

export function SettingsScreen() {
  const { settings, loaded, update } = useSettings();
  const { privacyOptionsRequired, showPrivacyOptions } = useAdsConsent();

  async function openPrivacyOptions() {
    const shown = await showPrivacyOptions();
    if (!shown) {
      Alert.alert('広告のプライバシー設定', '現在変更できる広告のプライバシー設定はありません。');
    }
  }

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>設定</Text>
      <View style={styles.section}>
        <SettingRow
          label="通知"
          description="タイマー終了時に通知を送る"
          value={settings.notificationEnabled}
          onChange={(v) => update({ notificationEnabled: v })}
        />
        <View style={styles.divider} />
        <SettingRow
          label="バイブ"
          description="タイマー終了時に振動する"
          value={settings.vibrationEnabled}
          onChange={(v) => update({ vibrationEnabled: v })}
        />
      </View>
      <Text style={styles.sectionTitle}>プライバシー</Text>
      <View style={styles.section}>
        {privacyOptionsRequired ? (
          <>
            <ActionRow
              label="広告のプライバシー設定"
              description="広告に関する同意内容を確認・変更する"
              onPress={openPrivacyOptions}
            />
            <View style={styles.divider} />
          </>
        ) : null}
        <ActionRow
          label="プライバシーポリシー"
          description="データの取り扱いについて確認する"
          onPress={() => Linking.openURL('https://glittery-baklava-452314.netlify.app')}
        />
      </View>
    </SafeAreaView>
  );
}

function ActionRow({ label, description, onPress }: { label: string; description: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressedRow]}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Text style={styles.disclosure}>›</Text>
    </Pressable>
  );
}

interface SettingRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function SettingRow({ label, description, value, onChange }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
        thumbColor={value ? COLORS.primary : COLORS.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  section: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  rowText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  rowLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  rowDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pressedRow: {
    backgroundColor: COLORS.surface,
  },
  disclosure: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xl,
  },
});
