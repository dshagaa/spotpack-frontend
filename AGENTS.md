# SpotPack Frontend — AI Agent Context

> **Repo:** `dshagaa/spotpack-frontend`  
> **Stack:** Vite + Alpine.js + Tailwind CSS  
> **Backend:** `dshagaa/spotpack-backend` (Supabase Edge Functions)  
> **Built from scratch** — zero legacy code from the old vanilla JS SPA.

---

## Architecture

```
┌──────────────────────────────────────────────┐
│  Vite SPA (Alpine.js + Tailwind CSS)         │
│                                              │
│  index.html   ← Alpine mount + layout        │
│  src/                                        │
│    main.js    ← Alpine init, router           │
│    api.js     ← fetch wrapper for backend     │
│    store.js   ← Alpine store (global state)   │
│    components/                               │
│      api-key.js       ← API key input        │
│      event-list.js    ← Home (event cards)    │
│      event-detail.js  ← Event + items        │
│      create-event.js  ← Modal new event       │
│      import-modal.js  ← Upload image → AI    │
│  tests/                                      │
│    api.test.js        ← Vitest unit tests     │
│    e2e/               ← Playwright E2E        │
└──────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Build | Vite 8 | HMR, Tree-shaking, ES Modules |
| Framework | Alpine.js 3 | CDN, no build step at runtime |
| CSS | Tailwind CSS v4 | Custom jaguar palette |
| Testing | Vitest + jsdom | Unit tests |
| E2E | Playwright | Smoke tests |
| Deploy | Vercel / Netlify | Static site, auto-deploy |

---

## Color Palette (Tailwind)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | #1A1025 | Page background |
| `--color-surface` | #2D1B3D | Cards, modals |
| `--color-primary` | #E87D3E | Jaguar orange — buttons, accents |
| `--color-danger` | #F44336 | +18 badge, errors |
| `--color-warning` | #FFC107 | +16 badge, conflicts |
| `--color-success` | #4CAF50 | General badge, connected indicator |

---

## API Endpoints (Consumed)

Base URL configurable via `localStorage.spotpack_api_url`. Default: `http://127.0.0.1:54321/functions/v1`

| Function | Method | Auth | Params | Returns |
|----------|--------|------|--------|---------|
| `get-events` | GET | general+ | — | `{ events: [...] }` |
| `get-event` | GET | general+ | `?id={uuid}` | `{ event, items: [...] }` |
| `create-event` | POST | general+ | JSON body | `{ event }` |
| `update-event` | PATCH | general+ | JSON body | `{ event }` |
| `delete-event` | DELETE | maintainer | `?id={uuid}` | `{ deleted }` |
| `import-schedule` | POST | general+ | multipart: image + event_id | `{ success, count, items }` |
| `create-api-key` | POST | maintainer | JSON body | `{ key }` (shown once) |

---

## Component State Pattern

Every Alpine component follows this pattern:

```js
// src/components/thing.js
export default () => ({
  // reactive state
  data: null,
  loading: true,
  error: null,

  async init() {
    try {
      this.data = await fetchStuff();
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },
});
```

No global state yet — each component fetches independently.

---

## Routing

Hash-based SPA routing in `main.js`:
- `#/` → event list (home)
- `#/event/{id}` → event detail
- Alpine `x-effect` watches `location.hash`

---

## Setup

```bash
git clone git@github-dshagaa:dshagaa/spotpack-frontend.git
cd spotpack-frontend
npm install
npm run dev     # → http://localhost:5173
npm run build   # → dist/
npm test        # → npx vitest run
```

**Env:** No `.env` needed — API URL and key are configured in-app via localStorage.

---

## Rules for AI Agents

1. **Feature branches only.** `git checkout -b feat/<name>` from `dev`. Never work on `main` or `dev` directly.
2. **Conventional branch names:** `feat/`, `fix/`, `docs/`, `test/`, `chore/`.
3. **Conventional commits:** `feat(scope): msg`, `fix(scope):`, `docs:`, `test:`, `style:`, `chore:`.
4. **Merge via PR.** Push branch → `gh pr create` → `gh pr merge --merge --delete-branch`. Never direct merge.
5. **Commit before switching context.** Small, atomic, signed.
6. **Run `npx vitest run` before commit.** All tests must pass.
7. **Run `npm run build` before commit.** Build must succeed.
8. **Alpine components follow the init() pattern.** Loading → error → data states.
9. **Dark theme only.** No light mode toggle — we're always in dark mode.
10. **Spanish UI, English code.** User-facing text in Spanish, code/comments in English.
11. **Mobile-first.** Test at 320-428px (iPhone SE to iPhone 14 Pro Max).
12. **API key in localStorage.** `spotpack_api_key` — general key only, never maintainer.
13. **No hardcoded API URLs.** Default: `http://127.0.0.1:54321/functions/v1`, overridable.
14. **Keep index.html lean.** Components in `src/components/`, logic in JS files, templates in HTML via Alpine `x-` directives.
15. **Keep AGENTS.md updated.** Every branch that changes architecture, patterns, or rules updates this file.
16. **CI must pass before merge.** GitHub Actions runs `npm ci → npx vitest run → npm run build` on every push to feature branches.
