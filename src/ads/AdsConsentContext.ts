import { createContext, useContext } from 'react';

export interface AdsConsentContextValue {
  canRequestAds: boolean;
  privacyOptionsRequired: boolean;
  showPrivacyOptions: () => Promise<boolean>;
}

export const AdsConsentContext = createContext<AdsConsentContextValue>({
  canRequestAds: false,
  privacyOptionsRequired: false,
  showPrivacyOptions: async () => false,
});

export function useAdsConsent() {
  return useContext(AdsConsentContext);
}
