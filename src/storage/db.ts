import { openDB, type DBSchema } from 'idb';
import type { PlaybackRecord } from '../types';

interface MediaDb extends DBSchema {
  history: {
    key: string;
    value: PlaybackRecord;
    indexes: { 'by-updatedAt': number };
  };
  favorites: {
    key: string;
    value: PlaybackRecord;
    indexes: { 'by-title': string };
  };
}

const dbPromise = openDB<MediaDb>('media-lab-db', 1, {
  upgrade(db) {
    const history = db.createObjectStore('history', { keyPath: 'id' });
    history.createIndex('by-updatedAt', 'updatedAt');
    const favorites = db.createObjectStore('favorites', { keyPath: 'id' });
    favorites.createIndex('by-title', 'title');
  }
});

export async function upsertHistory(item: PlaybackRecord): Promise<void> {
  const db = await dbPromise;
  await db.put('history', item);
}

export async function listRecentHistory(limit = 10): Promise<PlaybackRecord[]> {
  const db = await dbPromise;
  const tx = db.transaction('history');
  const idx = tx.store.index('by-updatedAt');
  const items: PlaybackRecord[] = [];
  for (let cursor = await idx.openCursor(null, 'prev'); cursor && items.length < limit; cursor = await cursor.continue()) {
    items.push(cursor.value);
  }
  await tx.done;
  return items;
}
