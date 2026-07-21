// src/store.js — shared UI preferences and local attending state
import Alpine from 'alpinejs';
import { KEYS, readLocal, readSession, writeLocal, writeSession } from './lib/storage.js';

const DEFAULT_UI = {
  route: '',
  dayByEvent: {},
  search: '',
  category: 'all',
  showAdult: false,
};

function loadUI() {
  return { ...DEFAULT_UI, ...(readSession(KEYS.ui, {}) || {}) };
}

function loadAttending() {
  return readLocal(KEYS.attending, {}) || {};
}

function saveAttending(value) {
  writeLocal(KEYS.attending, value, 100_000);
}

document.addEventListener('alpine:init', () => {
  Alpine.store('app', {
    refreshCounter: 0,
    view: 'list',
    online: navigator.onLine,
    ui: loadUI(),

    init() {
      window.addEventListener('online', () => { this.online = true; });
      window.addEventListener('offline', () => { this.online = false; });
    },

    refresh() {
      this.refreshCounter += 1;
    },

    setView(view) {
      this.view = view;
    },

    rememberUI(patch) {
      this.ui = { ...this.ui, ...patch };
      writeSession(KEYS.ui, this.ui, 20_000);
    },

    restoreRoute() {
      return this.ui.route || '/';
    },

    rememberRoute(route) {
      this.rememberUI({ route });
    },

    getDay(eventId, fallback) {
      return this.ui.dayByEvent?.[eventId] || fallback;
    },

    rememberDay(eventId, day) {
      this.rememberUI({ dayByEvent: { ...this.ui.dayByEvent, [eventId]: day } });
    },

    isAttending(eventId, itemId) {
      return !!loadAttending()[`${eventId}:${itemId}`];
    },

    getAttending(eventId, itemId) {
      return this.isAttending(eventId, itemId);
    },

    toggleAttending(eventId, itemId) {
      const map = loadAttending();
      const key = `${eventId}:${itemId}`;
      map[key] = !map[key];
      saveAttending(map);
      this.refreshCounter += 1;
      return map[key];
    },

    setAttending(eventId, itemId, value) {
      const map = loadAttending();
      map[`${eventId}:${itemId}`] = !!value;
      saveAttending(map);
      this.refreshCounter += 1;
    },

    getAllAttending() {
      return loadAttending();
    },
  });
});
