const DB_NAME = 'it-infra-offline';
const DB_VERSION = 1;
const STORES = ['incidents', 'assets', 'maintenance', 'deployment-plans', 'users', 'dashboard'];
const SYNC_STORE = 'sync-queue';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      STORES.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      });
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        db.createObjectStore(SYNC_STORE, { autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Cache API response data locally
export async function cacheData(storeName, data) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.put(data, 'data');
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// Get cached data
export async function getCachedData(storeName) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const req = store.get('data');
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// Add a pending mutation to sync queue
export async function addToSyncQueue(entry) {
  const db = await openDB();
  const tx = db.transaction(SYNC_STORE, 'readwrite');
  tx.objectStore(SYNC_STORE).add({ ...entry, timestamp: Date.now() });
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// Get all pending sync entries
export async function getSyncQueue() {
  const db = await openDB();
  const tx = db.transaction(SYNC_STORE, 'readonly');
  const store = tx.objectStore(SYNC_STORE);
  const req = store.getAll();
  const keyReq = store.getAllKeys();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      const entries = req.result.map((val, i) => ({ ...val, _key: keyReq.result[i] }));
      resolve(entries);
    };
    tx.onerror = () => reject(tx.error);
  });
}

// Remove a sync entry after successful sync
export async function removeSyncEntry(key) {
  const db = await openDB();
  const tx = db.transaction(SYNC_STORE, 'readwrite');
  tx.objectStore(SYNC_STORE).delete(key);
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// Clear all sync queue
export async function clearSyncQueue() {
  const db = await openDB();
  const tx = db.transaction(SYNC_STORE, 'readwrite');
  tx.objectStore(SYNC_STORE).clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
