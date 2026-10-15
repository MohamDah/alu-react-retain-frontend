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
- Authentication will use React Context only.
- Expense filtering, searching, and sorting will use Redux Toolkit only.
- React Router v6 routes, authentication, and data screens are not implemented yet.

The backend serializes monetary values as decimal strings and dates as ISO
strings. Preserve those API types and convert values explicitly for display
or calculations.
