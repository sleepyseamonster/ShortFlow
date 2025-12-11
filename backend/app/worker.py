import asyncio
import logging

from .scheduler import ingestion_scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    ingestion_scheduler.start()
    logger.info("Ingestion worker started.")
    loop = asyncio.get_event_loop()
    try:
        loop.run_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down ingestion worker...")
    finally:
        ingestion_scheduler.shutdown()


if __name__ == "__main__":
    main()
