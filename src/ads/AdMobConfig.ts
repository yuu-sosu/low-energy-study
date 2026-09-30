import { Platform } from 'react-native';

export const testBannerAdUnitID = Platform.select({
  ios: 'ca-app-pub-3940256099942544/2435281174',
  android: 'ca-app-pub-3940256099942544/9214589741',
  default: 'ca-app-pub-3940256099942544/2435281174',
});

export const productionBannerAdUnitID = 'ca-app-pub-2307989998922955/9472553533';

// Development builds must never request live ads. Release builds use the
// production unit configured for the App Store version.
export const isUsingTestAds = __DEV__;

export function getBannerAdUnitID(): string {
  return isUsingTestAds ? testBannerAdUnitID : productionBannerAdUnitID;
}
