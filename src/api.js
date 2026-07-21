// src/api.js — authenticated API client with explicit network-only mutations
import { clearAllSnapshots, clearSnapshot, getSnapshot, setSnapshot } from './lib/cache.js';
import { KEYS, readLocalString } from './lib/storage.js';

const BASE = () => readLocalString(KEYS.apiUrl, '') ||
  'http://127.0.0.1:54321/functions/v1';

function headers() {
  return {
    'x-api-key': readLocalString(KEYS.apiKey, ''),
    'Content-Type': 'application/json',
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE()}${path}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function getEvents() {
  return request('/get-events');
}

export function getEvent(id) {
  return request(`/get-event?id=${encodeURIComponent(id)}`);
}

export async function getEventsCached({ force = false } = {}) {
  const cached = !force ? getSnapshot('events') : null;
  if (cached && !cached.stale) {
    // Revalidate silently; caller gets a fast paint from local data.
    request('/get-events').then((fresh) => setSnapshot('events', '', fresh)).catch(() => {});
    return { ...cached.data, _cache: cached };
  }
  try {
    const fresh = await getEvents();
    setSnapshot('events', '', fresh);
    return fresh;
  } catch (error) {
    if (cached) return { ...cached.data, _cache: cached };
    throw error;
  }
}

export async function getEventCached(id, { force = false } = {}) {
  const cached = !force ? getSnapshot('event', id) : null;
  if (cached && !cached.stale) {
    request(`/get-event?id=${encodeURIComponent(id)}`)
      .then((fresh) => setSnapshot('event', id, fresh)).catch(() => {});
    return { ...cached.data, _cache: cached };
  }
  try {
    const fresh = await getEvent(id);
    setSnapshot('event', id, fresh);
    return fresh;
  } catch (error) {
    if (cached) return { ...cached.data, _cache: cached };
    throw error;
  }
}

export function invalidateEventCache(id) {
  clearSnapshot('event', id);
  clearSnapshot('events');
}

export function invalidateAllCache() {
  clearAllSnapshots();
}

export function createEvent(data) {
  return request('/create-event', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then((result) => { invalidateAllCache(); return result; });
}

export function updateEvent(data) {
  return request('/update-event', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }).then((result) => { invalidateEventCache(data.id); return result; });
}

export function deleteEvent(id) {
  return request(`/delete-event?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).then((result) => { invalidateEventCache(id); return result; });
}

export async function importSchedule(imageFile, eventId) {
  const fd = new FormData();
  fd.append('image', imageFile);
  fd.append('event_id', eventId);
  const res = await fetch(`${BASE()}/import-schedule`, {
    method: 'POST',
    headers: { 'x-api-key': readLocalString(KEYS.apiKey, '') },
    body: fd,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  const result = await res.json();
  invalidateEventCache(eventId);
  return result;
}

export function createApiKey(data) {
  return request('/create-api-key', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
