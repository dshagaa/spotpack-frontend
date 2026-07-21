// src/components/my-agenda.js — "Mi Agenda" view with attending items
import { getEvents, getEvent } from '../api.js';

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
      // Fetch each event's detail to get items
      const enriched = await Promise.all(
        allEvents.map(async (e) => {
          try {
            const data = await getEvent(e.id);
            const attendingItems = (data.items || []).filter(
              i => Alpine.store('app').isAttending(data.event.id, i.id)
            );
            if (attendingItems.length === 0) return null;
            // Group attending items by day
            const grouped = {};
            for (const item of attendingItems) {
              if (!grouped[item.day_date]) grouped[item.day_date] = [];
              grouped[item.day_date].push(item);
            }
            return {
              ...data.event,
              days: Object.entries(grouped).map(([date, items]) => ({ date, items })),
            };
          } catch {
            return null;
          }
        })
      );
      this.events = enriched.filter(Boolean);
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },

  /** Remove an item from attending */
  removeAttending(item) {
    // We need the event id - extract from the parent context
    // The item doesn't have event_id from the API response
    // So we find the event that contains this item
    for (const evt of this.events) {
      for (const day of evt.days) {
        const found = day.items.find(i => i.id === item.id);
        if (found) {
          Alpine.store('app').setAttending(evt.id, item.id, false);
          // Re-fetch to update UI
          this.fetchAll();
          return;
        }
      }
    }
  },

  formatTime(t) {
    return t ? t.slice(0, 5) : '';
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

  categoryLabel(c) {
    const labels = {
      panel: 'Panel', meetup: 'Meetup', workshop: 'Taller',
      fursuit_games: 'Fursuit Games', dance: 'Baile',
      ceremony: 'Ceremonia', other: 'Otro',
    };
    return labels[c] || c;
  },
});
