// Small localStorage snapshot cache. API keys never pass through this module.
import { readLocal, writeLocal, removeLocal, KEYS } from './storage.js';

const DEFAULT_TTL = 5 * 60 * 1000;

function snapshotKey(kind, id = '') {
  return kind === 'event' ? `${KEYS.eventSnapshotPrefix}${id}` : KEYS.eventsSnapshot;
}

export function getSnapshot(kind, id, now = Date.now()) {
  const value = readLocal(snapshotKey(kind, id), null);
  if (!value || value.version !== 1 || !value.cachedAt || value.data == null) return null;
  return {
    data: value.data,
    cachedAt: value.cachedAt,
    stale: now - value.cachedAt > (value.ttl || DEFAULT_TTL),
  };
}

export function setSnapshot(kind, id, data, ttl = DEFAULT_TTL, now = Date.now()) {
  return writeLocal(snapshotKey(kind, id), {
    version: 1,
    cachedAt: now,
    ttl,
    data,
  }, 350_000);
}

export function clearSnapshot(kind, id) {
  removeLocal(snapshotKey(kind, id));
}

export function clearAllSnapshots() {
  const storage = globalThis.localStorage;
  if (!storage) return;
  const keys = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key?.startsWith('spotpack:v1:snapshot:')) keys.push(key);
  }
  keys.forEach((key) => removeLocal(key));
}
