// src/components/import-modal.js — Upload image → MiMo → schedule items
import { importSchedule } from '../api.js';

export default () => ({
  open: false,
  eventId: null,
  file: null,
  preview: null,
  loading: false,
  error: null,
  result: null,

  init() {
    // Listen for open-import-modal event with eventId detail
    window.addEventListener('open-import-modal', (e) => {
      this.eventId = e.detail;
      this.open = true;
    });
  },

  handleFile(el) {
    const f = el.files[0];
    if (!f) return;
    this.file = f;
    this.error = null;
    this.result = null;
    const reader = new FileReader();
    reader.onload = (e) => this.preview = e.target.result;
    reader.readAsDataURL(f);
  },

  async submit() {
    if (!this.file || !this.eventId) {
      this.error = 'Seleccioná una imagen';
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const data = await importSchedule(this.file, this.eventId);
      this.result = data;
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },

  close() {
    this.open = false;
    this.reset();
    // Refresh the event detail and list via store
    if (typeof Alpine !== 'undefined') Alpine.store('app').refresh();
  },

  reset() {
    this.file = null;
    this.preview = null;
    this.error = null;
    this.result = null;
  },
});
