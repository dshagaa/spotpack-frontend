// src/components/my-agenda.js — personal agenda from local attending state
import { getEvent, getEvents } from '../api.js';

export default () => ({
  events: [],
  loading: true,
  error: null,

  async init() {
    await this.fetchAll();
    this.$watch?.('$store.app.refreshCounter', () => this.fetchAll());
  },

  async fetchAll() {
    this.loading = true;
    this.error = null;
    try {
      const { events: allEvents } = await getEvents();
      const enriched = await Promise.all(allEvents.map(async (event) => {
        try {
          const data = await getEvent(event.id);
          const store = Alpine.store('app');
          const attending = (data.items || []).filter((item) => store.isAttending(data.event.id, item.id));
          if (!attending.length) return null;
          const grouped = {};
          attending.forEach((item) => {
            if (!grouped[item.day_date]) grouped[item.day_date] = [];
            grouped[item.day_date].push(item);
          });
          return { ...data.event, days: Object.entries(grouped).map(([date, items]) => ({ date, items })) };
        } catch {
          return null;
        }
      }));
      this.events = enriched.filter(Boolean);
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },

  removeAttending(item) {
    for (const event of this.events) {
      if (event.days.some((day) => day.items.some((candidate) => candidate.id === item.id))) {
        Alpine.store('app').setAttending(event.id, item.id, false);
        return;
      }
    }
  },

  hasConflict(item, day) {
    return day.items.some((other) => other.id !== item.id && item.start_time < other.end_time && item.end_time > other.start_time);
  },

  formatTime(value) { return value ? value.slice(0, 5) : '--:--'; },
  formatDate(value) {
    return value ? new Date(`${value}T00:00:00`).toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Fecha pendiente';
  },
  badgeClass(value) {
    return { '+18': 'bg-danger/15 text-danger border-danger/30', '+21': 'bg-danger/15 text-danger border-danger/30', '+16': 'bg-warning/15 text-warning border-warning/30', general: 'bg-success/15 text-success border-success/30' }[value] || 'bg-gray-700 text-muted border-line';
  },
  categoryLabel(value) {
    return { panel: 'Panel', meetup: 'Meetup', workshop: 'Taller', fursuit_games: 'Fursuit games', dance: 'Baile', ceremony: 'Ceremonia', other: 'Otro' }[value] || value;
  },
});
