export function wireMediaSession(video: HTMLVideoElement, title: string): void {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist: 'Personal PWA Media Lab',
    album: 'Learning Project'
  });

  navigator.mediaSession.setActionHandler('play', async () => video.play());
  navigator.mediaSession.setActionHandler('pause', () => video.pause());
  navigator.mediaSession.setActionHandler('seekbackward', (details) => {
    video.currentTime = Math.max(0, video.currentTime - (details.seekOffset ?? 10));
  });
  navigator.mediaSession.setActionHandler('seekforward', (details) => {
    video.currentTime = Math.min(video.duration || Number.MAX_SAFE_INTEGER, video.currentTime + (details.seekOffset ?? 10));
  });
}
