# Deployment Guide (Backend + Frontend)

This guide covers running ShortPulse in a target environment (VM/container). Adjust paths and process managers as needed.

## Requirements
- Supabase/Postgres connection string (service role) in `DATABASE_URL`.
- Apify credentials: `APIFY_API_TOKEN`, `APIFY_ACTOR_ID`.
- Node 18+, Python 3.10+, and Postgres reachable from host.

## Backend (FastAPI)
1) Environment:
   - Set env vars: `DATABASE_URL`, `APIFY_API_TOKEN`, `APIFY_ACTOR_ID`, `APIFY_MAX_RESULTS` (default 200), `INGESTION_INTERVAL_HOURS` (default 6).
2) Install:
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
3) Migrate DB:
   ```bash
   alembic upgrade head
   ```
   (Or run `sql/create_reels_tables.sql` in Supabase SQL editor.)
4) Run service (example with uvicorn):
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   For production, run behind a reverse proxy and supervise with systemd or a process manager (e.g., `gunicorn -k uvicorn.workers.UvicornWorker app.main:app`).
5) Health/visibility:
   - Health: `GET /health`
   - Ingestion status: `GET /ingest/status`
   - Manual trigger: `POST /ingest/run`

## Frontend (Next.js)
1) Environment:
   - Set `NEXT_PUBLIC_API_BASE` to the backend URL (e.g., `https://api.shortflow.yourdomain.com`).
2) Install/build:
   ```bash
   cd frontend
   npm install
   npm run build
   npm start   # serves on port 3000 by default
   ```
   For static hosting, `next export` can be added if desired; otherwise serve with Node.
3) Reverse proxy:
   - Proxy port 3000 behind your web server (NGINX/Caddy) with TLS.

## Logs & monitoring
- Direct backend stdout/stderr to your log stack; ensure rotation.
- Consider adding uptime checks for `/health` and data freshness checks using `/ingest/status`.
- Alert on failed ingestion (0 `events_last_run` for multiple intervals) or DB connectivity errors.

## Zero-downtime tips
- Run migrations before swapping traffic.
- Start new backend instance, verify health endpoints, then switch proxy upstreams.
