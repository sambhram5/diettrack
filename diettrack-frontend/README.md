# DietTrack Frontend

Production React + TypeScript + Vite + Tailwind CSS frontend for DietTrack.

## Tech Stack
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling with custom design system)
- **TanStack Query v5** (server state)
- **Axios** (HTTP with JWT refresh interceptor)
- **React Router v6** (routing)
- **Recharts** (analytics charts)
- **react-hot-toast** (notifications)
- **Lucide React** (icons)
- **date-fns** (date formatting)

## Pages
| Path | Page | Auth |
|------|------|------|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/register` | Register (3-step wizard) | Public |
| `/dashboard` | Daily nutrition overview | Protected |
| `/meals` | Log & review meals | Protected |
| `/foods` | Food library + custom foods | Protected |
| `/water` | Water intake tracker | Protected |
| `/weight` | Weight logging + chart | Protected |
| `/analytics` | Trend charts + insights | Protected |
| `/profile` | Settings + password | Protected |

## Quick Start

```bash
npm install
cp .env.example .env
# Edit VITE_API_URL if pointing to remote backend
npm run dev
```

For local development the Vite proxy forwards `/api` → `http://localhost:3001`.

## Deploy to Vercel

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` environment variable to your Render backend URL
4. Deploy — `vercel.json` handles SPA routing automatically

## Design System

The app uses CSS custom properties for its dark theme:

| Variable | Purpose |
|----------|---------|
| `--brand` | Green `#22c55e` |
| `--surface-0..4` | Dark backgrounds |
| `--text-primary/secondary/muted` | Text hierarchy |
| `--border` / `--border-bright` | Subtle borders |

Fonts: **Syne** (headings, labels) + **DM Sans** (body) + **JetBrains Mono** (numbers)
