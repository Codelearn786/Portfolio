export type UiPreference = 'vanilla';
export type SourceKind = 'stream' | 'youtube-embed';

export interface AppSettings {
  theme: 'dark' | 'light';
  preferAudioOnly: boolean;
  autoplayNext: boolean;
}

export interface PlaybackRecord {
  id: string;
  title: string;
  streamUrl: string;
  sourceKind: SourceKind;
  positionSec: number;
  updatedAt: number;
}

export interface RelayProbeResult {
  ok: boolean;
  endpoint: string;
  message: string;
}
