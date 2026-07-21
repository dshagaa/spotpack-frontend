// Storage helpers with defensive parsing and bounded JSON values.
export const STORAGE_VERSION = 1;

export const KEYS = {
  eventsSnapshot: 'spotpack:v1:snapshot:events',
  eventSnapshotPrefix: 'spotpack:v1:snapshot:event:',
  ui: 'spotpack:v1:ui',
  attending: 'spotpack:v1:attending',
  apiUrl: 'spotpack_api_url',
  apiKey: 'spotpack_api_key',
};

function storageOrNull(storage) {
  try {
    return storage || null;
  } catch {
    return null;
  }
}

export function readJSON(storage, key, fallback = null) {
  const target = storageOrNull(storage);
  if (!target) return fallback;
  try {
    const raw = target.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    try { target.removeItem(key); } catch { /* storage can be unavailable */ }
    return fallback;
  }
}

export function writeJSON(storage, key, value, maxBytes = 250_000) {
  const target = storageOrNull(storage);
  if (!target) return false;
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > maxBytes) return false;
    target.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export function remove(storage, key) {
  const target = storageOrNull(storage);
  if (!target) return;
  try { target.removeItem(key); } catch { /* ignore unavailable storage */ }
}

export function readString(storage, key, fallback = '') {
  const target = storageOrNull(storage);
  if (!target) return fallback;
  try {
    return target.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function readLocal(key, fallback = null) {
  return readJSON(globalThis.localStorage, key, fallback);
}

export function readLocalString(key, fallback = '') {
  return readString(globalThis.localStorage, key, fallback);
}

export function writeLocal(key, value, maxBytes) {
  return writeJSON(globalThis.localStorage, key, value, maxBytes);
}

export function readSession(key, fallback = null) {
  return readJSON(globalThis.sessionStorage, key, fallback);
}

export function writeSession(key, value, maxBytes) {
  return writeJSON(globalThis.sessionStorage, key, value, maxBytes);
}

export function removeLocal(key) {
  remove(globalThis.localStorage, key);
}

export function removeSession(key) {
  remove(globalThis.sessionStorage, key);
}
