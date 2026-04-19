/*
  WHY this abstraction exists:
  - Keeps UI independent from playback engine details.
  - Allows swapping Shaka/dash.js/custom MSE in later phases without rewriting UI.
*/
import shaka from 'shaka-player/dist/shaka-player.compiled.js';

export interface LoadOptions {
  url: string;
  title: string;
}

export class MediaSourceAdapter {
  private player: shaka.Player | null = null;

  constructor(private readonly video: HTMLVideoElement) {}

  async init(): Promise<void> {
    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) {
      throw new Error('Browser does not support required media APIs.');
    }
    this.player = new shaka.Player(this.video);
    this.player.configure({ streaming: { rebufferingGoal: 8, bufferingGoal: 20 } });
  }

  async load(options: LoadOptions): Promise<void> {
    if (!this.player) throw new Error('Player is not initialized');
    await this.player.load(options.url);
    document.title = options.title;
  }

  destroy(): Promise<void> {
    if (!this.player) return Promise.resolve();
    const p = this.player.destroy();
    this.player = null;
    return p;
  }
}
