# Documentation Overview & Needs

Current docs:
- `README.md`: setup, env, endpoints, visualization summary.
- `docs/sop_ingestion_and_refresh.md`: runbook for Apify → Supabase ingestion.
- `docs/backlog.md`: idea/task backlog.
- `docs/progress_log.md`: session log.
- `docs/api_reference.md`: endpoint details and sample payloads.
- `docs/deployment_guide.md`: how to deploy backend/frontend with envs and process guidance.
- `docs/run_visibility.md`: what to monitor and how to check ingestion health.

Recommended additions:
- **Testing Guide**: how to run unit tests (metrics math, ingestion mapping) and any linting/formatting.
- **Contributor Guide**: branching/PR expectations, code style, and how to add migrations safely.
- **Data Dictionary**: fields in `reels_raw_events` and `reels_latest_state` with meaning and types, plus derived metrics definitions.

Status: Core setup/ingestion/deployment visibility docs are present; add the above as we stabilize deployments and API usage.
