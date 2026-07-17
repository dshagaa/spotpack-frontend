// tests/api.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getEvents,
  getEvent,
  createEvent,
  importSchedule,
} from '../src/api.js';

beforeEach(() => {
  localStorage.setItem('spotpack_api_url', 'http://127.0.0.1:54321/functions/v1');
  localStorage.setItem('spotpack_api_key', 'sk-test');
  vi.restoreAllMocks();
});

describe('getEvents', () => {
  it('calls /get-events with auth header', async () => {
    const mock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    });
    const result = await getEvents();
    expect(result.events).toEqual([]);
    expect(mock).toHaveBeenCalledWith(
      'http://127.0.0.1:54321/functions/v1/get-events',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-api-key': 'sk-test',
        }),
      }),
    );
  });

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    });
    await expect(getEvents()).rejects.toThrow('Unauthorized');
  });
});

describe('getEvent', () => {
  it('calls /get-event?id= with encoded UUID', async () => {
    const mock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ event: {}, items: [] }),
    });
    await getEvent('abc-123');
    expect(mock).toHaveBeenCalledWith(
      'http://127.0.0.1:54321/functions/v1/get-event?id=abc-123',
      expect.anything(),
    );
  });
});

describe('createEvent', () => {
  it('sends POST with JSON body', async () => {
    const mock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ event: { id: '1', name: 'Test' } }),
    });
    const result = await createEvent({ name: 'Test', start_date: '2026-01-01', end_date: '2026-01-02' });
    expect(result.event.name).toBe('Test');
    expect(mock).toHaveBeenCalledWith(
      expect.stringContaining('/create-event'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('importSchedule', () => {
  it('sends FormData with image and event_id', async () => {
    const mock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, count: 3, items: [] }),
    });
    const file = new File(['fake'], 'test.png', { type: 'image/png' });
    const result = await importSchedule(file, 'evt-1');
    expect(result.success).toBe(true);
    expect(mock).toHaveBeenCalledWith(
      expect.stringContaining('/import-schedule'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-api-key': 'sk-test' }),
        body: expect.any(FormData),
      }),
    );
  });
});
