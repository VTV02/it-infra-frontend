import api from './api';
import { getSyncQueue, removeSyncEntry } from './offlineDB';

let isSyncing = false;
const listeners = new Set();

export function onSyncStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(status) {
  listeners.forEach((fn) => fn(status));
}

export async function processSync() {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  const queue = await getSyncQueue();
  if (queue.length === 0) { isSyncing = false; return; }

  notify({ syncing: true, pending: queue.length });
  let synced = 0;
  let failed = 0;

  for (const entry of queue) {
    try {
      if (entry.method === 'POST') {
        await api.post(entry.url, entry.data);
      } else if (entry.method === 'PUT') {
        await api.put(entry.url, entry.data);
      } else if (entry.method === 'DELETE') {
        await api.delete(entry.url);
      }
      await removeSyncEntry(entry._key);
      synced++;
    } catch (err) {
      // If 4xx error (bad data), remove from queue to avoid infinite retry
      if (err.response?.status >= 400 && err.response?.status < 500) {
        await removeSyncEntry(entry._key);
      }
      failed++;
    }
  }

  notify({ syncing: false, synced, failed, pending: 0 });
  isSyncing = false;
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(processSync, 1000);
  });
}
