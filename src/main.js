import Alpine from 'alpinejs';
import './style.css';
import './store.js';
import apiKey from './components/api-key.js';
import createEvent from './components/create-event.js';
import eventDetail from './components/event-detail.js';
import eventList from './components/event-list.js';
import importModal from './components/import-modal.js';
import myAgenda from './components/my-agenda.js';

// Register components before Alpine scans the DOM.
document.addEventListener('alpine:init', () => {
  Alpine.data('apiKey', apiKey);
  Alpine.data('createEvent', createEvent);
  Alpine.data('eventDetail', eventDetail);
  Alpine.data('eventList', eventList);
  Alpine.data('importModal', importModal);
  Alpine.data('myAgenda', myAgenda);
});

// Expose globally before start() so template expressions (x-init, etc.) can find it.
window.Alpine = Alpine;
Alpine.start();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is an enhancement; the app remains usable without it.
    });
  }, { once: true });
}
