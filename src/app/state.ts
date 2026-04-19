import type { AppSettings } from '../types';

type Listener = () => void;

export class AppState {
  private listeners = new Set<Listener>();
  constructor(public settings: AppSettings) {}

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}
