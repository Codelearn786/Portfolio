# Personal PWA Media Lab

Advanced-looking PWA web app for personal/educational media experiments with:
- YouTube **official embed** playback surface
- Direct DASH/HLS playback via Shaka (MSE)
- IndexedDB history + resume points
- Installable PWA + offline UI shell via Workbox

## Compliance + hard limits

- Personal/educational usage only.
- No ad-bypass/cipher-circumvention logic is implemented.
- Direct YouTube manifest fetching from browser clients is unstable/blocked by CORS, anti-bot controls, and player-signature churn.
- iOS Safari PWA background behavior remains platform-limited.

## Quick start

```bash
npm install
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

## Architecture slices

- UI shell + advanced styling: `src/app/bootstrap.ts`, `src/styles/app.css`
- Player boundary (MSE): `src/player/media-source-adapter.ts`
- YouTube URL parser/embed builder: `src/utils/youtube.ts`
- Storage/history: `src/storage/db.ts`
- PWA + caching: `public/manifest.webmanifest`, `workbox-config.cjs`
- Relay boundary: `src/network/relay.ts`, `edge/worker.ts`


## Testing

See `TESTING.md` for the full local, PWA, offline, and browser-specific validation checklist.
