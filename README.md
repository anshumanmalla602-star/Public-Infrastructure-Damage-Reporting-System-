# CivicFix - Public Infrastructure Damage Reporting & Women Entrepreneur Marketplace

A full-stack platform that connects citizens with city authorities to repair damaged public
infrastructure, and gives women-led local businesses a marketplace to be discovered and hired.

## Features

### Public Infrastructure Damage Reporting
- Citizens report damaged assets (potholes, water leaks, streetlights, garbage dumps, broken
  roads, open drains, footpath damage, traffic signals) with a photo, address and GPS
  coordinates.
- Authorities triage by status and category, set priority, assign ownership and record
  progress comments. Every status change is written to a permanent `issue_status_history`.
- Citizens track their own reports from `reported` -> `assigned` -> `in_progress` ->
  `resolved`, with a resolution timestamp.

### Women Entrepreneur Marketplace
- Entrepreneurs register a business profile (category, description, location, pricing,
  availability, licence information) and list services with price and availability.
- Admins approve profiles before they become publicly visible, so only approved
  businesses and active services are exposed to the public.
- Customers browse and filter services by keyword, category, city and availability, then
  send inquiries. Entrepreneurs respond, and customers track replies.

### Guidance & Content
- Admins publish guidance articles for citizens and entrepreneurs (licensing, pricing,
  cost estimation, marketing).
- Citizens can file complaints which admins triage and close.

### Administration
- Dashboard with platform statistics: users, issues by status/category/month, resolution
  time, approved and pending businesses, services and inquiries.
- Business approval queue, category management, content management and user directory.

## Tech Stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Frontend  | React 18, React Router 6, Vite 5, Tailwind CSS 3, Axios |
| Backend   | Node.js, Express 5, JWT, bcryptjs, Multer               |
| Database  | PostgreSQL (`public_damage_db`)                          |
| Testing   | Vitest + Testing Library (unit/component), Playwright (E2E) |

## Project Structure

```
.
|-- backend/
|   |-- src/
|   |   |-- config/        # database pool, schema init, seed data
|   |   |-- controllers/   # request handlers
|   |   |-- middleware/    # auth (JWT + roles), upload (multer), error handler
|   |   |-- routes/        # express routers
|   |   |-- uploads/       # uploaded images (served at /uploads)
|   |   |-- server.js      # app entry point
|   |   |-- runSeed.js     # schema creation + seeding
|   |   `-- runTests.js    # backend integration test suite
|   `-- .env
|-- frontend/
|   |-- src/
|   |   |-- api/           # axios client with interceptors
|   |   |-- components/    # shared UI (cards, modals, badges, alerts)
|   |   |-- context/       # AuthContext
|   |   |-- pages/         # route components
|   |   |-- routes/        # ProtectedRoute
|   |   |-- test/          # vitest component tests
|   |   `-- utils/         # constants, formatters, storage helpers
|   |-- e2e/               # Playwright end-to-end suite
|   `-- .env
`-- package.json           # workspace runner
```

## Getting Started

### Prerequisites
- Node.js 18+ (tested on v22)
- npm 10+
- PostgreSQL 14+ running locally

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure the database

Create the database (once):

```bash
psql -U postgres -c "CREATE DATABASE public_damage_db;"
```

Copy the environment template and set your password:

```bash
cp backend/.env.example backend/.env
# backend/.env -> DB_PASSWORD=<your postgres password>
```

### 3. Initialise the schema and seed data

```bash
npm run seed
```

This creates all 10 tables, inserts default business categories and seeds demo users,
a business, services, issues and guidance articles. It is safe to re-run.

### 4. Run the application

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

Run the two servers separately with `npm run dev:backend` and `npm run dev:frontend`.

### Demo accounts

All demo accounts use the password `Admin@123`.

| Role         | Email                     | Lands on            |
| ------------ | ------------------------- | ------------------- |
| Citizen      | `citizen@example.com`     | My Issues           |
| Entrepreneur | `entrepreneur@example.com`| My Business         |
| Authority    | `authority@city.gov.in`   | Manage Issues       |
| Admin        | `admin@platform.com`      | Admin Dashboard     |

## Testing

```bash
npm test              # backend integration (55) + frontend component (15)
npm run test:backend  # backend API integration suite
npm run test:frontend # frontend component tests
npm run test:smoke    # live API smoke test of every endpoint (37) - needs backend running
npm run test:e2e      # Playwright browser tests (27) - needs both servers running
npm run lint          # ESLint over frontend/src
```

The backend suite (`backend/src/runTests.js`) exercises the real HTTP API against a running
server, covering authentication, role enforcement, issue lifecycle, marketplace discovery,
inquiries, admin workflows, content and complaints, registration hardening, and input
validation (malformed IDs must return 400 rather than a 500).

The smoke suite (`backend/src/scripts/apiSmoke.js`) walks every endpoint the frontend calls,
asserting status codes, role enforcement, registration hardening, and that only approved
businesses are publicly visible.

The E2E suite (`frontend/e2e/e2e.test.mjs`) drives a real Chrome browser through every
role's journey and asserts that no console or page errors occur. It auto-detects Chrome and
Chromium in the standard install locations; set `CHROME_PATH` to point at a specific
executable, and `E2E_BASE_URL` to drive a different host or port.

## API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication - `/api/auth`
| Method | Path       | Access   | Description                    |
| ------ | ---------- | -------- | ------------------------------ |
| POST   | `/register`| Public   | Register (citizen/entrepreneur)|
| POST   | `/login`   | Public   | Sign in                        |
| GET    | `/me`      | Any user | Current profile                |

### Issues - `/api/issues`
| Method | Path           | Access            | Description              |
| ------ | -------------- | ----------------- | ------------------------ |
| POST   | `/`            | Auth              | Report issue (multipart) |
| GET    | `/mine`        | Auth              | Own reports              |
| GET    | `/`            | Auth              | All issues (filterable)  |
| GET    | `/:id`         | Auth              | Issue detail             |
| PUT    | `/:id/status`  | Authority/Admin   | Update status/priority   |

### Marketplace - `/api/businesses`, `/api/services`
| Method | Path                    | Access | Description                 |
| ------ | ----------------------- | ------ | --------------------------- |
| GET    | `/businesses`           | Public | Approved businesses         |
| GET    | `/businesses/cities`    | Public | Cities with businesses      |
| GET    | `/businesses/:id`       | Public | Business detail             |
| GET    | `/businesses/:id/services`| Public| Business services         |
| GET    | `/services`             | Public | Service search & filters    |
| GET    | `/services/mine`        | Auth   | Own services                |
| POST   | `/services`             | Auth   | Create service              |
| PUT    | `/services/:id`         | Auth   | Update service              |
| DELETE | `/services/:id`         | Auth   | Delete service              |

### Entrepreneurs - `/api/entrepreneurs`
| Method | Path            | Access | Description          |
| ------ | --------------- | ------ | -------------------- |
| GET    | `/categories`   | Public | Business categories  |
| POST   | `/profile`      | Auth   | Create profile       |
| GET    | `/profile/me`   | Auth   | Own profile          |
| PUT    | `/profile`      | Auth   | Update profile       |

### Inquiries - `/api/inquiries`
| Method | Path             | Access | Description           |
| ------ | ---------------- | ------ | --------------------- |
| POST   | `/`              | Auth   | Send inquiry          |
| GET    | `/mine`          | Auth   | Inquiries sent        |
| GET    | `/received`      | Auth   | Inquiries received    |
| PUT    | `/:id/respond`   | Owner  | Respond to inquiry    |

### Admin - `/api/admin` (Admin only)
| Method | Path                    | Description                  |
| ------ | ----------------------- | ---------------------------- |
| GET    | `/profiles/pending`     | Pending business profiles    |
| GET    | `/profiles`             | All business profiles        |
| PUT    | `/profiles/:id/status`  | Approve / reject             |
| GET    | `/categories`           | List categories              |
| POST   | `/categories`           | Create category              |
| PUT    | `/categories/:id`       | Update category              |
| DELETE | `/categories/:id`       | Delete category              |

### Content - `/api/content`
| Method | Path                       | Access        | Description        |
| ------ | -------------------------- | ------------- | ------------------ |
| GET    | `/`                        | Public        | Published articles |
| GET    | `/all`                     | Admin         | All articles       |
| POST   | `/`                        | Admin         | Create article     |
| PUT    | `/:id`                     | Admin         | Update article     |
| DELETE | `/:id`                     | Admin         | Delete article     |
| POST   | `/complaints`              | Auth          | File complaint     |
| GET    | `/complaints`              | Admin         | List complaints    |
| PUT    | `/complaints/:id/status`   | Admin         | Update complaint   |

### Statistics - `/api/stats` (Admin only)
| Method | Path     | Description                    |
| ------ | -------- | ------------------------------ |
| GET    | `/stats` | Platform statistics            |
| GET    | `/users` | All registered users           |

### Status Codes
| Code | Meaning |
| ---- | ------- |
| `200` | Request succeeded |
| `201` | Resource created |
| `400` | Validation failed (bad input, malformed UUID, weak password, invalid role) |
| `401` | Missing or invalid authentication token |
| `403` | Authenticated but not permitted for this role or resource |
| `404` | Resource does not exist |
| `409` | Resource conflicts with an existing record |
| `500` | Unexpected server error |

All `:id` parameters are UUIDs. A malformed identifier returns `400` before any database
query runs; a well-formed but unknown UUID returns `404`.

## Roles and Permissions

| Capability                          | Citizen | Entrepreneur | Authority | Admin |
| ----------------------------------- | :-----: | :----------: | :-------: | :---: |
| Report an issue                     |    Y    |              |           |   Y   |
| View own issues                     |    Y    |              |           |   Y   |
| View all issues                     |         |              |     Y     |   Y   |
| Change issue status                 |         |              |     Y     |   Y   |
| Create business profile             |         |      Y       |           |   Y   |
| Manage own services                 |         |      Y       |           |   Y   |
| Send / respond to inquiries         |    Y    |      Y       |           |   Y   |
| Approve business profiles           |         |              |           |   Y   |
| Manage content and categories       |         |              |           |   Y   |
| View statistics                     |         |              |           |   Y   |

Registration only permits the `citizen` and `entrepreneur` roles. Attempting to register as
`admin` or `authority` returns `403` - those roles are provisioned internally.

## Database Schema

| Table                 | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `users`               | Accounts with role and hashed password             |
| `user_profiles`       | Extended citizen profile data                      |
| `business_categories` | Admin-managed marketplace categories               |
| `entrepreneur_profiles` | Business profile and approval status             |
| `services`            | Service listings owned by a business               |
| `service_images`      | Additional service images                          |
| `inquiries`           | Customer questions and entrepreneur responses       |
| `issues`              | Infrastructure damage reports                      |
| `issue_status_history`| Immutable status change log                        |
| `admin_content`       | Published guidance articles                        |
| `complaints`          | Complaints filed by users                          |

## Production Notes

Before deploying:

1. Set `NODE_ENV=production` and a strong, unique `JWT_SECRET` in `backend/.env`.
2. Restrict `CLIENT_URL` to your deployed frontend origin.
3. Serve `frontend/dist` as static files and point `VITE_API_URL` at your API host.
4. Move uploads to durable object storage (S3/GCS) rather than the local `uploads` folder.
5. Run the app under a process manager (pm2/systemd) behind a reverse proxy with TLS.
6. Add database migrations if you evolve the schema beyond `initDb.js`.