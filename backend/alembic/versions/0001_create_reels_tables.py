"""create reels tables"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "reels_raw_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("reel_id", sa.String(), nullable=False),
        sa.Column("platform", sa.String(), nullable=False, server_default="instagram"),
        sa.Column("reel_url", sa.String(), nullable=False),
        sa.Column("scraped_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("publish_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("views", sa.Integer(), nullable=False),
        sa.Column("likes", sa.Integer(), nullable=False),
        sa.Column("comments", sa.Integer(), nullable=False),
        sa.Column("shares_or_saves", sa.Integer(), nullable=True),
        sa.Column("caption_text", sa.Text(), nullable=True),
        sa.Column("audio_id", sa.String(), nullable=True),
        sa.Column("audio_name", sa.String(), nullable=True),
        sa.Column("duration_seconds", sa.Float(), nullable=True),
        sa.Column("apify_run_id", sa.String(), nullable=False),
        sa.Column("source_surface", sa.String(), nullable=False, server_default="reels_feed"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.UniqueConstraint("reel_id", "scraped_at", "apify_run_id", name="uq_reel_scrape_run"),
    )
    op.create_index("ix_reels_raw_events_reel_id_publish", "reels_raw_events", ["reel_id", "publish_time"])
    op.create_index(op.f("ix_reels_raw_events_scraped_at"), "reels_raw_events", ["scraped_at"])
    op.create_index(op.f("ix_reels_raw_events_publish_time"), "reels_raw_events", ["publish_time"])

    op.create_table(
        "reels_latest_state",
        sa.Column("reel_id", sa.String(), primary_key=True, nullable=False),
        sa.Column("platform", sa.String(), nullable=False, server_default="instagram"),
        sa.Column("reel_url", sa.String(), nullable=False),
        sa.Column("publish_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("latest_views", sa.Integer(), nullable=False),
        sa.Column("latest_likes", sa.Integer(), nullable=False),
        sa.Column("latest_comments", sa.Integer(), nullable=False),
        sa.Column("latest_shares_or_saves", sa.Integer(), nullable=True),
        sa.Column("latest_scraped_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("caption_text", sa.Text(), nullable=True),
        sa.Column("audio_id", sa.String(), nullable=True),
        sa.Column("audio_name", sa.String(), nullable=True),
        sa.Column("duration_seconds", sa.Float(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=True),
    )
    op.create_index("ix_reels_latest_state_publish_time", "reels_latest_state", ["publish_time"])


def downgrade():
    op.drop_index("ix_reels_latest_state_publish_time", table_name="reels_latest_state")
    op.drop_table("reels_latest_state")
    op.drop_index("ix_reels_raw_events_reel_id_publish", table_name="reels_raw_events")
    op.drop_index(op.f("ix_reels_raw_events_scraped_at"), table_name="reels_raw_events")
    op.drop_index(op.f("ix_reels_raw_events_publish_time"), table_name="reels_raw_events")
    op.drop_table("reels_raw_events")

