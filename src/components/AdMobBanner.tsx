import Constants from 'expo-constants';
import React, { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../constants';
import { getBannerAdUnitID, isUsingTestAds } from '../ads/AdMobConfig';

type GoogleMobileAdsModule = {
  BannerAd: React.ComponentType<{
    unitId: string;
    size: string;
    requestOptions?: { requestNonPersonalizedAdsOnly?: boolean };
    onAdFailedToLoad?: () => void;
    ref?: React.Ref<unknown>;
  }>;
  BannerAdSize: {
    BANNER: string;
    LARGE_ANCHORED_ADAPTIVE_BANNER: string;
  };
};

declare const require: (name: string) => GoogleMobileAdsModule;

function canUseNativeAds(): boolean {
  return Platform.OS !== 'web' && Constants.appOwnership !== 'expo';
}

export function AdMobBanner({ compact = false }: { compact?: boolean }) {
  const bannerRef = useRef<unknown>(null);
  const [hasLoadError, setHasLoadError] = useState(false);

  const adsModule = useMemo(() => {
    if (!canUseNativeAds()) return null;
    try {
      return require('react-native-google-mobile-ads');
    } catch {
      return null;
    }
  }, []);

  if (!adsModule || hasLoadError) {
    return <AdFallback compact={compact} />;
  }

  const { BannerAd, BannerAdSize } = adsModule;

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <BannerAd
        ref={bannerRef as never}
        unitId={getBannerAdUnitID()}
        size={compact ? BannerAdSize.BANNER : BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setHasLoadError(true)}
      />
    </View>
  );
}

function AdFallback({ compact }: { compact: boolean }) {
  return (
    <View style={[styles.placeholder, compact && styles.compactPlaceholder]}>
      <Text style={styles.placeholderText}>
        {isUsingTestAds ? 'テスト広告スペース' : '広告スペース'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContainer: {
    minHeight: 50,
  },
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
