import React, { PropsWithChildren } from 'react';
import { AdsConsentContext } from './AdsConsentContext';

export function AdsConsentProvider({ children }: PropsWithChildren) {
  return (
    <AdsConsentContext.Provider
      value={{
        canRequestAds: false,
        privacyOptionsRequired: false,
        showPrivacyOptions: async () => false,
      }}
    >
      {children}
    </AdsConsentContext.Provider>
  );
}
