// src/components/event-detail.js — Event view with items grouped by day
import { getEvent, deleteEvent } from '../api.js';

export default () => ({
  event: null,
  items: [],
  days: [],
  loading: true,
  error: null,
  showDeleteConfirm: false,
  deleting: false,

  async init() {
    await this.loadEvent();
    // Watch store for refresh (e.g., after import or edit)
    this.$watch?.('$store.app.refreshCounter', () => this.loadEvent());
  },

  async loadEvent() {
    const id = location.hash.replace('#/event/', '');
    if (!id) return;
    this.loading = true;
    this.error = null;
    try {
      const data = await getEvent(id);
      this.event = data.event;
      // Group items by day_date
      const grouped = {};
      for (const item of data.items || []) {
        const day = item.day_date;
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(item);
      }
      this.days = Object.entries(grouped).map(([date, items]) => ({ date, items }));
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },

  editEvent() {
    this.$dispatch('open-edit-modal', {
      id: this.event.id,
      name: this.event.name,
      start_date: this.event.start_date,
      end_date: this.event.end_date,
      location: this.event.location || '',
    });
  },

  async confirmDelete() {
    this.deleting = true;
    try {
      await deleteEvent(this.event.id);
      this.showDeleteConfirm = false;
      // Navigate back to list
      location.hash = '#/';
      if (typeof Alpine !== 'undefined') Alpine.store('app').refresh();
    } catch (e) {
      this.error = e.message;
    } finally {
      this.deleting = false;
    }
  },

  cancelDelete() {
    this.showDeleteConfirm = false;
  },

  formatTime(t) {
    return t.slice(0, 5);
  },

  formatDate(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('es-MX', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  },

  badgeClass(c) {
    return {
      '+18': 'bg-danger/20 text-danger',
      '+16': 'bg-warning/20 text-warning',
      '+21': 'bg-danger/20 text-danger',
      general: 'bg-success/20 text-success',
    }[c] || 'bg-gray-700 text-gray-300';
  },

  categoryIcon(c) {
    return {
      panel: '🎤', meetup: '🤝', workshop: '🔧',
      fursuit_games: '🎮', dance: '💃', ceremony: '🎉', other: '📋',
    }[c] || '📋';
  },
});
