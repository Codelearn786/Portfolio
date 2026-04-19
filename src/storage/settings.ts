import type { AppSettings } from '../types';

const KEY = 'media-lab-settings';

const defaults: AppSettings = {
  theme: 'dark',
  preferAudioOnly: false,
  autoplayNext: true
};

export function loadSettings(): AppSettings {
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
