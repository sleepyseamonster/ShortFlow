# SOP: Ingestion & Data Refresh (Apify → Supabase)

Purpose: ensure Instagram Reels data flows every 6h via Apify, lands in Supabase, and is reflected in `reels_latest_state`.

## Prerequisites
- `.env` populated with `DATABASE_URL` (Supabase service role), `APIFY_API_TOKEN`, `APIFY_ACTOR_ID`.
- Supabase tables created via `alembic upgrade head` or `sql/create_reels_tables.sql`.
- Backend dependencies installed (`pip install -r backend/requirements.txt`).

## Manual ingestion run
1) Start backend (if not already): `cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000`.
2) Trigger ingestion: `curl -X POST http://localhost:8000/ingest/run`.
3) Confirm response shows `ingested_count` and `apify_run_id`.
4) Verify data:
   - `select count(*) from reels_raw_events;`
   - `select count(*) from reels_latest_state;`
   - Check recent publish window: `select min(publish_time), max(publish_time) from reels_raw_events;`

## Scheduled ingestion
- APScheduler starts on API startup when Apify creds exist.
- Interval controlled by `INGESTION_INTERVAL_HOURS` (default 6).
- Logs will show “Scheduled ingestion complete” with counts. Add log forwarding/alerts in production.

## Troubleshooting
- 0 rows ingested: check Apify actor output fields map (id/link/publishDate/playCounts). Update mapping if actor schema changed.
- Conflicts: unique constraint `uq_reel_scrape_run` prevents duplicate rows per run; ensure `scraped_at` is present in incoming items.
- Connection errors: validate `DATABASE_URL` and Supabase allows inbound from host.
- Run-id missing: API returns `apify_run_id="unknown-run"` if header absent; investigate Apify API response headers.

## Data hygiene
- `reels_latest_state` is rebuildable; to rebuild from scratch run a SQL script that re-aggregates from `reels_raw_events` (future task). Currently maintained via upsert on each ingestion.
- Keep `APIFY_MAX_RESULTS` near 200 to align with cadence and cost assumptions.

