# Retain Frontend

Personal expense and budget manager built with React, TypeScript, Vite,
Tailwind CSS v4, and lucide-react.

## Development

Run commands from this directory:

```sh
npm install
npm run dev
```

```sh
npm run build
npm run lint
```

Tailwind is integrated through `@tailwindcss/vite`. Global styles and theme
tokens live in `src/index.css`. DM Sans loads from Google Fonts with a local
sans-serif fallback when offline.

## Architecture

- `src/types/index.ts`: API-aligned domain, session, filter, and pagination types.
- `src/App.tsx`: minimal application shell, ready for routing.
- `src/auth/`: AuthContext, tab-scoped session persistence, expiry, and route guards.
- Authentication uses React Context only; session data is never stored in Redux.
- Expense filtering, searching, and sorting will use Redux Toolkit only.
- React Router v6 defines public, authenticated, and admin-only routes.
- Data screens are not implemented yet.

The backend serializes monetary values as decimal strings and dates as ISO
strings. Preserve those API types and convert values explicitly for display
or calculations.

## API And Sessions

During development Vite proxies `/api/*` to `http://127.0.0.1:3000/*`.
Start the backend separately. Production hosting must provide the equivalent
same-origin proxy and serve `index.html` for frontend route requests.

Login and registration call `/auth/signin` and `/auth/signup`. Sessions persist
in `sessionStorage` for the current tab and expire after the API token lifetime.
Browser session storage is readable by JavaScript; protect against XSS. Route
guards are UI controls only: the backend must enforce JWT validity and roles.

## Dependency Security

React Router is intentionally on v6 to meet the rubric. As of 2026-10-11,
`npm audit` reports two moderate findings with no patched v6 release:
GHSA-wrjc-x8rr-h8h6 (open redirects) and GHSA-337j-9hxr-rhxg (SSR hydration).
The app uses fixed internal navigation targets and BrowserRouter without SSR.
These constraints limit exposure but do not remove the dependency advisories.
See `docs/router-cve-report.json`. A clean audit requires approval to move to
React Router 7.18.0 or newer; do not run `npm audit fix --force` under the v6 rubric.
