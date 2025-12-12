-- ShortPulse schema bootstrap for Supabase/Postgres
create table if not exists reels_raw_events (
    id uuid primary key default gen_random_uuid(),
    reel_id text not null,
    platform text not null default 'instagram',
    reel_url text not null,
    scraped_at timestamptz not null,
    publish_time timestamptz not null,
    views integer not null,
    likes integer not null,
    comments integer not null,
    shares_or_saves integer,
    caption_text text,
    audio_id text,
    audio_name text,
    duration_seconds double precision,
    apify_run_id text not null,
    source_surface text not null default 'reels_feed',
    created_at timestamptz not null default now(),
    unique (reel_id, scraped_at, apify_run_id)
);

create index if not exists ix_reels_raw_events_reel_id_publish on reels_raw_events (reel_id, publish_time);
create index if not exists ix_reels_raw_events_scraped_at on reels_raw_events (scraped_at);
create index if not exists ix_reels_raw_events_publish_time on reels_raw_events (publish_time);

create table if not exists reels_latest_state (
    reel_id text primary key,
    platform text not null default 'instagram',
    reel_url text not null,
    publish_time timestamptz not null,
    latest_views integer not null,
    latest_likes integer not null,
    latest_comments integer not null,
    latest_shares_or_saves integer,
    latest_scraped_at timestamptz not null,
    caption_text text,
    audio_id text,
    audio_name text,
    duration_seconds double precision,
    updated_at timestamptz default now()
);

create index if not exists ix_reels_latest_state_publish_time on reels_latest_state (publish_time);
