// src/components/api-key.js — API key input with Alpine.js
export default () => ({
  key: localStorage.getItem('spotpack_api_key') || '',
  saved: !!localStorage.getItem('spotpack_api_key'),
  showInput: false,

  save() {
    if (!this.key.trim()) return;
    localStorage.setItem('spotpack_api_key', this.key.trim());
    this.saved = true;
    this.showInput = false;
    // Trigger all components to re-fetch with the new key
    if (typeof window.Alpine !== 'undefined') window.Alpine.store('app').refresh();
  },

  clear() {
    localStorage.removeItem('spotpack_api_key');
    this.key = '';
    this.saved = false;
  },

  toggle() {
    this.showInput = !this.showInput;
    if (this.showInput) this.key = localStorage.getItem('spotpack_api_key') || '';
  },
});
