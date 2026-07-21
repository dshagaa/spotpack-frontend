// tests/storage.test.js
import { describe, expect, it, beforeEach } from 'vitest';
import { readJSON, readLocalString, readSession, writeJSON, writeSession } from '../src/lib/storage.js';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('storage helpers', () => {
  it('round-trips JSON values', () => {
    expect(writeJSON(localStorage, 'prefs', { showAdult: true })).toBe(true);
    expect(readJSON(localStorage, 'prefs')).toEqual({ showAdult: true });
  });

  it('returns fallback and removes corrupt JSON', () => {
    localStorage.setItem('broken', '{not-json');
    expect(readJSON(localStorage, 'broken', { ok: false })).toEqual({ ok: false });
    expect(localStorage.getItem('broken')).toBeNull();
  });

  it('keeps raw string values raw', () => {
    localStorage.setItem('api-key', 'sk-test');
    expect(readLocalString('api-key')).toBe('sk-test');
  });

  it('uses session storage independently from local storage', () => {
    writeSession('route', { hash: '#/agenda' });
    expect(readSession('route')).toEqual({ hash: '#/agenda' });
    expect(readJSON(localStorage, 'route')).toBeNull();
  });

  it('rejects values over the configured bound', () => {
    expect(writeJSON(localStorage, 'large', { value: '12345' }, 10)).toBe(false);
    expect(localStorage.getItem('large')).toBeNull();
  });
});
