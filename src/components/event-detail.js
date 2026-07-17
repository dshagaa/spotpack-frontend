// src/components/event-detail.js — Event view with items grouped by day
import { getEvent } from '../api.js';

export default () => ({
  event: null,
  items: [],
  days: [],
  loading: true,
  error: null,

  async init() {
    const id = location.hash.replace('#/event/', '');
    if (!id) return;
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
