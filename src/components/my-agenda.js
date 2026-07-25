// src/components/my-agenda.js — personal agenda from local attending state
import { getEvent, getEvents } from '../api.js';

export default () => ({
  events: [],
  loading: true,
  error: null,
  viewMode: 'day', // 'day' | 'schedule'
  activeDay: null,
  agendaDays: [],
  sg: null,

  async init() {
    if (location.pathname === '/agenda') await this.fetchAll();
    this.$watch?.('$store.app.view', (view) => { if (view === 'agenda') this.fetchAll(); });
    this.$watch?.('$store.app.refreshCounter', () => this.fetchAll());
    this.$watch?.('activeDay', () => { this.sg = this.scheduleGrid(); });
    this.$watch?.('viewMode', (mode) => { if (mode === 'schedule' && !this.sg) this.sg = this.scheduleGrid(); });
  },

  async fetchAll() {
    this.loading = true;
    this.error = null;
    try {
      const { events: allEvents } = await getEvents();
      const enriched = await Promise.all(allEvents.map(async (event) => {
        try {
          const data = await getEvent(event.id);
          const store = window.Alpine?.store?.('app');
          const attending = (data.items || []).filter(
            (item) => store.isAttending(data.event.id, item.id)
          );
          if (!attending.length) return null;
          const grouped = {};
          attending.forEach((item) => {
            if (!grouped[item.day_date]) grouped[item.day_date] = [];
            grouped[item.day_date].push(item);
          });
          return {
            ...data.event,
            days: Object.entries(grouped).map(([date, items]) => ({ date, items })),
          };
        } catch {
          return null;
        }
      }));
      this.events = enriched.filter(Boolean);

      // Build flat agenda days with event context (for schedule view)
      const byDay = {};
      for (const event of this.events) {
        for (const day of event.days) {
          for (const item of day.items) {
            const key = item.day_date;
            if (!byDay[key]) byDay[key] = [];
            byDay[key].push({ ...item, _eventName: event.name, _eventId: event.id });
          }
        }
      }
      this.agendaDays = Object.entries(byDay)
        .map(([date, items]) => ({ date, items }))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (this.agendaDays.length > 0) {
        this.activeDay = this.agendaDays[0].date;
        this.sg = this.scheduleGrid();
      }
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },

  removeAttending(item) {
    const eventId = item._eventId ||
      this.events.find((e) => e.days.some((d) => d.items.some((i) => i.id === item.id)))?.id;
    if (eventId) {
      window.Alpine?.store?.('app')?.setAttending(eventId, item.id, false);
    }
  },

  hasConflict(item, day) {
    return day.items.some(
      (other) =>
        other.id !== item.id &&
        item.start_time < other.end_time &&
        item.end_time > other.start_time
    );
  },

  // ── Schedule view ──

  selectDay(date) {
    this.activeDay = date;
  },

  currentDayItems() {
    const day = this.agendaDays.find((d) => d.date === this.activeDay);
    return day?.items || [];
  },

  scheduleGrid() {
    const items = this.currentDayItems();
    if (items.length === 0) return { rooms: [], slots: [], grid: {} };

    const rooms = [...new Set(items.map((i) => i.room).filter(Boolean))].sort();
    if (rooms.length === 0) rooms.push('Sin sala');

    const byTime = {};
    for (const item of items) {
      const t = item.start_time;
      if (!byTime[t]) byTime[t] = {};
      const r = item.room || 'Sin sala';
      if (!byTime[t][r]) byTime[t][r] = [];
      byTime[t][r].push(item);
    }

    const slots = Object.keys(byTime).sort();
    return { rooms, slots, grid: byTime };
  },

  // ── Shared helpers ──

  formatTime(value) { return value ? value.slice(0, 5) : '--:--'; },
  formatDate(value) {
    return value
      ? new Date(`${value}T00:00:00`).toLocaleDateString('es-MX', {
          weekday: 'long', month: 'long', day: 'numeric',
        })
      : 'Fecha pendiente';
  },
  badgeClass(value) {
    return {
      '+18': 'bg-danger/15 text-danger border-danger/30',
      '+21': 'bg-danger/15 text-danger border-danger/30',
      '+16': 'bg-warning/15 text-warning border-warning/30',
      general: 'bg-success/15 text-success border-success/30',
    }[value] || 'bg-gray-700 text-muted border-line';
  },
  categoryLabel(value) {
    return {
      panel: 'Panel', meetup: 'Meetup', workshop: 'Taller',
      fursuit_games: 'Fursuit games', dance: 'Baile',
      ceremony: 'Ceremonia', other: 'Otro',
    }[value] || value;
  },
});
