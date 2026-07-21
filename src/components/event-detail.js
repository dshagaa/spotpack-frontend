// src/components/event-detail.js — mobile schedule timeline with filters
import { deleteEvent, getEvent } from '../api.js';
import { getSnapshot, setSnapshot } from '../lib/cache.js';
import { KEYS, readSession, writeSession } from '../lib/storage.js';

const ADULT = new Set(['+18', '+21']);

export default () => ({
  event: null,
  items: [],
  days: [],
  activeDay: null,
  loading: true,
  error: null,
  stale: false,
  cachedAt: null,
  showDeleteConfirm: false,
  deleting: false,
  searchQuery: '',
  filterCategory: 'all',
  showAdult: false,

  async init() {
    const ui = readSession(KEYS.ui, {});
    this.searchQuery = ui?.search || '';
    this.filterCategory = ui?.category || 'all';
    this.showAdult = !!ui?.showAdult;
    await this.loadEvent();
    this.$watch?.('$store.app.refreshCounter', () => this.loadEvent());
    this.$watch?.('searchQuery', (value) => this.rememberFilter({ search: value }));
    this.$watch?.('filterCategory', (value) => this.rememberFilter({ category: value }));
    this.$watch?.('showAdult', (value) => this.rememberFilter({ showAdult: value }));
  },

  appStore() {
    return window.Alpine?.store?.('app') || null;
  },

  rememberFilter(patch) {
    const current = readSession(KEYS.ui, {}) || {};
    writeSession(KEYS.ui, { ...current, ...patch }, 20_000);
  },

  applyData(data, cache = null) {
    this.event = data?.event || null;
    this.items = data?.items || [];
    const grouped = {};
    this.items.forEach((item) => {
      const day = item.day_date || this.event?.start_date;
      if (!day) return;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(item);
    });
    this.days = Object.entries(grouped).map(([date, items]) => ({ date, items }));
    const storedDay = this.appStore()?.getDay(this.event?.id, null);
    this.activeDay = this.days.some((day) => day.date === storedDay)
      ? storedDay : this.days[0]?.date || null;
    this.stale = !!cache?.stale;
    this.cachedAt = cache?.cachedAt || null;
  },

  async loadEvent({ force = false } = {}) {
    const path = location.pathname;
    if (!path.startsWith('/event/')) return;
    const id = path.replace('/event/', '');
    if (!id) return;
    this.loading = true;
    this.error = null;
    const cached = !force ? getSnapshot('event', id) : null;
    if (cached) {
      this.applyData(cached.data, cached);
      this.loading = false;
      getEvent(id).then((data) => {
        setSnapshot('event', id, data);
        this.applyData(data);
      }).catch(() => { this.stale = true; });
      return;
    }
    try {
      const data = await getEvent(id);
      setSnapshot('event', id, data);
      this.applyData(data);
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },

  refresh() { return this.loadEvent({ force: true }); },

  selectDay(day) {
    this.activeDay = day;
    this.appStore()?.rememberDay(this.event?.id, day);
    this.rememberFilter({ dayByEvent: { [this.event?.id]: day } });
  },

  currentDayItems() {
    return this.filteredItems(this.days.find((day) => day.date === this.activeDay)?.items || []);
  },

  isAttending(item) {
    return !!this.appStore()?.isAttending(this.event?.id, item.id);
  },

  toggleAttending(item) {
    const attending = this.appStore()?.toggleAttending(this.event?.id, item.id);
    if (attending) this.checkConflicts(item);
  },

  checkConflicts(item) {
    const conflicts = this.items.filter((other) => other.id !== item.id &&
      other.day_date === item.day_date &&
      this.isAttending(other) && item.start_time < other.end_time && item.end_time > other.start_time);
    if (conflicts.length) {
      this.$dispatch?.('show-toast', {
        message: `⚠️ "${item.title}" se solapa con: ${conflicts.map((c) => c.title).join(', ')}`,
        type: 'warning',
      });
    }
  },

  filteredItems(items) {
    const query = this.searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (query && !`${item.title || ''} ${item.description || ''}`.toLowerCase().includes(query)) return false;
      if (this.filterCategory !== 'all' && item.category !== this.filterCategory) return false;
      if (!this.showAdult && ADULT.has(item.classification)) return false;
      return true;
    });
  },

  hiddenAdultCount(items) {
    return this.showAdult ? 0 : items.filter((item) => ADULT.has(item.classification)).length;
  },

  editEvent() {
    this.$dispatch('open-edit-modal', {
      id: this.event.id, name: this.event.name,
      start_date: this.event.start_date, end_date: this.event.end_date,
      location: this.event.location || '',
    });
  },

  async confirmDelete() {
    this.deleting = true;
    try {
      await deleteEvent(this.event.id);
      this.showDeleteConfirm = false;
      history.pushState(null, '', '/');
      this.appStore()?.refresh();
    } catch (e) {
      this.error = e.message;
    } finally {
      this.deleting = false;
    }
  },

  cancelDelete() { this.showDeleteConfirm = false; },

  formatTime(value) { return value ? value.slice(0, 5) : '--:--'; },

  formatDate(value) {
    return value ? new Date(`${value}T00:00:00`).toLocaleDateString('es-MX', {
      weekday: 'long', month: 'long', day: 'numeric',
    }) : 'Fecha pendiente';
  },

  formatShortDate(value) {
    return value ? new Date(`${value}T00:00:00`).toLocaleDateString('es-MX', {
      weekday: 'short', day: 'numeric', month: 'short',
    }) : 'Día';
  },

  badgeClass(value) {
    return {
      '+18': 'bg-danger/15 text-danger border-danger/30',
      '+21': 'bg-danger/15 text-danger border-danger/30',
      '+16': 'bg-warning/15 text-warning border-warning/30',
      general: 'bg-success/15 text-success border-success/30',
    }[value] || 'bg-gray-700 text-muted border-line';
  },

  categoryIcon(value) {
    return { panel: '🎤', meetup: '🤝', workshop: '🔧', fursuit_games: '🎮', dance: '💃', ceremony: '🎉', other: '📋' }[value] || '📋';
  },

  categoryLabel(value) {
    return { panel: 'Panel', meetup: 'Meetup', workshop: 'Taller', fursuit_games: 'Fursuit games', dance: 'Baile', ceremony: 'Ceremonia', other: 'Otro' }[value] || value;
  },

  formatCachedAt() {
    return this.cachedAt ? new Date(this.cachedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
  },
});
