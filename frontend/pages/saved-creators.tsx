import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ensureSupabaseClient } from "../lib/supabaseClient";

type Platform = "Instagram" | "TikTok" | "YouTube";

type Creator = {
  id: string;
  handle: string;
  platform: Platform;
  followers: number;
  avgViews: number;
  videosTracked: number;
};

const INITIAL_CREATORS: Creator[] = [
  { id: "1", handle: "patternlabs", platform: "Instagram", followers: 120000, avgViews: 68000, videosTracked: 42 },
  { id: "2", handle: "loopcity", platform: "TikTok", followers: 450000, avgViews: 150000, videosTracked: 88 },
  { id: "3", handle: "neontech", platform: "YouTube", followers: 220000, avgViews: 94000, videosTracked: 63 },
];

export default function SavedCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>(INITIAL_CREATORS);
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<Platform>("Instagram");
  const [followers, setFollowers] = useState("");
  const [avgViews, setAvgViews] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return creators;
    return creators.filter((c) => c.handle.toLowerCase().includes(term));
  }, [creators, search]);

  const addCreator = async (e: FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    const supabase = ensureSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    const newCreator: Creator = {
      id: `${Date.now()}`,
      handle: handle.trim().replace(/^@/, ""),
      platform,
      followers: followers ? Number(followers) : 0,
      avgViews: avgViews ? Number(avgViews) : 0,
      videosTracked: 0,
    };
    // Optimistic UI update
    setCreators((prev) => [newCreator, ...prev]);

    try {
      const { error } = await supabase.from("saved_creators").insert({
        handle: newCreator.handle,
        platform: newCreator.platform.toLowerCase(),
        followers: newCreator.followers,
        avg_views: newCreator.avgViews,
        user_id: userData?.user?.id ?? null,
      });
      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error inserting creator into Supabase", error);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Supabase client not available or other error", err);
    }

    setHandle("");
    setFollowers("");
    setAvgViews("");
  };

  const formatNumber = (n: number) =>
    new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

  return (
    <>
      <Head>
        <title>ShortPulse · Saved creators</title>
        <meta name="description" content="Track saved creators for Reels, TikTok, and Shorts analytics." />
      </Head>
      <main className="page page-wide">
        <div className="page-top">
          <Link href="/" className="ghost-btn small">← Back to dashboard</Link>
          <h1 className="title">Saved creators</h1>
          <p className="subdued">Build a list of creators to follow and surface in your analytics filters.</p>
        </div>

        <section className="panel creator-panel">
          <div className="creator-form-header">
            <h3>Track a creator</h3>
            <p className="subdued tiny">Handles feed your filters in Performance Analytics.</p>
          </div>
          <form className="creator-form" onSubmit={addCreator}>
            <div className="input-chip">
              <label className="tiny subdued" htmlFor="creatorHandle">Handle</label>
              <input
                id="creatorHandle"
                type="text"
                placeholder="@handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
              />
            </div>
            <div className="input-chip">
              <label className="tiny subdued" htmlFor="platform">Platform</label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>
            <div className="input-chip">
              <label className="tiny subdued" htmlFor="followers">Followers</label>
              <input
                id="followers"
                type="number"
                placeholder="0"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
              />
            </div>
            <div className="input-chip">
              <label className="tiny subdued" htmlFor="avgViews">Avg views</label>
              <input
                id="avgViews"
                type="number"
                placeholder="0"
                value={avgViews}
                onChange={(e) => setAvgViews(e.target.value)}
              />
            </div>
            <div className="creator-form-actions">
              <button className="primary-btn small" type="submit">Add creator</button>
            </div>
          </form>
        </section>

        <section className="panel creator-panel">
          <div className="creator-form-header">
            <h3>Creator list</h3>
            <input
              className="creator-search"
              type="text"
              placeholder="Search saved creators"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search creators"
            />
          </div>
          <div className="creator-grid">
            {filtered.map((creator) => (
              <div className="creator-card" key={creator.id}>
                <div className="creator-card-top">
                  <span className="pill pill-ghost">{creator.platform}</span>
                  <span className="pill pill-teal">@{creator.handle}</span>
                </div>
                <div className="creator-card-body">
                  <div>
                    <p className="metric-label">Followers</p>
                    <p className="metric-value">{formatNumber(creator.followers)}</p>
                  </div>
                  <div>
                    <p className="metric-label">Avg views</p>
                    <p className="metric-value">{formatNumber(creator.avgViews)}</p>
                  </div>
                  <div>
                    <p className="metric-label">Videos tracked</p>
                    <p className="metric-value">{creator.videosTracked}</p>
                  </div>
                </div>
              </div>
            ))}
            {!filtered.length && <div className="subdued tiny">No creators match your search.</div>}
          </div>
        </section>
      </main>
    </>
  );
}
