// tests/components/event-list.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import eventList from '../../src/components/event-list.js';

// Mock the api module
vi.mock('../../src/api.js', () => ({
  getEvents: vi.fn(),
}));

import { getEvents } from '../../src/api.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('event-list component', () => {
  describe('formatDate', () => {
    it('returns Spanish-formatted short date', () => {
      const c = eventList();
      const result = c.formatDate('2026-06-15');
      expect(result).toContain('jun'); // Spanish "jun"
      expect(result).not.toContain('June');
    });

    it('handles date with time part', () => {
      const c = eventList();
      const result = c.formatDate('2026-12-01');
      expect(result).toContain('dic');
    });
  });

  describe('dateRange', () => {
    it('returns single date when start equals end', () => {
      const c = eventList();
      const result = c.dateRange({ start_date: '2026-06-15', end_date: '2026-06-15' });
      expect(result).not.toContain('–');
    });

    it('returns range when dates differ', () => {
      const c = eventList();
      const result = c.dateRange({ start_date: '2026-06-15', end_date: '2026-06-18' });
      expect(result).toContain('–');
    });

    it('does not throw for missing dates', () => {
      const c = eventList();
      const result = c.dateRange({});
      expect(typeof result).toBe('string');
    });
  });

  describe('init', () => {
    it('sets loading to true initially', () => {
      const c = eventList();
      expect(c.loading).toBe(true);
    });

    it('fetches events and sets them on init', async () => {
      getEvents.mockResolvedValue({ events: [{ id: '1', name: 'Test Con' }] });
      const c = eventList();
      await c.init();
      expect(c.events).toEqual([{ id: '1', name: 'Test Con' }]);
      expect(c.loading).toBe(false);
      expect(c.error).toBeNull();
    });

    it('handles empty events array', async () => {
      getEvents.mockResolvedValue({ events: [] });
      const c = eventList();
      await c.init();
      expect(c.events).toEqual([]);
      expect(c.loading).toBe(false);
    });

    it('sets error on fetch failure', async () => {
      getEvents.mockRejectedValue(new Error('Network error'));
      const c = eventList();
      await c.init();
      expect(c.error).toBe('Network error');
      expect(c.loading).toBe(false);
    });

    it('handles response without events key', async () => {
      getEvents.mockResolvedValue({});
      const c = eventList();
      await c.init();
      expect(c.events).toEqual([]);
    });
  });

  describe('fetchEvents', () => {
    it('resets error before fetching', async () => {
      getEvents.mockResolvedValue({ events: [{ id: '1' }] });
      const c = eventList();
      c.error = 'prev error';
      await c.fetchEvents();
      expect(c.error).toBeNull();
    });

    it('sets loading during fetch', () => {
      const c = eventList();
      c.loading = false;
      // Start fetch without awaiting
      getEvents.mockResolvedValue({ events: [] });
      const promise = c.fetchEvents();
      expect(c.loading).toBe(true);
      return promise;
    });
  });
});
