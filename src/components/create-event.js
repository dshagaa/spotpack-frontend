// src/components/create-event.js — Modal form for new event
import { createEvent } from '../api.js';

export default () => ({
  open: false,
  name: '',
  startDate: '',
  endDate: '',
  location: '',
  loading: false,
  error: null,
  success: false,

  reset() {
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
      await createEvent({
        name: this.name.trim(),
        start_date: this.startDate,
        end_date: this.endDate,
        location: this.location.trim(),
      });
      this.success = true;
      setTimeout(() => {
        this.open = false;
        this.reset();
        // Refresh event list
        window.dispatchEvent(new CustomEvent('event-created'));
      }, 1000);
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },
});
