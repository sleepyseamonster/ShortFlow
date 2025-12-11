import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from . import ingestion
from .config import settings
from .db import SessionLocal

logger = logging.getLogger(__name__)


class IngestionScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler(timezone="UTC")
        self.started = False

    async def _run_ingestion(self):
        session = SessionLocal()
        try:
            result = ingestion.run_ingestion(session)
            logger.info("Scheduled ingestion complete: %s", result)
        except Exception:
            logger.exception("Scheduled ingestion failed")
        finally:
            session.close()

    def start(self):
        if self.started:
            return
        if not settings.apify_api_token or not settings.apify_actor_id:
            logger.warning("Apify credentials missing; skipping scheduler start.")
            return
        self.scheduler.add_job(self._run_ingestion, "interval", hours=settings.ingestion_interval_hours)
        self.scheduler.start()
        self.started = True
        logger.info("Ingestion scheduler started. Interval: %sh", settings.ingestion_interval_hours)

    def shutdown(self):
        if self.started:
            self.scheduler.shutdown(wait=False)
            self.started = False


ingestion_scheduler = IngestionScheduler()

