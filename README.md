# 🎓 PlacementHub — Campus Placement Platform

A full-stack campus placement management platform connecting **students, recruiters, and placement cells** — job postings, eligibility filtering, application pipelines, resume parsing with ATS scoring, placement drives, and real-time notifications.

🔗 **Live Demo:** [https://placement-hub-gaurav-singh-s-projects1.vercel.app](https://placement-hub-gaurav-singh-s-projects1.vercel.app)

---

## ✨ Features

- **Four roles with granular RBAC** — Admin, Placement Officer, Recruiter, Student (40+ permissions)
- **Job posting & eligibility engine** — recruiters create jobs; the system filters students by branch, CGPA, graduation year and supports `"Any"` wildcards
- **Application pipeline** — move candidates across stages (Applied → Shortlisted → Interview → Offer/Rejected), with per-stage scheduling
- **Resume parsing + ATS scoring** — upload a PDF, get extracted skills/projects/experience plus a deterministic fit score against any job
- **Placement drives** — create and track campus drives with events and participation
- **Candidate tools** — search, compare, tag, save searches, private notes
- **Real-time** — Socket.IO notification & activity broadcasting (no page refresh needed)
- **Analytics dashboards** — application funnels, job stats, company stats, hiring timelines
- **Calendar** — role-aware schedule of drives, interviews and deadlines
- **Audit logs** — admin visibility into every sensitive action
- **JWT auth with silent refresh** — access + refresh tokens; the client auto-refreshes on expiry

## 🧑‍💼 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@placement.com` | `admin123` |
| Placement Officer | `officer@placement.com` | `officer123` |
| Recruiter (TechNova) | `recruiter@placement.com` | `recruiter123` |
| Recruiter (BrightSoft) | `priya@brightsoft.example` | `priya123` |
| Student | `arjun.mehta@college.example` | `arjun123` |
| Student (generic) | `student@placement.com` | `student123` |

> Demo data includes 2 companies, 4 jobs, 11 applications in realistic pipeline states, an ongoing campus drive, interview stages, and notifications.

## 🏗️ Architecture

```
Browser (Next.js UI)
   │  HTTPS/REST + Socket.IO
   ▼
NestJS API (REST + WebSocket gateway, JWT auth)
   │  Prisma ORM
   ▼
PostgreSQL
```

| Piece | Tech | Hosted on |
|---|---|---|
| Web app | Next.js 14, React | **Vercel** |
| API | NestJS 10, Socket.IO, Passport/JWT, Prisma | **Render** (Blueprint: `render.yaml`) |
| Database | PostgreSQL 16 via Prisma (~25 models) | **Neon** (serverless Postgres) |
| Source control | git monorepo | **GitHub** |

### Project structure

```
placement-platform/
├── apps/
│   ├── api/          # NestJS backend (modules per domain, Prisma schema + migrations)
│   └── web/          # Next.js frontend (role-based dashboards)
├── packages/
│   └── shared/       # Shared types/validation
├── render.yaml       # Render Blueprint (API service + env contract)
└── package.json      # npm workspaces + root scripts
```

## 🛠️ Tech Stack

TypeScript · Node.js · NestJS · Next.js 14 · React · Prisma ORM · PostgreSQL · Socket.IO · JWT/bcrypt · pdf-parse (resume parsing) · Tailwind CSS

## 💻 Running locally

```bash
# 1. Clone & install
git clone https://github.com/GauravDev0102/placement-platform.git
cd placement-platform
npm install

# 2. Start Postgres (Docker) — or point DATABASE_URL at any Postgres
docker compose up -d

# 3. Configure API env (apps/api/.env)
#    DATABASE_URL=postgresql://...
#    JWT_SECRET=...
#    JWT_REFRESH_SECRET=...
#    FRONTEND_URL=http://localhost:3000

# 4. Create schema + seed base users
npm run db:migrate
npm run db:seed

# 5. Start both apps
npm run dev          # API on :4000, web on :3000
```

Web app env (`apps/web/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

## ☁️ Deployment

- **API — Render:** Blueprint-driven (`render.yaml`). Pushes to `master` auto-deploy. Health check at `GET /api/health`.
- **Web — Vercel:** linked to the `apps/web` directory; `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` point at the Render API.
- **DB — Neon:** migrations applied with `prisma migrate deploy`; seeded with demo data (companies, jobs, pipeline, drive, notifications).

## 📜 License

MIT
