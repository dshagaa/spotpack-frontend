// tests/components/import-modal.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import importModal from '../../src/components/import-modal.js';

vi.mock('../../src/api.js', () => ({
  importSchedule: vi.fn(),
}));

import { importSchedule } from '../../src/api.js';

beforeEach(() => {
  vi.clearAllMocks();
  delete globalThis.Alpine;
});

describe('import-modal component', () => {
  describe('init', () => {
    it('listens for open-import-modal event', () => {
      const c = importModal();
      c.init();
      expect(c.open).toBe(false);
      window.dispatchEvent(new CustomEvent('open-import-modal', { detail: 'evt-123' }));
      expect(c.open).toBe(true);
      expect(c.eventId).toBe('evt-123');
    });
  });

  describe('handleFile', () => {
    it('sets file from input element', () => {
      const c = importModal();
      const file = new File(['fake'], 'test.png', { type: 'image/png' });
      const el = { files: [file] };
      c.handleFile(el);
      expect(c.file).toBe(file);
    });

    it('does nothing when no file selected', () => {
      const c = importModal();
      c.file = 'existing';
      c.handleFile({ files: [] });
      expect(c.file).toBe('existing');
    });

    it('clears previous error and result', () => {
      const c = importModal();
      c.error = 'prev error';
      c.result = { count: 5 };
      const file = new File(['fake'], 'test.png', { type: 'image/png' });
      c.handleFile({ files: [file] });
      expect(c.error).toBeNull();
      expect(c.result).toBeNull();
    });
  });

  describe('submit', () => {
    it('shows error when no file', async () => {
      const c = importModal();
      c.eventId = 'evt-1';
      await c.submit();
      expect(c.error).toBe('Seleccioná una imagen');
      expect(importSchedule).not.toHaveBeenCalled();
    });

    it('shows error when no eventId', async () => {
      const c = importModal();
      c.file = new File(['fake'], 'test.png');
      await c.submit();
      expect(c.error).toBe('Seleccioná una imagen');
      expect(importSchedule).not.toHaveBeenCalled();
    });

    it('calls importSchedule with file and eventId', async () => {
      importSchedule.mockResolvedValue({ success: true, count: 3 });
      const c = importModal();
      c.file = new File(['fake'], 'test.png', { type: 'image/png' });
      c.eventId = 'evt-123';
      await c.submit();
      expect(importSchedule).toHaveBeenCalledWith(c.file, 'evt-123');
      expect(c.result).toEqual({ success: true, count: 3 });
      expect(c.loading).toBe(false);
    });

    it('handles API error', async () => {
      importSchedule.mockRejectedValue(new Error('Upload failed'));
      const c = importModal();
      c.file = new File(['fake'], 'test.png');
      c.eventId = 'evt-1';
      await c.submit();
      expect(c.error).toBe('Upload failed');
      expect(c.loading).toBe(false);
    });
  });

  describe('reset', () => {
    it('clears all fields', () => {
      const c = importModal();
      c.file = new File(['fake'], 'test.png');
      c.preview = 'data:...';
      c.error = 'error';
      c.result = { count: 3 };
      c.reset();
      expect(c.file).toBeNull();
      expect(c.preview).toBeNull();
      expect(c.error).toBeNull();
      expect(c.result).toBeNull();
    });
  });

  describe('close', () => {
    it('closes modal and resets', () => {
      const c = importModal();
      c.open = true;
      c.file = new File(['fake'], 'test.png');
      c.preview = 'data:...';
      c.result = { count: 3 };
      c.close();
      expect(c.open).toBe(false);
      expect(c.file).toBeNull();
      expect(c.preview).toBeNull();
      expect(c.result).toBeNull();
    });

    it('calls Alpine.store().refresh() when Alpine is available', () => {
      const refreshMock = vi.fn();
      globalThis.Alpine = { store: vi.fn(() => ({ refresh: refreshMock })) };
      const c = importModal();
      c.close();
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
