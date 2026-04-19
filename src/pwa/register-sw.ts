import { Workbox } from 'workbox-window';

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  const wb = new Workbox('/sw.js');
  wb.addEventListener('waiting', () => {
    console.info('New service worker waiting; reload to update.');
  });
  void wb.register();
}
