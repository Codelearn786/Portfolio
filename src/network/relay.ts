import type { RelayProbeResult } from '../types';

export class RelayClient {
  constructor(private readonly endpoint: string) {}

  async probe(signal?: AbortSignal): Promise<RelayProbeResult> {
    try {
      const res = await fetch(`${this.endpoint}/health`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, endpoint: this.endpoint, message: 'Relay reachable' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown failure';
      return { ok: false, endpoint: this.endpoint, message };
    }
  }
}
