# Run Visibility & Monitoring

Purpose: provide quick signals that ingestion and scoring are healthy.

## Endpoints
- `GET /health`: base uptime check.
- `GET /ingest/status`: last scrape timestamp, last Apify run id, events ingested in last run, total rows, latest snapshot count, and 7-day publish count.
- `POST /ingest/run`: manual trigger if scheduler is paused or recovering.

## What to watch
- `events_last_run` should be near expected volume (~200). Consecutive zeros indicate Apify or mapping issues.
- `last_scraped_at` should update every `INGESTION_INTERVAL_HOURS` (default 6h).
- `reels_published_last_7d` should grow steadily; sudden drops suggest ingestion failures or publish_time mapping issues.

## Operational checks
- Database freshness queries:
  - `select max(scraped_at) from reels_raw_events;`
  - `select count(*) from reels_raw_events where publish_time >= now() - interval '7 days';`
- Logs: ingest job start/complete messages and exceptions (`Scheduled ingestion complete`, `Scheduled ingestion failed`).

## Alert ideas
- Alert if `last_scraped_at` older than 2× interval.
- Alert if `events_last_run` < expected threshold for 2 runs.
- Alert on DB connection errors in logs.

