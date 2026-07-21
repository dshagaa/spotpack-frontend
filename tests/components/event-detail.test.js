// tests/components/event-detail.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api.js', () => ({
  getEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));

import { getEvent, deleteEvent } from '../../src/api.js';
import eventDetail from '../../src/components/event-detail.js';

beforeEach(() => {
  vi.clearAllMocks();
  delete globalThis.Alpine;
  Object.defineProperty(window, 'location', {
    value: { hash: '#/event/test-id-123' },
    writable: true,
  });
});

describe('event-detail component', () => {
  describe('formatTime', () => {
    it('returns HH:MM from ISO time string', () => {
      const c = eventDetail();
      expect(c.formatTime('09:00:00')).toBe('09:00');
      expect(c.formatTime('14:30:00')).toBe('14:30');
    });

    it('handles already-short time', () => {
      const c = eventDetail();
      expect(c.formatTime('09:00')).toBe('09:00');
    });
  });

  describe('formatDate', () => {
    it('returns Spanish long date', () => {
      const c = eventDetail();
      const result = c.formatDate('2026-06-15');
      expect(result).toContain('lunes');
      expect(result).toContain('junio');
    });
  });

  describe('badgeClass', () => {
    it('returns danger class for +18', () => {
      const c = eventDetail();
      expect(c.badgeClass('+18')).toContain('bg-danger');
      expect(c.badgeClass('+18')).toContain('text-danger');
    });

    it('returns warning class for +16', () => {
      const c = eventDetail();
      expect(c.badgeClass('+16')).toContain('bg-warning');
    });

    it('returns success class for general', () => {
      const c = eventDetail();
      expect(c.badgeClass('general')).toContain('bg-success');
    });

    it('returns default class for unknown', () => {
      const c = eventDetail();
      expect(c.badgeClass('unknown')).toContain('bg-gray-700');
    });
  });

  describe('categoryIcon', () => {
    it('returns correct emoji for known categories', () => {
      const c = eventDetail();
      expect(c.categoryIcon('panel')).toBe('🎤');
      expect(c.categoryIcon('meetup')).toBe('🤝');
      expect(c.categoryIcon('dance')).toBe('💃');
      expect(c.categoryIcon('ceremony')).toBe('🎉');
    });

    it('returns default emoji for unknown', () => {
      const c = eventDetail();
      expect(c.categoryIcon('unknown')).toBe('📋');
    });
  });

  describe('loadEvent', () => {
    it('groups items by day_date', async () => {
      getEvent.mockResolvedValue({
        event: { id: 'evt-1', name: 'FurryCon' },
        items: [
          { id: 'i1', day_date: '2026-06-15', title: 'Panel A' },
          { id: 'i2', day_date: '2026-06-15', title: 'Panel B' },
          { id: 'i3', day_date: '2026-06-16', title: 'Workshop' },
        ],
      });
      const c = eventDetail();
      await c.loadEvent();
      expect(c.days).toHaveLength(2);
      expect(c.days[0].items).toHaveLength(2);
      expect(c.days[1].items).toHaveLength(1);
      expect(c.loading).toBe(false);
      expect(c.error).toBeNull();
    });

    it('handles empty items array', async () => {
      getEvent.mockResolvedValue({ event: { id: 'evt-1' }, items: [] });
      const c = eventDetail();
      await c.loadEvent();
      expect(c.days).toEqual([]);
      expect(c.loading).toBe(false);
    });

    it('handles missing items key', async () => {
      getEvent.mockResolvedValue({ event: { id: 'evt-1' } });
      const c = eventDetail();
      await c.loadEvent();
      expect(c.days).toEqual([]);
    });

    it('sets error on fetch failure', async () => {
      getEvent.mockRejectedValue(new Error('Not found'));
      const c = eventDetail();
      await c.loadEvent();
      expect(c.error).toBe('Not found');
      expect(c.loading).toBe(false);
    });
  });

  describe('editEvent', () => {
    it('dispatches open-edit-modal with event data', () => {
      const dispatchSpy = vi.fn();
      const c = eventDetail();
      c.event = { id: 'evt-1', name: 'FurryCon', start_date: '2026-06-15', end_date: '2026-06-18', location: null };
      // Mock Alpine $dispatch
      c.$dispatch = dispatchSpy;
      c.editEvent();
      expect(dispatchSpy).toHaveBeenCalledWith('open-edit-modal', {
        id: 'evt-1',
        name: 'FurryCon',
        start_date: '2026-06-15',
        end_date: '2026-06-18',
        location: '',
      });
    });
  });

  describe('confirmDelete', () => {
    it('calls deleteEvent and redirects on success', async () => {
      deleteEvent.mockResolvedValue({ deleted: true });
      const c = eventDetail();
      c.event = { id: 'evt-1' };
      c.showDeleteConfirm = true;
      await c.confirmDelete();
      expect(deleteEvent).toHaveBeenCalledWith('evt-1');
      expect(c.showDeleteConfirm).toBe(false);
      expect(c.deleting).toBe(false);
    });

    it('sets error on delete failure', async () => {
      deleteEvent.mockRejectedValue(new Error('Forbidden'));
      const c = eventDetail();
      c.event = { id: 'evt-1' };
      await c.confirmDelete();
      expect(c.error).toBe('Forbidden');
      expect(c.deleting).toBe(false);
    });
  });

  describe('cancelDelete', () => {
    it('hides delete confirmation', () => {
      const c = eventDetail();
      c.showDeleteConfirm = true;
      c.cancelDelete();
      expect(c.showDeleteConfirm).toBe(false);
    });
  });
});
