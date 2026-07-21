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
  // Filters
  searchQuery: '',
  filterCategory: 'all',
  showAdult: false,

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
      // Store event id for attending lookups
      this._eventId = data.event?.id;
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

  /** Get attending for an item from Alpine store */
  isAttending(item) {
    return Alpine.store('app').isAttending(this._eventId, item.id);
  },

  /** Toggle attending for an item */
  toggleAttending(item) {
    const attending = Alpine.store('app').toggleAttending(this._eventId, item.id);
    // Check for conflicts when marking as attending
    if (attending) {
      this.checkConflicts(item);
    }
  },

  /** Find conflicts with other attending items in the same day */
  checkConflicts(item) {
    const allAttending = this.days
      .flatMap(d => d.items)
      .filter(i => i.id !== item.id && Alpine.store('app').isAttending(this._eventId, i.id));
    const conflicts = allAttending.filter(other =>
      other.day_date === item.day_date &&
      item.start_time < other.end_time &&
      item.end_time > other.start_time
    );
    if (conflicts.length > 0) {
      this.showConflictToast(item, conflicts);
    }
  },

  showConflictToast(item, conflicts) {
    const names = conflicts.map(c => c.title).join(', ');
    // Use Alpine store or dispatch custom event for toast
    this.$dispatch('show-toast', {
      message: `⚠️ "${item.title}" se solapa con: ${names}`,
      type: 'warning',
    });
  },

  /** Filtered items for a day */
  filteredItems(items) {
    return items.filter(item => {
      // Search filter
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const match = item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q));
        if (!match) return false;
      }
      // Category filter
      if (this.filterCategory !== 'all' && item.category !== this.filterCategory) {
        return false;
      }
      // +18 toggle
      if (!this.showAdult && (item.classification === '+18' || item.classification === '+21')) {
        return false;
      }
      return true;
    });
  },

  /** Count of hidden adult items for a day */
  hiddenAdultCount(items) {
    if (this.showAdult) return 0;
    return items.filter(i => i.classification === '+18' || i.classification === '+21').length;
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

  categoryIcon(c) {
    return {
      panel: '🎤', meetup: '🤝', workshop: '🔧',
      fursuit_games: '🎮', dance: '💃', ceremony: '🎉', other: '📋',
    }[c] || '📋';
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
