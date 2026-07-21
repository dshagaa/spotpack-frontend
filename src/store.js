// src/store.js — Alpine.js global store for shared state
const ATTENDING_KEY = 'spotpack_attending';

function getAttendingMap() {
  try {
    return JSON.parse(localStorage.getItem(ATTENDING_KEY) || '{}');
  } catch {
    return {};
  }
}

document.addEventListener('alpine:init', () => {
  Alpine.store('app', {
    // Bump this to trigger event list refresh across components
    refreshCounter: 0,

    refresh() {
      this.refreshCounter++;
    },

    // --- Attending (localStorage) ---

    /** Get attending status for an item */
    getAttending(eventId, itemId) {
      return getAttendingMap()[`${eventId}:${itemId}`] || false;
    },

    /** Toggle attending for an item */
    toggleAttending(eventId, itemId) {
      const map = getAttendingMap();
      const key = `${eventId}:${itemId}`;
      map[key] = !map[key];
      localStorage.setItem(ATTENDING_KEY, JSON.stringify(map));
      return map[key];
    },

    /** Set attending explicitly */
    setAttending(eventId, itemId, value) {
      const map = getAttendingMap();
      map[`${eventId}:${itemId}`] = !!value;
      localStorage.setItem(ATTENDING_KEY, JSON.stringify(map));
    },

    /** Get all attending item keys — used for Mi Agenda */
    getAllAttending() {
      return getAttendingMap();
    },

    /** Check if an item is attending */
    isAttending(eventId, itemId) {
      return !!getAttendingMap()[`${eventId}:${itemId}`];
    },
  });
});
