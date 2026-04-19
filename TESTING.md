# Testing Guide — Personal PWA Media Lab

This guide explains how to test the app locally on desktop and mobile.

## 1) Prerequisites

- Node.js 20+ (Node 22 recommended)
- npm 10+
- Chrome/Edge for full PWA + Media Session coverage
- Safari (iOS/macOS) for limitation checks

## 2) Install and run

```bash
npm ci
npm run dev
```

Open: `http://localhost:5173`

## 3) Static checks (must pass before manual testing)

```bash
npm run lint
npm run build
```

What these validate:
- TypeScript strict checks (`tsc --noEmit` via build)
- Production bundle generation (`vite build`)
- Service worker generation (`workbox generateSW`)

## 4) Functional test matrix

### A. App boot + UI shell
1. Load app in a clean browser profile.
2. Verify hero, tabs, playback stage, settings, and history list render.
3. Refresh page and verify no runtime errors in DevTools Console.

Expected result: App loads and interactive controls are usable.

### B. YouTube embed mode
1. Select **YouTube** tab.
2. Paste a public YouTube URL (or 11-char ID).
3. Click **Open YouTube Embed**.

Expected result:
- Embedded player iframe appears.
- Status updates to “YouTube embed opened.”
- A history row is added.

### C. Direct stream (MSE via Shaka)
1. Select **Direct Stream** tab.
2. Paste a known-working MPD/HLS URL that allows CORS.
3. Click **Play Stream via MSE**.

Expected result:
- `<video>` starts playback.
- Status updates to “Playing stream”.
- History receives stream entry and resume points.

### D. Settings persistence
1. Toggle **Prefer audio-only** and **Autoplay next item in queue**.
2. Reload page.

Expected result: toggles remain in previously selected state.

### E. PWA install prompt
1. Use HTTPS origin (or localhost in Chromium).
2. Interact with app until install prompt becomes available.
3. Click **Install App**.

Expected result: app can be installed and opens in standalone window.

### F. Offline UI behavior
1. Run `npm run build && npm run preview`.
2. Open app and let service worker install.
3. In DevTools > Network, set **Offline**.
4. Reload.

Expected result:
- App shell/offline fallback is served.
- Streaming requests fail gracefully while UI remains available.

### G. Media Session checks (Android/desktop)
1. Start direct stream playback.
2. Lock screen or use hardware media keys.

Expected result: play/pause/seek actions work when browser/OS supports Media Session.

## 5) DevTools debugging checklist

- **Console**: no uncaught exceptions.
- **Application > Service Workers**: SW active and controlling page.
- **Application > Cache Storage**: Workbox caches present.
- **Application > IndexedDB**: `media-lab-db` stores contain history records.
- **Network**: verify relay health probe to `/api/relay/health`.

## 6) Safari/iOS-specific checks

- Add to home screen and verify launch in standalone mode.
- Verify playback behavior foreground/background.
- Document expected restrictions: iOS may suspend playback/background behavior.

## 7) Common failures and fixes

- **Playback fails immediately**: stream URL likely blocks CORS or is invalid.
- **No install prompt**: criteria not met yet (HTTPS, engagement, SW active).
- **No media key behavior**: platform/browser may not support full handlers.
- **SW not controlling page**: hard reload once after registration.

## 8) Quick smoke command sequence

```bash
npm ci
npm run lint
npm run build
npm run preview
```

Then run sections A–F manually.
