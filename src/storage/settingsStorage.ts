import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../types';

const SETTINGS_KEY = 'settings';

const DEFAULT_SETTINGS: Settings = {
  notificationEnabled: true,
  vibrationEnabled: true,
};

export async function loadSettings(): Promise<Settings> {
  const json = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!json) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(json) } as Settings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
