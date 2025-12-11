# ShortFlow Backlog & Ideas

Use this as the running list of tasks and future ideas. Keep items concise and scoped; move completed work into the progress log.

## Near-term (MVP hardening)
- Wire real `DATABASE_URL` (Supabase service role) and run Alembic or `sql/create_reels_tables.sql` in Supabase SQL.
- Add Apify credentials (`APIFY_API_TOKEN`, `APIFY_ACTOR_ID`) and validate output fields match ingestion mapping.
- Add minimal unit tests for percentile math and ingestion mapping.
- Add basic runtime logging/monitoring (structured logs, error alerts).
- Verify scheduler cadence (6h) in production runtime and cap result size to ~200 per run.

## Product/Data
- Add 7d cohort regeneration job to rebuild percentiles in case of data anomalies.
- Implement top-performer threshold marker (95th) tuning based on real data volume.
- Capture Apify actor input in config for versioning.

## Backend/Infra
- Add deploy artifacts (Dockerfile/compose or Procfile) for API + frontend bundle.
- Add healthcheck endpoint for scheduler status (last ingestion run, rows ingested).
- Add pagination support for `/reels/performance` if volume grows.
- Implement rate limiting or auth token for API access.

## Frontend/UX
- Add empty-state messaging when no data is available.
- Add “last refreshed” indicator and manual refresh button.
- Make tooltips resilient to long URLs (truncate with ellipsis).

## Documentation
- Write API endpoint reference with request/response examples.
- Add runbook for production ingestion failures and Apify errors.
- Create contributor guide (branching, linting, testing expectations).

## Later/Future (post-MVP)
- Add time-window selector (7d/30d) backed by proper queries.
- Multi-platform ingestion (TikTok/YouTube) with palette extensions.
- ML experiments: early performance prediction baseline once data is sufficient.

