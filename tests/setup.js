// tests/setup.js — Vitest global setup
import { vi } from 'vitest';

const store = {};
function createStorage() {
  const values = {};
  return {
    getItem: vi.fn((key) => values[key] ?? null),
    setItem: vi.fn((key, value) => { values[key] = String(value); }),
    removeItem: vi.fn((key) => { delete values[key]; }),
    clear: vi.fn(() => { Object.keys(values).forEach(k => delete values[k]); }),
    key: vi.fn((index) => Object.keys(values)[index] ?? null),
    get length() { return Object.keys(values).length; },
  };
}

globalThis.localStorage = createStorage();
globalThis.sessionStorage = createStorage();
globalThis.history = { pushState: vi.fn(), replaceState: vi.fn() };
