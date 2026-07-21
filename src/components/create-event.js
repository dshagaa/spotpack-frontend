// src/components/create-event.js — Modal form for creating and editing events
import { createEvent, updateEvent } from '../api.js';

export default () => ({
  open: false,
  editId: null,
  name: '',
  startDate: '',
  endDate: '',
  location: '',
  loading: false,
  error: null,
  success: false,

  get isEdit() {
    return !!this.editId;
  },

  init() {
    // Listen for both create and edit events
    window.addEventListener('open-create-modal', (e) => {
      this.reset();
      this.editId = null;
      this.open = true;
    });
    window.addEventListener('open-edit-modal', (e) => {
      const evt = e.detail;
      this.reset();
      this.editId = evt.id;
      this.name = evt.name || '';
      this.startDate = evt.start_date || '';
      this.endDate = evt.end_date || '';
      this.location = evt.location || '';
      this.open = true;
    });
  },

  reset() {
    this.editId = null;
    this.name = '';
    this.startDate = '';
    this.endDate = '';
    this.location = '';
    this.error = null;
    this.success = false;
  },

  async submit() {
    if (!this.name.trim() || !this.startDate || !this.endDate) {
      this.error = 'Nombre y fechas son obligatorios';
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const data = {
        name: this.name.trim(),
        start_date: this.startDate,
        end_date: this.endDate,
        location: this.location.trim(),
      };
      if (this.isEdit) {
        data.id = this.editId;
        await updateEvent(data);
      } else {
        await createEvent(data);
      }
      this.success = true;
      setTimeout(() => {
        this.open = false;
        this.reset();
        // Trigger refresh via store
        if (typeof Alpine !== 'undefined') Alpine.store('app').refresh();
      }, 1000);
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },
});
