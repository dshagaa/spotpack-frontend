// tests/cache.test.js
import { beforeEach, describe, expect, it } from 'vitest';
import { clearSnapshot, getSnapshot, setSnapshot } from '../src/lib/cache.js';

beforeEach(() => localStorage.clear());

describe('snapshot cache', () => {
  it('stores and reads a fresh snapshot', () => {
    setSnapshot('events', '', { events: [{ id: '1' }] }, 1000, 1000);
    expect(getSnapshot('events', '', 1500)).toEqual({
      data: { events: [{ id: '1' }] },
      cachedAt: 1000,
      stale: false,
    });
  });

  it('marks snapshots stale after TTL', () => {
    setSnapshot('event', 'evt-1', { items: [] }, 1000, 1000);
    expect(getSnapshot('event', 'evt-1', 2500).stale).toBe(true);
  });

  it('clears a snapshot', () => {
    setSnapshot('event', 'evt-1', { event: { id: 'evt-1' } }, 1000, 1000);
    clearSnapshot('event', 'evt-1');
    expect(getSnapshot('event', 'evt-1', 1000)).toBeNull();
  });

  it('ignores malformed or incomplete snapshots', () => {
    localStorage.setItem('spotpack:v1:snapshot:events', '{bad');
    expect(getSnapshot('events')).toBeNull();
    localStorage.setItem('spotpack:v1:snapshot:events', JSON.stringify({ version: 1 }));
    expect(getSnapshot('events')).toBeNull();
  });
});
