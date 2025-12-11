import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID

from .db import Base


class ReelRawEvent(Base):
    __tablename__ = "reels_raw_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reel_id = Column(String, nullable=False)
    platform = Column(String, nullable=False, default="instagram")
    reel_url = Column(String, nullable=False)
    scraped_at = Column(DateTime(timezone=True), nullable=False, index=True)
    publish_time = Column(DateTime(timezone=True), nullable=False, index=True)
    views = Column(Integer, nullable=False)
    likes = Column(Integer, nullable=False)
    comments = Column(Integer, nullable=False)
    shares_or_saves = Column(Integer)
    caption_text = Column(Text)
    audio_id = Column(String)
    audio_name = Column(String)
    duration_seconds = Column(Float)
    apify_run_id = Column(String, nullable=False)
    source_surface = Column(String, nullable=False, default="reels_feed")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("reel_id", "scraped_at", "apify_run_id", name="uq_reel_scrape_run"),
        Index("ix_reels_raw_events_reel_id_publish", "reel_id", "publish_time"),
    )


class ReelLatestState(Base):
    __tablename__ = "reels_latest_state"

    reel_id = Column(String, primary_key=True)
    platform = Column(String, nullable=False, default="instagram")
    reel_url = Column(String, nullable=False)
    publish_time = Column(DateTime(timezone=True), nullable=False)
    latest_views = Column(Integer, nullable=False)
    latest_likes = Column(Integer, nullable=False)
    latest_comments = Column(Integer, nullable=False)
    latest_shares_or_saves = Column(Integer)
    latest_scraped_at = Column(DateTime(timezone=True), nullable=False)
    caption_text = Column(Text)
    audio_id = Column(String)
    audio_name = Column(String)
    duration_seconds = Column(Float)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("ix_reels_latest_state_publish_time", "publish_time"),
    )

