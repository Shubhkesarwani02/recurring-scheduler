Deployment steps for Render

This repository contains a Next.js frontend (in `frontend/`) and an Express TypeScript backend (in `backend/`). Below are two simple ways to deploy them on Render: using the provided `render.yaml` (recommended) or by creating two services manually in the Render dashboard.

Using render.yaml (recommended)

1. Push your repo to GitHub (if not already).
2. In Render, create a new "Web Service" and connect your GitHub account. When prompted, you can import from the repo directly (Render will detect `render.yaml`) or use the Import button and choose the `render.yaml` file in the repo.
3. Render will create two services described in `render.yaml`:
   - `recurring-scheduler-frontend` (Next.js)
   - `recurring-scheduler-backend` (Express/TypeScript)
4. Add environment variables in each service's dashboard (for backend at least):
   - DATABASE_URL (Postgres connection string) or use a managed Postgres add-on from Render
   - JWT_SECRET or any other secrets
   - FRONTEND_URL — the public URL of the frontend service (set after frontend is deployed)

Manual setup (alternate)

Frontend (Next.js)
- Environment: Node
- Build Command: cd frontend && npm ci && npm run build
- Start Command: cd frontend && npm run start

Backend (Express TypeScript)
- Environment: Node
- Build Command: cd backend && npm ci && npm run build
- Start Command: cd backend && npm run start
- Ensure the following env vars are set in the Render dashboard:
  - DATABASE_URL
  - JWT_SECRET
  - FRONTEND_URL (optional)

Notes / tweaks
- The backend listens on `process.env.PORT` (already implemented) so no changes are required for Render.
- The backend builds to `backend/dist` and the `start` script runs `node dist/index.js`.
- If you prefer a single Docker deployment, add a Dockerfile at repo root and create a Docker service in Render.

Optional Dockerfile (example for running both services in one container — not recommended for production):

```dockerfile
# Example: multi-service container (not recommended for production)
FROM node:20-alpine AS base
WORKDIR /app

# Install root dev deps (concurrently)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy everything
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm ci && npm run build

# Build backend
WORKDIR /app/backend
RUN npm ci && npm run build

# Final image: run concurrently (requires concurrently installed)
WORKDIR /app
ENV PORT=10000
CMD ["npx","concurrently","\"cd backend && npm run start\"","\"cd frontend && npm run start\""]
```

Troubleshooting
- If build fails on Render, check build logs. Common causes:
  - Missing env vars (DATABASE_URL, JWT_SECRET)
  - Private package registry or packages that require auth
  - Out-of-date Node version; set the Node version in Render environment to >=18

If you want, I can create a simple `render/` folder with per-service README or add a Dockerfile tuned for Render.
