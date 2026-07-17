// src/api.js — HTTP client for SpotPack Supabase Edge Functions

const BASE = () =>
  localStorage.getItem('spotpack_api_url') ||
  'http://127.0.0.1:54321/functions/v1';

function headers() {
  return {
    'x-api-key': localStorage.getItem('spotpack_api_key') || '',
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

export function createEvent(data) {
  return request('/create-event', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateEvent(data) {
  return request('/update-event', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteEvent(id) {
  return request(`/delete-event?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function importSchedule(imageFile, eventId) {
  const fd = new FormData();
  fd.append('image', imageFile);
  fd.append('event_id', eventId);
  const res = await fetch(`${BASE()}/import-schedule`, {
    method: 'POST',
    headers: { 'x-api-key': localStorage.getItem('spotpack_api_key') || '' },
    body: fd,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function createApiKey(data) {
  return request('/create-api-key', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
