import { sanitizeText } from '../security/sanitize';
import { loadSettings, saveSettings } from '../storage/settings';
import { AppState } from './state';
import { setupInstallPrompt } from '../pwa/install-prompt';
import { registerServiceWorker } from '../pwa/register-sw';
import { RelayClient } from '../network/relay';
import { MediaSourceAdapter } from '../player/media-source-adapter';
import { upsertHistory, listRecentHistory } from '../storage/db';
import { wireMediaSession } from './media-session';
import { buildYoutubeEmbedUrl, parseYoutubeId } from '../utils/youtube';
import type { PlaybackRecord, SourceKind } from '../types';

function renderHistory(historyEl: HTMLUListElement, rows: PlaybackRecord[]): void {
  historyEl.innerHTML = '';
  rows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `<strong>${row.title}</strong><small>${new Date(row.updatedAt).toLocaleString()} • ${row.sourceKind}</small>`;
    historyEl.append(li);
  });
}

export async function bootstrap(container: HTMLElement): Promise<void> {
  const state = new AppState(loadSettings());
  registerServiceWorker();

  container.innerHTML = `
    <main class="app-shell">
      <header class="hero card">
        <div>
          <h1>Media Lab Pro</h1>
          <p>Advanced personal media workspace with YouTube embed + DASH/HLS stream playback.</p>
        </div>
        <div class="hero-actions">
          <button id="installBtn" hidden>Install App</button>
          <span id="relayBadge" class="badge">Relay: checking...</span>
        </div>
      </header>

      <section class="card controls">
        <div class="tabs">
          <button id="tabYoutube" class="tab active">YouTube</button>
          <button id="tabStream" class="tab">Direct Stream</button>
        </div>

        <div id="panelYoutube" class="panel active">
          <label>YouTube URL or Video ID
            <input id="youtubeInput" placeholder="https://www.youtube.com/watch?v=..." />
          </label>
          <button id="openYoutubeBtn">Open YouTube Embed</button>
          <small>Uses official embed surface. Direct manifest extraction is intentionally not done in-browser.</small>
        </div>

        <div id="panelStream" class="panel">
          <label>DASH/HLS Manifest URL
            <input id="streamUrl" placeholder="https://example.com/manifest.mpd" />
          </label>
          <button id="playBtn">Play Stream via MSE</button>
          <small>Best for test content/CDN streams where CORS permits playback.</small>
        </div>
      </section>

      <section class="card stage">
        <div id="embedWrap" class="embed-wrap hidden"></div>
        <video id="video" controls playsinline class="video"></video>
        <p id="status">Idle</p>
      </section>

      <section class="card preferences">
        <label><input id="audioOnly" type="checkbox" /> Prefer audio-only when available</label>
        <label><input id="autoplayNext" type="checkbox" /> Autoplay next item in queue</label>
      </section>

      <section class="card">
        <h2>Recent History</h2>
        <ul id="history" class="history"></ul>
      </section>
    </main>
  `;

  const byId = <T extends HTMLElement>(id: string): T => {
    const node = container.querySelector<T>(`#${id}`);
    if (!node) throw new Error(`Missing #${id}`);
    return node;
  };

  const installBtn = byId<HTMLButtonElement>('installBtn');
  const relayBadge = byId<HTMLElement>('relayBadge');
  const tabYoutube = byId<HTMLButtonElement>('tabYoutube');
  const tabStream = byId<HTMLButtonElement>('tabStream');
  const panelYoutube = byId<HTMLElement>('panelYoutube');
  const panelStream = byId<HTMLElement>('panelStream');
  const youtubeInput = byId<HTMLInputElement>('youtubeInput');
  const openYoutubeBtn = byId<HTMLButtonElement>('openYoutubeBtn');
  const streamUrlInput = byId<HTMLInputElement>('streamUrl');
  const playBtn = byId<HTMLButtonElement>('playBtn');
  const embedWrap = byId<HTMLElement>('embedWrap');
  const video = byId<HTMLVideoElement>('video');
  const status = byId<HTMLElement>('status');
  const audioOnly = byId<HTMLInputElement>('audioOnly');
  const autoplayNext = byId<HTMLInputElement>('autoplayNext');
  const historyEl = byId<HTMLUListElement>('history');

  setupInstallPrompt(installBtn);
  audioOnly.checked = state.settings.preferAudioOnly;
  autoplayNext.checked = state.settings.autoplayNext;

  const toggleTab = (kind: SourceKind): void => {
    const yt = kind === 'youtube-embed';
    tabYoutube.classList.toggle('active', yt);
    tabStream.classList.toggle('active', !yt);
    panelYoutube.classList.toggle('active', yt);
    panelStream.classList.toggle('active', !yt);
  };

  tabYoutube.addEventListener('click', () => toggleTab('youtube-embed'));
  tabStream.addEventListener('click', () => toggleTab('stream'));

  audioOnly.addEventListener('change', () => {
    state.settings.preferAudioOnly = audioOnly.checked;
    saveSettings(state.settings);
  });
  autoplayNext.addEventListener('change', () => {
    state.settings.autoplayNext = autoplayNext.checked;
    saveSettings(state.settings);
  });

  const adapter = new MediaSourceAdapter(video);
  await adapter.init();

  const relay = new RelayClient('/api/relay');
  const relayProbe = await relay.probe();
  relayBadge.textContent = relayProbe.ok ? 'Relay: online' : 'Relay: offline';
  relayBadge.classList.toggle('offline', !relayProbe.ok);

  const refreshHistory = async (): Promise<void> => {
    const rows = await listRecentHistory();
    renderHistory(historyEl, rows);
  };

  await refreshHistory();

  openYoutubeBtn.addEventListener('click', async () => {
    const cleaned = sanitizeText(youtubeInput.value);
    const id = parseYoutubeId(cleaned);
    if (!id) {
      status.textContent = 'Invalid YouTube URL/ID.';
      return;
    }

    const embedUrl = buildYoutubeEmbedUrl(id);
    embedWrap.innerHTML = `<iframe class="yt-frame" src="${embedUrl}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    embedWrap.classList.remove('hidden');
    video.style.display = 'none';
    status.textContent = 'YouTube embed opened.';

    await upsertHistory({
      id: `yt-${id}`,
      title: `YouTube ${id}`,
      streamUrl: `https://www.youtube.com/watch?v=${id}`,
      sourceKind: 'youtube-embed',
      positionSec: 0,
      updatedAt: Date.now()
    });
    await refreshHistory();
  });

  playBtn.addEventListener('click', async () => {
    const cleaned = sanitizeText(streamUrlInput.value);
    if (!cleaned) {
      status.textContent = 'Please provide a valid stream URL.';
      return;
    }

    try {
      embedWrap.classList.add('hidden');
      embedWrap.innerHTML = '';
      video.style.display = 'block';
      await adapter.load({ url: cleaned, title: 'Custom stream' });
      wireMediaSession(video, 'Custom stream');
      status.textContent = 'Playing stream';

      const row: PlaybackRecord = {
        id: crypto.randomUUID(),
        title: 'Custom stream',
        streamUrl: cleaned,
        sourceKind: 'stream',
        positionSec: video.currentTime,
        updatedAt: Date.now()
      };
      await upsertHistory(row);
      await refreshHistory();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown playback error';
      status.textContent = `Playback failed: ${message}`;
    }
  });

  video.addEventListener('timeupdate', async () => {
    const currentSrc = sanitizeText(streamUrlInput.value);
    if (!currentSrc) return;
    await upsertHistory({
      id: `resume-${currentSrc}`,
      title: 'Resume point',
      streamUrl: currentSrc,
      sourceKind: 'stream',
      positionSec: video.currentTime,
      updatedAt: Date.now()
    });
  });

  window.addEventListener('beforeunload', () => {
    void adapter.destroy();
  });
}
