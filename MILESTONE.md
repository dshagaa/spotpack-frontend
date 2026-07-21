# Milestone Log

## 2026-07-17 — Bootstrap

### Scaffold (PR #1 — initial commit)
- Vite + Alpine.js 3 + Tailwind CSS v4 scaffold
- Jaguar color palette (6 custom colors)
- Dark theme always-on

### API Client (PR #1)
- fetch wrapper for all 7 backend endpoints
- localStorage config (api_url, api_key)
- 5 Vitest unit tests (mocked fetch)
- jsdom + localStorage mock setup

### API Key Input (PR #2)
- Alpine component: toggle show/hide, save to localStorage
- Connected indicator (green dot)
- Password field, Enter key support

### Event List (PR #3)
- Home page with card grid
- Loading, error, empty states
- Date range formatting (es-MX)
- Responsive 1-3 columns

### Docs (PR #4)
- AGENTS.md (15 rules for AI agents)
- README.md (human setup guide)
- MILESTONE.md (this file)

### Create Event Modal (PR #5)
- Alpine modal component: form with name, date range, location
- Client-side validation, loading/error/success states
- Dispatches `event-created` custom event on success

### Event Detail (PR #6)
- Items grouped by day with sticky date headers
- Time formatting (HH:MM), badge classes (+18/+16/general)
- Category icons (panel, meetup, workshop, dance, etc.)
- Import button per event

### Import Modal (PR #7)
- Image upload (PNG/JPEG/WebP) → MiMo AI processing
- File preview, loading state, result display
- Multipart FormData to `/import-schedule`

### CI & Skills (PR #8)
- GitHub Actions workflow: npm ci → vitest → build
- .gitattributes for LF line endings
- Agent skills: alpine-js, playwright, tailwindcss, testing, jest
- Rule #16: CI must pass before merge

## 2026-07-20 — Attending, Agenda, Filters

### Core Cleanup
- Cleaned up Vite scaffold (removed template boilerplate)
- Alpine.js global store (`src/store.js`) with refresh + attending system
- Toast notification system for warnings

### Attending Toggle (localStorage)
- "🐾" paw toggle button per schedule item
- Attending state stored in `localStorage.spotpack_attending`
- Visual indicator: item card gets border highlight when marked
- Powered by Alpine store helpers (getAttending, toggleAttending, setAttending)

### Filters
- Search bar: filter by title or description (debounced)
- Category chips: Todas, Panel, Meetup, Taller, Fursuit Games, Baile, Ceremonia, Otro
- 🔞 +18 toggle: hide/show adult content, counter shown
- All filters combine with AND logic

### Mi Agenda (#/agenda)
- New route in header nav
- New Alpine component (`src/components/my-agenda.js`)
- Fetches all events, filters items with attending=true
- Grouped by event → day
- Remove button per item
- Loading, error, and empty states

### Conflict Detection
- When marking an item as attending, checks for time overlaps with other attending items
- Toast warning: "⚠️ 'Title' se solapa con: Other Title"

## 2026-07-20 — Modern Ultra-Light Frontend

### Visual rebuild
- Mobile-first dark jaguar design with responsive desktop layout
- Compact schedule timeline cards, mobile bottom navigation, responsive bottom-sheet modals
- System font stack only; no runtime font or Alpine CDN request
- Accessible focus states, skip link, semantic labels, 44px touch targets, reduced-motion support

### Performance and persistence
- Alpine.js bundled locally through Vite
- Defensive storage helpers with versioned keys and bounded JSON writes
- `localStorage` for attending state and API snapshots
- `sessionStorage` for route, selected day, search, category, and adult-filter state
- Cache-first API reads with stale fallback and explicit cache invalidation after mutations
- Production service worker for same-origin app-shell caching and offline fallback
- PWA manifest and offline page added

### Verification
- 75 Vitest tests passing
- Production build passing
- Built artifacts verified: service worker present, manifest present, Alpine CDN absent

