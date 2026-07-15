import { useEffect, useState } from 'react';
import { loadSettings, saveSettings } from '../storage/settingsStorage';
import { Settings } from '../types';

const DEFAULT: Settings = {
  notificationEnabled: true,
  vibrationEnabled: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next).catch(() => {});
  }

  return { settings, loaded, update };
}
