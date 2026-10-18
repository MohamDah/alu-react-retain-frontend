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
npm test
```

Tailwind is integrated through `@tailwindcss/vite`. Global styles and theme
tokens live in `src/index.css`. DM Sans loads from Google Fonts with a local
sans-serif fallback when offline.

## Architecture

- `src/types/index.ts`: API-aligned domain, session, filter, and pagination types.
- `src/App.tsx`: minimal application shell, ready for routing.
- `src/auth/`: AuthContext, tab-scoped session persistence, expiry, and route guards.
- Authentication uses React Context only; session data is never stored in Redux.
- `src/store/`: Redux Toolkit FilterSlice, store, typed hooks, and pure filtering/sorting.
- Redux contains only `searchQuery`, `categoryId`, `paymentMethod`, `startDate`,
  `endDate`, `sortBy`, and `sortOrder`. Filters reset when a session ends.
- React Router v6 defines public, authenticated, and admin-only routes.
- `src/hooks/useResource.ts`: cancellable API data in component state, never in Context or Redux.
- `src/pages/`: login, registration, monthly dashboard, expenses, budgets, admin dashboard, and categories.
- `src/components/`: shared request status, budget progress, and native-dialog expense forms.

The backend serializes monetary values as decimal strings and dates as ISO
strings. Preserve those API types and convert values explicitly for display
or calculations.

## Routes And Data

Public routes: `/login`, `/register`.
Authenticated routes: `/dashboard`, `/expenses`, `/budgets`.
Admin routes: `/admin/dashboard`, `/admin/categories`.
Admin accounts can also access the authenticated user routes. Registration
creates a USER account; ADMIN roles are assigned through backend administration,
not by the frontend or the signup form.

The expense API has date-descending pagination but no amount-sort parameter.
The frontend loads all 100-item API pages, then applies Redux filters and sorts
before paginating the table into 10-row pages. This is suitable for the personal
expense scope; larger datasets should add backend sorting before adopting
server-side table pagination. Concurrent edits during a multi-page fetch can
still affect the snapshot; duplicate IDs are removed.

Dashboard summaries use the selected UTC calendar month. The highest expense
and category breakdown are monthly; recent expenses are the latest five by
expense date across all months. Budgets show unset, within-budget (up to 80%),
approaching (over 80% through 100%), and over-budget (over 100%) states.
Money calculations use integer cents. USD is the current display currency
because the backend has no currency field; change the formatter and form labels
together if the application uses another currency.

Expense, budget, and admin category forms call the existing POST/PATCH/DELETE
endpoints. Uncategorized is protected; deleting another category reassigns
its expenses to Uncategorized on the backend.

## Verification

`npm test` covers filters, numerical sorting, inclusive date boundaries,
dashboard totals, budget thresholds, session persistence/expiry, and paginated
API loading/error handling. Browser checks exercised auth and role guards,
forms, pagination, retry/401 behavior, and mobile/desktop layouts with mocked
API responses. Those browser checks do not certify authenticated integration
against a live database.

## API And Sessions

Deployed frontend: https://retain-mohamdah.netlify.app/

Deployed backend API: https://alu-react-retain-backend.onrender.com

The API client reads `VITE_API_BASE_URL` at build time. For Netlify, set it to
the Render backend's HTTPS origin
`https://alu-react-retain-backend.onrender.com` (no `/api` suffix). Netlify builds a static
bundle, so changing the variable requires a new deploy. The client appends API
paths such as `/auth/signin` to this origin.

For local development, leave `VITE_API_BASE_URL` unset: Vite proxies `/api/*`
to `http://127.0.0.1:3000/*`. A tracked `.env.example` documents the production
setting; create a local `.env.local` only if you want to bypass the proxy.
On Render, set `FRONTEND_ORIGIN` to the exact Netlify site origin
`https://retain-mohamdah.netlify.app`, and include any custom domain as a
comma-separated origin. Nest CORS permits only those configured origins. No
same-origin Netlify proxy is required.

Deploy the backend and frontend independently. The browser talks directly to
Render, so the backend must be reachable over HTTPS and its CORS allowlist must
match the origin shown in the browser address bar.

Login and registration call `/auth/signin` and `/auth/signup`. Sessions persist
in `sessionStorage` for the current tab and expire after the API token lifetime.
Browser session storage is readable by JavaScript; protect against XSS. Route
guards are UI controls only: the backend must enforce JWT validity and roles.

## Dependency Security

React Router currently uses v6. As of 2026-10-11,
`npm audit` reports two moderate findings with no patched v6 release:
GHSA-wrjc-x8rr-h8h6 (open redirects) and GHSA-337j-9hxr-rhxg (SSR hydration).
The app uses fixed internal navigation targets and BrowserRouter without SSR.
These constraints limit exposure but do not remove the dependency advisories.
See `docs/router-cve-report.json`. Clearing these advisories requires upgrading
to React Router 7.18.0 or newer, which changes the required major version.
