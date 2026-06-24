# Spreetail HR Portal

A full-stack Employee Management Portal — attendance, leave, payroll, performance reviews,
announcements, and reporting — built with React, Node/Express, and PostgreSQL.

> **Naming note:** "Spreetail" is the name of a real e-commerce company. This project uses it purely
> as a placeholder brand for a portfolio/demo build. If you plan to publish or share this project
> publicly, consider renaming it (search-and-replace "Spreetail" across both `frontend/` and
> `backend/`) to avoid any confusion with the real business.

---

## 1. Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19 (Vite), React Router, Redux Toolkit, Material UI, Axios, React Hook Form, Chart.js |
| Backend    | Node.js, Express, JWT auth, bcrypt, Multer, Nodemailer, Sequelize |
| Database   | PostgreSQL (Neon in production, local Postgres in dev) |
| Deployment | Frontend → Vercel · Backend → Render · Database → Neon |
| Docs       | Swagger / OpenAPI (`/api/docs`), Postman collection, Mermaid ER diagram |

## 2. Project Structure

```
spreetail-portal/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, Swagger config
│   │   ├── models/         # Sequelize models + associations
│   │   ├── controllers/    # Business logic per module
│   │   ├── routes/         # Express routers (RBAC-protected)
│   │   ├── middleware/     # auth, rate limiting, error handling
│   │   ├── utils/          # tokens, pagination, mailer
│   │   ├── seed/           # seed.js — generates realistic demo data
│   │   ├── app.js          # Express app wiring
│   │   └── server.js       # entry point
│   ├── migrations/         # 001_init_schema.sql (full DDL dump)
│   ├── docs/                # ER_DIAGRAM.md, postman_collection.json
│   ├── render.yaml
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/             # axios client + per-module API services
    │   ├── app/              # Redux store
    │   ├── features/         # auth + ui slices
    │   ├── components/       # layout (Sidebar/Topbar) + shared UI
    │   ├── pages/             # one file per route
    │   ├── routes/            # ProtectedRoute (auth + RBAC)
    │   └── theme/             # design tokens + MUI theme builder
    ├── vercel.json
    └── .env.example
```

## 3. Local Setup

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local install, Docker, or a free [Neon](https://neon.tech) project)

### Backend

```bash
cd backend
cp .env.example .env
# edit .env -> set DATABASE_URL to your Postgres connection string
npm install
npm run seed     # creates schema + ~170 employees, attendance, leave, payroll, etc.
npm run dev       # starts the API on http://localhost:5000
```

Swagger docs: `http://localhost:5000/api/docs`
Health check: `http://localhost:5000/health`

### Frontend

```bash
cd frontend
cp .env.example .env
# edit .env -> set VITE_API_URL to your backend URL (default http://localhost:5000/api)
npm install
npm run dev       # starts the app on http://localhost:5173
```

### Demo accounts (created by the seed script)

| Role        | Email                  | Password      |
|-------------|-------------------------|---------------|
| Super Admin | admin@spreetail.com    | Admin@123     |
| HR          | hr@spreetail.com       | Hr@123        |
| Manager     | manager@spreetail.com  | Manager@123   |
| Employee    | employee@spreetail.com | Employee@123  |

The seed script (`backend/src/seed/seed.js`) generates, via `@faker-js/faker`:
- 10 departments, 1 Super Admin, 5 HR managers, 15 department managers, 150 employees (171 total)
- 12 months of attendance history per employee (present / absent / late / half-day / WFH, with
  realistic per-person attendance "personalities")
- 12 months of payroll records with payslip numbers, allowances, bonuses, tax, and deductions
- 2–8 leave requests per employee across 6 leave types, with approved/pending/rejected outcomes
- 4 trailing quarters of performance reviews with KPI scores, ratings, and manager feedback
- 55 company announcements across hiring, results, events, holidays, and recognition

Re-running `npm run seed` truncates and regenerates everything (`sequelize.sync({ force: true })`),
so it's safe to run repeatedly during development.

## 4. Deployment

### Database — Neon
1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the pooled connection string into `DATABASE_URL`. Set `DB_SSL=true`.
3. Run `npm run seed` once locally (pointed at the Neon URL) to provision schema + demo data, or run
   `migrations/001_init_schema.sql` directly via `psql` and seed separately.

### Backend — Render
1. Push this repo to GitHub.
2. In Render, create a new **Web Service** from the repo, root directory `backend/`.
3. Render will detect `render.yaml` (Blueprint) — or set manually: build command `npm install`,
   start command `npm start`.
4. Set the environment variables flagged `sync: false` in `render.yaml` (`DATABASE_URL`,
   `CLIENT_URL`, SMTP credentials) in the Render dashboard.
5. Note: Render's free tier has an **ephemeral filesystem** — uploaded files (profile pictures,
   documents) won't persist across deploys/restarts. For production use, swap the Multer disk
   storage in `uploadController.js` for Cloudinary/S3.

### Frontend — Vercel
1. Import the repo into Vercel, root directory `frontend/`.
2. Vercel will pick up `vercel.json` (build command `npm run build`, output `dist`, with an SPA
   rewrite so client-side routing works on refresh).
3. Set `VITE_API_URL` and `VITE_API_BASE_URL` to your deployed Render backend URL.

## 5. API Documentation

- **Swagger UI**: `GET /api/docs` on the running backend (interactive, try-it-out enabled).
- **Raw OpenAPI JSON**: `GET /api/docs.json`.
- **Postman collection**: `backend/docs/postman_collection.json` — import into Postman, set the
  `baseUrl` and `accessToken` collection variables (login first, then paste the returned token).
- **ER diagram**: `backend/docs/ER_DIAGRAM.md` (Mermaid — renders natively on GitHub/GitLab, or
  paste into [mermaid.live](https://mermaid.live)).
- **Schema DDL**: `backend/migrations/001_init_schema.sql` — exact PostgreSQL schema, exported
  from a live seeded database.

## 6. Security

- JWT access + refresh tokens (15 min / 7 day expiry), with automatic refresh on the frontend
  (axios interceptor) when a request gets a 401.
- bcrypt password hashing (configurable salt rounds).
- Role-based access control (`super_admin`, `hr`, `manager`, `employee`) enforced at the route
  layer (`middleware/auth.js`) and re-checked in controllers for record-level rules (e.g. an
  employee can view their own salary but not a colleague's).
- Helmet for secure headers, CORS restricted to `CLIENT_URL`, express-rate-limit on all `/api`
  routes (tighter limit on `/auth/login`).
- Sequelize parameterized queries throughout — no raw string-interpolated SQL.

## 7. Module Coverage & Known Scope Notes

All 12 modules from the brief have a working route and UI. Two are intentionally lighter-weight
given the scope of this build:

- **Recruitment** — implemented as a read-only list of open requisitions. Full applicant tracking
  (pipelines, interview scheduling, offer management) is stubbed with a "roadmap" note in the UI
  rather than built out, to keep the core HR modules (attendance/payroll/leave/performance, which
  are fully implemented end-to-end) as the focus.
- **Document Management** — employees can view/upload documents against their profile via the
  `/api/uploads` endpoints; there's no folder/category browser UI beyond a flat list.
- **Forgot/reset password** — fully functional, but emails are only actually sent if SMTP
  credentials are configured in `.env`; otherwise the reset token is returned directly in the API
  response so the flow can still be tested end-to-end without a mail server.

Everything else — employee directory & profiles, attendance check-in/out + team/admin views, leave
apply/approve/reject + balances, payroll payslips + monthly cost/department distribution/salary
trend stats + a "run payroll" generator, quarterly performance reviews, company announcements, and
cross-module reports — is fully wired from seeded data through the API to the UI.

## 8. Frontend Design Notes

The UI leans into a "system of record" aesthetic rather than a generic SaaS dashboard look: a
steel-navy + bronze color palette (instead of the typical blue/purple), Space Grotesk for headings,
Inter for body text, and IBM Plex Mono for employee codes, dates, and currency — a small ledger-style
detail meant to reinforce that this is payroll/HR data, not just another admin panel. The dashboard
opens on a single "Company Pulse" ribbon (a live attendance sparkline) instead of a generic stat-card
row, before dropping into the standard KPI cards, charts, and tables.
