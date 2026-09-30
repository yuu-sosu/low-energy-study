import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mobileAds, {
  AdsConsent,
  AdsConsentInfo,
  AdsConsentPrivacyOptionsRequirementStatus,
} from 'react-native-google-mobile-ads';
import { AdsConsentContext } from './AdsConsentContext';

export function AdsConsentProvider({ children }: PropsWithChildren) {
  const [canRequestAds, setCanRequestAds] = useState(false);
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);
  const initializedRef = useRef(false);

  const applyConsentInfo = useCallback(async (info: AdsConsentInfo) => {
    setCanRequestAds(info.canRequestAds);
    setPrivacyOptionsRequired(
      info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    );

    if (info.canRequestAds && !initializedRef.current) {
      initializedRef.current = true;
      await mobileAds().initialize();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function prepareConsent() {
      try {
        await AdsConsent.requestInfoUpdate();
        const info = await AdsConsent.loadAndShowConsentFormIfRequired();
        if (!cancelled) await applyConsentInfo(info);
      } catch (error) {
        // A cached decision can still allow ads during a temporary network error.
        try {
          const cachedInfo = await AdsConsent.getConsentInfo();
          if (!cancelled) await applyConsentInfo(cachedInfo);
        } catch {
          if (__DEV__) console.warn('Advertising consent could not be prepared.', error);
        }
      }
    }

    void prepareConsent();
    return () => {
      cancelled = true;
    };
  }, [applyConsentInfo]);

  const showPrivacyOptions = useCallback(async () => {
    try {
      const info = await AdsConsent.showPrivacyOptionsForm();
      await applyConsentInfo(info);
      return true;
    } catch (error) {
      if (__DEV__) console.warn('Advertising privacy options could not be shown.', error);
      return false;
    }
  }, [applyConsentInfo]);

  const value = useMemo(
    () => ({ canRequestAds, privacyOptionsRequired, showPrivacyOptions }),
    [canRequestAds, privacyOptionsRequired, showPrivacyOptions],
  );

  return <AdsConsentContext.Provider value={value}>{children}</AdsConsentContext.Provider>;
}
