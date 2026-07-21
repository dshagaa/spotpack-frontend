// tests/components/create-event.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock api module
vi.mock('../../src/api.js', () => ({
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
}));

import { createEvent, updateEvent } from '../../src/api.js';
import createEventComp from '../../src/components/create-event.js';

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  delete globalThis.Alpine;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('create-event component', () => {
  describe('isEdit', () => {
    it('returns false when editId is null', () => {
      const c = createEventComp();
      expect(c.isEdit).toBe(false);
    });

    it('returns true when editId is set', () => {
      const c = createEventComp();
      c.editId = 'evt-123';
      expect(c.isEdit).toBe(true);
    });
  });

  describe('init', () => {
    it('listens for open-create-modal event', () => {
      const c = createEventComp();
      c.init();
      window.dispatchEvent(new CustomEvent('open-create-modal'));
      expect(c.open).toBe(true);
      expect(c.isEdit).toBe(false);
    });

    it('listens for open-edit-modal event and pre-fills form', () => {
      const c = createEventComp();
      c.init();
      window.dispatchEvent(new CustomEvent('open-edit-modal', {
        detail: { id: 'evt-1', name: 'FurryCon', start_date: '2026-06-15', end_date: '2026-06-18', location: 'CDMX' },
      }));
      expect(c.open).toBe(true);
      expect(c.isEdit).toBe(true);
      expect(c.name).toBe('FurryCon');
      expect(c.startDate).toBe('2026-06-15');
      expect(c.endDate).toBe('2026-06-18');
      expect(c.location).toBe('CDMX');
    });
  });

  describe('reset', () => {
    it('clears all fields including editId', () => {
      const c = createEventComp();
      c.editId = 'evt-1';
      c.name = 'Test';
      c.startDate = '2026-01-01';
      c.endDate = '2026-01-02';
      c.location = 'CDMX';
      c.error = 'oops';
      c.success = true;
      c.reset();
      expect(c.editId).toBeNull();
      expect(c.name).toBe('');
      expect(c.startDate).toBe('');
      expect(c.endDate).toBe('');
      expect(c.location).toBe('');
      expect(c.error).toBeNull();
      expect(c.success).toBe(false);
    });
  });

  describe('submit', () => {
    it('shows error when name is empty', async () => {
      const c = createEventComp();
      await c.submit();
      expect(c.error).toBe('Nombre y fechas son obligatorios');
      expect(createEvent).not.toHaveBeenCalled();
    });

    it('shows error when startDate is empty', async () => {
      const c = createEventComp();
      c.name = 'Test';
      c.endDate = '2026-01-02';
      await c.submit();
      expect(c.error).toBe('Nombre y fechas son obligatorios');
    });

    it('shows error when endDate is empty', async () => {
      const c = createEventComp();
      c.name = 'Test';
      c.startDate = '2026-01-01';
      await c.submit();
      expect(c.error).toBe('Nombre y fechas son obligatorios');
    });

    it('calls createEvent when not in edit mode', async () => {
      createEvent.mockResolvedValue({ event: { id: '1', name: 'Test' } });
      const c = createEventComp();
      c.name = 'FurryCon 2026';
      c.startDate = '2026-06-15';
      c.endDate = '2026-06-18';
      c.location = 'CDMX';
      await c.submit();
      expect(createEvent).toHaveBeenCalledWith({
        name: 'FurryCon 2026',
        start_date: '2026-06-15',
        end_date: '2026-06-18',
        location: 'CDMX',
      });
      expect(updateEvent).not.toHaveBeenCalled();
      expect(c.success).toBe(true);
    });

    it('calls updateEvent when in edit mode', async () => {
      updateEvent.mockResolvedValue({ event: { id: 'evt-1', name: 'Updated' } });
      const c = createEventComp();
      c.editId = 'evt-1';
      c.name = 'Updated Con';
      c.startDate = '2026-07-01';
      c.endDate = '2026-07-04';
      c.location = 'NYC';
      await c.submit();
      expect(updateEvent).toHaveBeenCalledWith({
        id: 'evt-1',
        name: 'Updated Con',
        start_date: '2026-07-01',
        end_date: '2026-07-04',
        location: 'NYC',
      });
      expect(createEvent).not.toHaveBeenCalled();
      expect(c.success).toBe(true);
    });

    it('handles API error', async () => {
      createEvent.mockRejectedValue(new Error('Server error'));
      const c = createEventComp();
      c.name = 'Test';
      c.startDate = '2026-01-01';
      c.endDate = '2026-01-02';
      await c.submit();
      expect(c.error).toBe('Server error');
      expect(c.success).toBe(false);
    });

    it('calls Alpine.store().refresh() when Alpine is available', async () => {
      const refreshMock = vi.fn();
      globalThis.Alpine = { store: vi.fn(() => ({ refresh: refreshMock })) };

      createEvent.mockResolvedValue({ event: { id: '1' } });
      const c = createEventComp();
      c.name = 'Test';
      c.startDate = '2026-01-01';
      c.endDate = '2026-01-02';
      await c.submit();
      vi.advanceTimersByTime(1500);
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
