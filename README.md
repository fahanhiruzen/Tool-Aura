# Tool Aura (ToolHub)

React 19 plugin with Vite, TanStack Query, Zustand, Shadcn UI, and Tailwind CSS.

## Stack

- **React 19** + **Vite** – app shell and build
- **TanStack Query** – API data fetching and caching
- **Zustand** – client state (navigation, table filters, selection)
- **Shadcn UI** – Button, Card, Input, Checkbox, Badge, Dropdown
- **Tailwind CSS** – styling

## Project structure

```
src/
├── api/           # API client, types, endpoints, mocks
├── components/
│   ├── layout/    # AppLayout, Sidebar, SidebarNav, UserProfileCard
│   ├── dashboard/ # DashboardHeader, widgets, ChartCard, UniqueIdsTable
│   └── ui/        # Shadcn primitives (Button, Card, Input, etc.)
├── hooks/         # use-dashboard (TanStack Query hooks)
├── pages/         # DashboardPage
├── stores/        # Zustand (navigation, table)
├── lib/           # utils (cn)
├── App.tsx
├── main.tsx
└── index.css
```

## Commands

- `npm run dev` – start dev server
- `npm run build` – production build (output in `dist/`)
- `npm run preview` – preview production build

## API

Without `VITE_API_BASE`, the app uses mock data from `src/api/mocks.ts`.  
Set `VITE_API_BASE` (e.g. in `.env`) to point to your API to use real endpoints.

## Plugin usage

The built assets in `dist/` can be loaded by the host (e.g. Figma plugin) via `manifest.json` and your plugin bootstrap.
