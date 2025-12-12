-- Prototype table for tracking saved creators per user
create table if not exists saved_creators (
    id uuid primary key default gen_random_uuid(),
    handle text not null,
    platform text not null, -- 'instagram' | 'tiktok' | 'youtube'
    followers integer default 0,
    avg_views integer default 0,
    user_id uuid default auth.uid(), -- optional: link to auth.users
    created_at timestamptz not null default now()
);

create index if not exists ix_saved_creators_handle on saved_creators (handle);
create index if not exists ix_saved_creators_user_platform on saved_creators (user_id, platform);

