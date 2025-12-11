# API Reference

Base URL defaults to `http://localhost:8000` (override with `NEXT_PUBLIC_API_BASE` for frontend).

## Health
- `GET /health`
  - Response: `{"status": "ok", "environment": "<env>"}`.

## Manual ingestion
- `POST /ingest/run`
  - Purpose: Trigger Apify run and persist results.
  - Response: `{"ingested_count": <int>, "apify_run_id": "<run-id>"}`.
  - Errors: 500 if Apify credentials are missing or the run fails.

## Ingestion status
- `GET /ingest/status`
  - Purpose: Quick visibility into last successful ingestion and data freshness.
  - Response example:
    ```json
    {
      "last_scraped_at": "2025-12-11T00:00:00Z",
      "last_apify_run_id": "abc123",
      "events_last_run": 198,
      "total_raw_events": 10234,
      "latest_state_count": 812,
      "reels_published_last_7d": 645
    }
    ```

## Performance data
- `GET /reels/performance`
  - Purpose: Return latest-state reels published in the last 7 days with derived metrics, percentiles, and performance score.
  - Response:
    ```json
    {
      "items": [
        {
          "reel_id": "123",
          "reel_url": "https://www.instagram.com/reel/123/",
          "platform": "instagram",
          "publish_time": "2025-12-10T05:00:00Z",
          "latest_scraped_at": "2025-12-10T11:00:00Z",
          "views": 1500,
          "likes": 200,
          "comments": 40,
          "shares_or_saves": 15,
          "hours_since_publish": 6,
          "views_per_hour": 250,
          "engagement_rate": 0.17,
          "views_percentile": 90,
          "views_per_hour_percentile": 95,
          "engagement_rate_percentile": 97,
          "performance_score": 95.6
        }
      ]
    }
    ```
  - Notes: Scope is 7-day publishes only; no pagination yet.

