// tests/components/api-key.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiKey from '../../src/components/api-key.js';

beforeEach(() => {
  localStorage.clear();
});

describe('api-key component', () => {
  describe('save', () => {
    it('stores key in localStorage', () => {
      const c = apiKey();
      c.key = 'sk-sp-test123';
      c.save();
      expect(localStorage.getItem('spotpack_api_key')).toBe('sk-sp-test123');
      expect(c.saved).toBe(true);
      expect(c.showInput).toBe(false);
    });

    it('trims whitespace before saving', () => {
      const c = apiKey();
      c.key = '  sk-sp-test123  ';
      c.save();
      expect(localStorage.getItem('spotpack_api_key')).toBe('sk-sp-test123');
    });

    it('does not save empty key', () => {
      localStorage.setItem('spotpack_api_key', 'existing');
      const c = apiKey();
      c.key = '   ';
      c.save();
      expect(localStorage.getItem('spotpack_api_key')).toBe('existing');
    });
  });

  describe('clear', () => {
    it('removes key from localStorage', () => {
      localStorage.setItem('spotpack_api_key', 'sk-old');
      const c = apiKey();
      c.saved = true;
      c.clear();
      expect(localStorage.getItem('spotpack_api_key')).toBeNull();
      expect(c.key).toBe('');
      expect(c.saved).toBe(false);
    });
  });

  describe('toggle', () => {
    it('toggles showInput from false to true', () => {
      const c = apiKey();
      c.toggle();
      expect(c.showInput).toBe(true);
    });

    it('toggles showInput from true to false', () => {
      const c = apiKey();
      c.showInput = true;
      c.toggle();
      expect(c.showInput).toBe(false);
    });

    it('loads key from localStorage when opening', () => {
      localStorage.setItem('spotpack_api_key', 'sk-from-store');
      const c = apiKey();
      c.key = '';
      c.toggle();
      expect(c.key).toBe('sk-from-store');
    });
  });

  describe('initial state', () => {
    it('sets saved=true when key exists in localStorage', () => {
      localStorage.setItem('spotpack_api_key', 'sk-existing');
      const c = apiKey();
      expect(c.saved).toBe(true);
      expect(c.key).toBe('sk-existing');
    });

    it('sets saved=false when no key exists', () => {
      const c = apiKey();
      expect(c.saved).toBe(false);
    });
  });
});
