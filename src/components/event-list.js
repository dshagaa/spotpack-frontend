// src/components/event-list.js — fast cached-first home view
import { getEvents } from '../api.js';
import { getSnapshot, setSnapshot } from '../lib/cache.js';

export default () => ({
  events: [],
  loading: true,
  error: null,
  stale: false,
  cachedAt: null,

  async init() {
    await this.fetchEvents();
    this.$watch?.('$store.app.view', (view) => { if (view === 'list') this.fetchEvents(); });
    this.$watch?.('$store.app.refreshCounter', () => this.fetchEvents());
  },

  applyResponse(data, cache = null) {
    this.events = data?.events || [];
    this.stale = !!cache?.stale;
    this.cachedAt = cache?.cachedAt || null;
  },

  async fetchEvents({ force = false } = {}) {
    this.loading = true;
    this.error = null;
    const cached = !force ? getSnapshot('events') : null;

    if (cached) {
      this.applyResponse(cached.data, cached);
      this.loading = false;
      // Fresh data updates the UI without blocking the first paint.
      getEvents().then((data) => {
        setSnapshot('events', '', data);
        this.applyResponse(data);
      }).catch(() => {
        this.stale = true;
      });
      return;
    }

    try {
      const data = await getEvents();
      setSnapshot('events', '', data);
      this.applyResponse(data);
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },

  refresh() {
    return this.fetchEvents({ force: true });
  },

  formatDate(d) {
    if (!d) return 'Fecha pendiente';
    return new Date(`${d}T00:00:00`).toLocaleDateString('es-MX', {
      month: 'short', day: 'numeric',
    });
  },

  dateRange(e) {
    if (!e?.start_date) return 'Fechas pendientes';
    if (e.start_date === e.end_date) return this.formatDate(e.start_date);
    return `${this.formatDate(e.start_date)} – ${this.formatDate(e.end_date)}`;
  },

  formatCachedAt() {
    if (!this.cachedAt) return '';
    return new Date(this.cachedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  },
});
