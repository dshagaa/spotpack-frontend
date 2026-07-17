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

### CI/CD (PR #8)
- GitHub Actions workflow: npm ci → vitest → build
- .gitattributes for LF line endings
- Rule #16: CI must pass before merge
