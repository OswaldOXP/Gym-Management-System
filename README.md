# Gym Management System (Full Stack)

A full-stack Gym Management web application built with React (frontend), Node.js/Express (backend), and MongoDB.

## Features

- JWT Authentication with role-based access (`admin`, `trainer`, `member`)
- Landing page + public modules
- Dashboard modules:
  - Member Registration / Management
  - Subscription Plans
  - Trainer Scheduling
  - Attendance Tracking
  - Payment Module / Billing
  - Workout Plan Management
  - Reports & Analytics
- Admin controls for protected resources
- API-first frontend with local fallback when backend is unavailable

## Tech Stack

- Frontend: React + Vite + React Router + Recharts
- Backend: Node.js + Express + JWT + Mongoose
- Database: MongoDB

## Project Structure

- `src/` - React app
- `server/index.js` - Express API
- `server/seed.js` - MongoDB seed script
- `server/.env.example` - backend environment template
- `.env.example` - root environment template

## Setup

1. Install dependencies

```bash
npm install
```

1. Configure environment

- Copy `.env.example` to `.env` (root) and edit values, or
- Copy `server/.env.example` to `server/.env` and edit values

1. (Optional but recommended) seed MongoDB

```bash
npm run seed
```

## Run

### Full stack in one command

```bash
npm run dev:full
```

This starts:

- API at `http://localhost:4000`
- Frontend at `http://localhost:3000`

### Run separately

```bash
npm run dev:backend
npm run dev:frontend
```

## Build Frontend

```bash
npm run build
npm run preview
```

## API Notes

- Health: `GET /api/health`
- Auth:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/me`
- CRUD resources:
  - `/api/members`
  - `/api/sessions`
  - `/api/payments`
  - `/api/workouts`
  - `/api/subscriptions`
  - `/api/attendance`
  - `/api/messages`
- Public contact endpoint:
  - `POST /api/public/messages`
- Code review graph file:
  - `code-review-graph.md` is the visible generated graph file in the project root

## Demo Credentials

- Admin: `admin@ironcore.com` / `admin123`
- Trainer: `trainer@ironcore.com` / `train123`
- Member: `member@ironcore.com` / `member123`

## Deployment Tips

- Set strong `JWT_SECRET` in production.
- Use a managed MongoDB instance.
- Set `VITE_API_BASE_URL` in frontend env to your deployed API URL.
- Set `CORS_ORIGIN` to your frontend domain(s) in production.
# Gym-Management
