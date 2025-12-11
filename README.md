# ShortFlow v1

Performance-first Instagram Reels measurement stack. Ingest via Apify every 6 hours, store immutable raw events in Supabase/Postgres, derive percentiles for the last 7 days, and visualize on a dark-mode scatter plot.

## Tech
- Backend: FastAPI, SQLAlchemy, Alembic, APScheduler, PostgreSQL (Supabase)
- Frontend: Next.js + Recharts
- Ingestion: Apify actor API

## Setup
1) Duplicate `.env.example` to `.env` and fill in:
   - `DATABASE_URL`: Supabase Postgres connection string (service role). For this project: `postgresql+psycopg://postgres:<service-role-password>@db.jwmcytzyhcvacjwqtynn.supabase.co:5432/postgres` (use the pooler host/port if preferred).
   - `API_AUTH_TOKEN`: bearer token for protected ingest/status endpoints.
   - `APIFY_API_TOKEN`, `APIFY_ACTOR_ID`: credentials + actor for Instagram recommended Reels feed.
2) Backend dependencies:
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
3) Apply schema (choose one):
   - Run Alembic: `alembic upgrade head`
   - Or paste `sql/create_reels_tables.sql` into the Supabase SQL editor (includes `ingestion_runs`).
4) Run API:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Or run the background worker only: `python -m app.worker`
5) Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The app reads `NEXT_PUBLIC_API_BASE` from `.env` (defaults to `http://localhost:8000`).

## Key Endpoints
- `GET /health` – service status
- `POST /ingest/run` – trigger an Apify ingestion and persist results (protected by `API_AUTH_TOKEN` if set)
- `GET /reels/performance` – latest 7-day cohort with derived metrics, percentiles, and performance score (platform query param)
- `GET /ingest/status` – last ingestion run summary + 7d freshness (protected by `API_AUTH_TOKEN` if set)

## Background Ingestion
- APScheduler runs the Apify pull every `INGESTION_INTERVAL_HOURS` (default 6h) when credentials are present.
- Raw events are appended; `reels_latest_state` is upserted on each run.

## Tests
- Basic metric/percentile test: `cd backend && pytest -q`

## Data Model
- `reels_raw_events`: immutable observations (required + optional fields per spec).
- `reels_latest_state`: rebuildable convenience snapshot for percentile calculations.
- `ingestion_runs`: ingestion bookkeeping (run status, events ingested, errors).

## Derived Metrics
- hours_since_publish, views_per_hour, engagement_rate
- Percentiles scoped to reels published in the last 7 days
- performance_score = 0.45*engagement_rate_pct + 0.40*views_per_hour_pct + 0.15*views_pct

## Visualization
- Single scatter plot (Recharts) with:
  - X: views_per_hour_percentile
  - Y: engagement_rate_percentile
  - Size: views
  - Tooltip: URL + raw metrics
  - Highlight: performance_score >= 95 uses Momentum Amber
