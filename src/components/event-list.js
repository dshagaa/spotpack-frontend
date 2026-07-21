// src/components/event-list.js — Home page with event cards
import { getEvents } from '../api.js';

export default () => ({
  events: [],
  loading: true,
  error: null,

  async init() {
    await this.fetchEvents();
    // Watch store for refresh triggers (e.g., after event creation)
    this.$watch?.('$store.app.refreshCounter', () => this.fetchEvents());
  },

  async fetchEvents() {
    this.loading = true;
    this.error = null;
    try {
      this.events = (await getEvents()).events || [];
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },

  formatDate(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('es-MX', {
      month: 'short', day: 'numeric',
    });
  },

  dateRange(e) {
    if (e.start_date === e.end_date) return this.formatDate(e.start_date);
    return `${this.formatDate(e.start_date)} – ${this.formatDate(e.end_date)}`;
  },
});
