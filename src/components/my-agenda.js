// src/components/my-agenda.js — personal agenda from local attending state
import { getEvent, getEvents } from '../api.js';

export default () => ({
  // ── Event list state ──
  events: [],
  loading: true,
  error: null,
  subPage: 'list', // 'list' | 'detail'

  // ── Event detail state (subPage === 'detail') ──
  focusedEvent: null,
  focusedActiveDay: null,
  focusedViewMode: 'day', // 'day' | 'schedule'
  focusedSg: null,
  detailItem: null,      // detail dialog
  confirmItem: null,     // remove confirmation
  confirmClean: null,    // clean-all confirmation event

  // ── Cross-event schedule (legacy, not used in new flow) ──
  activeDay: null,
  agendaDays: [],
  sg: null,
  viewMode: 'day',

  async init() {
    if (location.pathname === '/agenda') await this.fetchAll();
    this.$watch?.('$store.app.view', (view) => { if (view === 'agenda') this.fetchAll(); });
  },

  async fetchAll() {
    this.loading = true;
    this.error = null;
    this.subPage = 'list';
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
            attendingCount: attending.length,
          };
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

  // ── Navigation ──

  selectEvent(event) {
    this.focusedEvent = event;
    this.focusedActiveDay = event.days[0]?.date || null;
    this.focusedViewMode = 'day';
    this.focusedSg = this.computeFocusedGrid();
    this.detailItem = null;
    this.confirmItem = null;
    this.subPage = 'detail';
  },

  backToEvents() {
    this.subPage = 'list';
    this.focusedEvent = null;
    this.focusedSg = null;
  },

  // ── Focused event helpers ──

  focusedDays() {
    return this.focusedEvent?.days || [];
  },

  focusedSelectDay(date) {
    this.focusedActiveDay = date;
    this.focusedSg = this.computeFocusedGrid();
  },

  focusedDayItems() {
    const day = this.focusedEvent?.days.find((d) => d.date === this.focusedActiveDay);
    return day?.items || [];
  },

  computeFocusedGrid() {
    const items = this.focusedDayItems();
    if (items.length === 0) return { rooms: [], slots: [], grid: {} };
    const rooms = [...new Set(items.map((i) => i.room).filter(Boolean))].sort();
    if (rooms.length === 0) rooms.push('Sin sala');
    const byTime = {};
    for (const item of items) {
      const t = item.start_time;
      if (!byTime[t]) byTime[t] = {};
      byTime[t][item.room || 'Sin sala'] = [...(byTime[t][item.room || 'Sin sala'] || []), item];
    }
    return { rooms, slots: Object.keys(byTime).sort(), grid: byTime };
  },

  // ── Actions ──

  removeAttending(item) {
    const eventId = this.focusedEvent?.id ||
      this.events.find((e) => e.days.some((d) => d.items.some((i) => i.id === item.id)))?.id;
    if (!eventId) { this.confirmItem = null; return; }
    window.Alpine?.store?.('app')?.setAttending(eventId, item.id, false);

    // Remove from local state without leaving detail view
    if (this.focusedEvent && this.subPage === 'detail') {
      for (const day of this.focusedEvent.days) {
        const idx = day.items.findIndex((i) => i.id === item.id);
        if (idx !== -1) { day.items.splice(idx, 1); break; }
      }
      this.focusedEvent.days = this.focusedEvent.days.filter((d) => d.items.length > 0);
      this.focusedEvent.attendingCount = this.focusedEvent.days.reduce((s, d) => s + d.items.length, 0);
      if (this.focusedEvent.days.length === 0) {
        this.backToEvents();
      } else {
        if (!this.focusedEvent.days.some((d) => d.date === this.focusedActiveDay)) {
          this.focusedActiveDay = this.focusedEvent.days[0].date;
        }
        this.focusedSg = this.computeFocusedGrid();
      }
    }
    this.confirmItem = null;
  },

  askRemove(item) { this.confirmItem = item; },
  cancelRemove() { this.confirmItem = null; },

  askCleanEvent(event) { this.confirmClean = event; },
  askCleanFocused() { this.confirmClean = this.focusedEvent; },
  cancelClean() { this.confirmClean = null; },
  confirmCleanAll() {
    const event = this.confirmClean;
    if (!event) { this.cancelClean(); return; }
    const store = window.Alpine?.store?.('app');
    if (!store) { this.cancelClean(); return; }
    for (const day of event.days) {
      for (const item of day.items) {
        store.setAttending(event.id, item.id, false);
      }
    }
    this.confirmClean = null;
    this.confirmItem = null;
    this.fetchAll();
  },
  showDetail(item) { this.detailItem = item; },
  closeDetail() { this.detailItem = null; },

  hasConflict(item) {
    const day = this.focusedEvent?.days.find((d) => d.date === item.day_date);
    if (!day) return false;
    return day.items.some(
      (other) => other.id !== item.id &&
        item.start_time < other.end_time && item.end_time > other.start_time
    );
  },

  // ── Helpers ──

  formatTime(v) { return v ? v.slice(0, 5) : '--:--'; },
  formatDate(v) {
    return v
      ? new Date(`${v}T00:00:00`).toLocaleDateString('es-MX', {
          weekday: 'long', month: 'long', day: 'numeric',
        })
      : 'Fecha pendiente';
  },
  badgeClass(v) {
    return {
      '+18': 'bg-danger/15 text-danger border-danger/30',
      '+21': 'bg-danger/15 text-danger border-danger/30',
      '+16': 'bg-warning/15 text-warning border-warning/30',
      general: 'bg-success/15 text-success border-success/30',
    }[v] || 'bg-gray-700 text-muted border-line';
  },
  categoryIcon(v) {
    return { panel: '🎤', meetup: '🤝', workshop: '🔧', fursuit_games: '🎮', dance: '💃', ceremony: '🎉', other: '📋' }[v] || '📋';
  },
  categoryLabel(v) {
    return { panel: 'Panel', meetup: 'Meetup', workshop: 'Taller', fursuit_games: 'Fursuit games', dance: 'Baile', ceremony: 'Ceremonia', other: 'Otro' }[v] || v;
  },
});
