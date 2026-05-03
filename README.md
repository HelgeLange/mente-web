# mente-web

Web app for **Mente** — a perimenopause companion for Spanish-speaking women.

The MVP product surface lives here: symptom tracking, doctor-ready reports, and trustworthy Spanish-language education. This repo is the deployed customer-facing site.

> Customer-facing copy is written in Spanish first, never translated. Placeholder strings written by engineers are tagged `[ES-DRAFT]` until a native speaker polishes them.

## Run locally (under 5 minutes)

Prereqs: Node 20+ and npm.

```bash
git clone git@github.com:HelgeLange/mente-web.git
cd mente-web
npm install
cp .env.example .env.local   # optional — only needed once Sentry is provisioned
npm run dev
```

Open <http://localhost:3000>. The homepage should render `Hola. Bienvenida a Mente.`

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint with the Next.js config |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |

CI runs `typecheck`, `lint`, and `test` on every push and PR — see `.github/workflows/ci.yml`.

## Stack

- **Next.js 16** with the App Router and React 19
- **TypeScript** in strict mode
- **Tailwind CSS v4**
- **Vitest** + **Testing Library** for unit/UI tests
- **Sentry** (`@sentry/nextjs`) for error tracking — initialized only when a DSN is present, so local dev stays quiet

## Environment variables

See `.env.example`. Nothing is required for a green local build; secrets are wired in CI/Vercel.

| Var | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SENTRY_DSN` | client + server | Public DSN — safe to ship to the browser |
| `SENTRY_DSN` | server only | Optional; falls back to the public DSN |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | CI build | Source-map upload during `npm run build` |

## Privacy

This app handles health data. We do not send symptom content to third-party analytics, do not log PII, and minimize what we store. If you find a code path that violates this, treat it as a bug.

## Project layout

```
src/
  app/                # Next.js App Router pages, layouts, route handlers
  instrumentation.ts        # Sentry server/edge bootstrap
  instrumentation-client.ts # Sentry browser bootstrap
sentry.server.config.ts
sentry.edge.config.ts
.github/workflows/ci.yml
```

The next ticket (auth, data model, first product surface) will land on top of this scaffold.
