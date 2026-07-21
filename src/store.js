// src/store.js — Alpine.js global store for shared state
document.addEventListener('alpine:init', () => {
  Alpine.store('app', {
    // Bump this to trigger event list refresh across components
    refreshCounter: 0,

    refresh() {
      this.refreshCounter++;
    },
  });
});
