import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isUsingTestAds } from '../ads/AdMobConfig';
import { COLORS, FONT_SIZE, SPACING } from '../constants';

export function AdMobBanner({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.placeholder, compact && styles.compactPlaceholder]}>
      <Text style={styles.placeholderText}>
        {isUsingTestAds ? 'テスト広告スペース' : '広告スペース'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
  },
  compactPlaceholder: {
    height: 42,
    borderRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
  },
});
