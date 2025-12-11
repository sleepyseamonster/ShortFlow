import os
from functools import lru_cache
from typing import Optional

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    database_url: str = Field(..., env="DATABASE_URL")
    apify_api_token: Optional[str] = Field(None, env="APIFY_API_TOKEN")
    apify_actor_id: Optional[str] = Field(None, env="APIFY_ACTOR_ID")
    apify_max_results: int = Field(200, env="APIFY_MAX_RESULTS")
    ingestion_interval_hours: int = Field(6, env="INGESTION_INTERVAL_HOURS")
    environment: str = Field("local", env="ENVIRONMENT")
    api_auth_token: Optional[str] = Field(None, env="API_AUTH_TOKEN")
    default_platform: str = Field("instagram", env="DEFAULT_PLATFORM")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    # Ensures we only load and parse environment variables once.
    return Settings()


settings = get_settings()
