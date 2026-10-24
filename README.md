# PlacementHub — Campus Placement Platform

A full-stack campus placement platform with student, recruiter, placement-officer, and admin roles.

## Stack

- **Monorepo** — npm workspaces
- **`apps/api`** — NestJS 10 + Prisma 5 + PostgreSQL + Socket.IO
- **`apps/web`** — Next.js 14 (App Router) + Tailwind CSS
- **`packages/shared`** — shared types + validation
- **Infra** — Docker Compose (Postgres 16, Redis 7)

## Quick start

```bash
# 1. Infrastructure (Postgres + Redis)
docker compose up -d

# 2. Install dependencies + generate Prisma client
npm install
npm run db:generate

# 3. Migrate + seed
npm run db:migrate        # run from repo root
npm run db:seed

# 4. Run both API (:4000) and web (:3000)
npm run dev
```

> **Note:** Prisma must resolve `DATABASE_URL` from `apps/api/.env`, so run `npm run db:migrate` under `apps/api` directly if you hit env-var errors.

## Seeded accounts (after `db:seed`)

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@placement.com | admin123 |
| OFFICER | officer@placement.com | officer123 |
| STUDENT | *register via `/signup`* | — |
| RECRUITER | *register via `/signup`* | — |

## Feature map

### Student
- Register / login, dashboard stats
- **Profile page** (`/dashboard/student/profile`) — CGPA, branch, graduation year, backlogs, contact info. **Required** before applying: job eligibility checks read this.
- Upload resume (PDF ≤ 5MB) → auto-parsed with ATS score
- Browse companies & published jobs, view live eligibility per job
- One-click apply (resume required, duplicate-checked)
- Track application status; in-app notifications on every stage change

### Recruiter
- Create/verify company, post jobs (criteria: minCGPA, maxBacklogs, allowed branches)
- Candidate search with filters (CGPA range, skills, branch)
- Compare candidates side by side
- Per-job pipeline board (APPLIED → RESUME_SHORTLISTED → CODING_ROUND → TECHNICAL_INTERVIEW → HR_INTERVIEW → OFFER → JOINED) with advance/reject actions that notify the student
- Notes on applications, tags on candidates, saved searches

### Officer / Admin
- Placement drives management (`/dashboard/officer/drives`) — create drives with stage plans, update status (UPCOMING → ONGOING → COMPLETED/CANCELLED)
- Analytics (overview, applications, jobs, companies, 30-day timeline)
- Calendar of upcoming interviews/events
- Admin: user management (activate/deactivate), audit logs

### Cross-cutting
- JWT auth: 15m access token + 7d refresh token (`POST /auth/refresh`)
- RBAC: 40+ granular permissions mapped to roles via `PermissionGuard`
- Audit-log interceptor (`@LogAction` decorator)
- WebSocket gateway for live activity/notifications
- Activity feed (`/dashboard/activity`)

## API

All routes are prefixed `/api` on port 4000. Modules: auth, users, students, recruiters, companies, departments, jobs, applications, interviews/notes, resume (+ parser), drives, tags, calendar, events, analytics, notifications, permissions, audit-logs, saved-searches, email-templates.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | API + web concurrently |
| `npm run build` | Build shared → api → web |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:seed` | Seed permissions, roles, admin/officer users |
| `npm run db:generate` | Regenerate Prisma client |
