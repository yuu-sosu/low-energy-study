import { Platform } from 'react-native';

export const testBannerAdUnitID = Platform.select({
  ios: 'ca-app-pub-3940256099942544/2435281174',
  android: 'ca-app-pub-3940256099942544/9214589741',
  default: 'ca-app-pub-3940256099942544/2435281174',
});

export const productionBannerAdUnitID = 'ca-app-pub-2307989998922955/9472553533';

export const isUsingTestAds = false;

export function getBannerAdUnitID(): string {
  return isUsingTestAds ? testBannerAdUnitID : productionBannerAdUnitID;
}
