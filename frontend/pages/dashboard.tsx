import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Bell, CaretDown, ChartLineUp, FolderSimpleLock, GearSix, Sparkle, UserList } from "phosphor-react";
import { ensureSupabaseClient } from "../lib/supabaseClient";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const supabase = ensureSupabaseClient();
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user ?? null);
      });
    } catch {
      setUser(null);
    }
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email || "Guest";
  const initials =
    (displayName || "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SP";
  const workspaceLabel = user ? "Creator Workspace" : "Not signed in";

  return (
    <>
      <Head>
        <title>ShortPulse · Dashboard</title>
        <meta
          name="description"
          content="ShortPulse dashboard with performance analytics, creator studio, and media library."
        />
      </Head>
      <main className="page page-wide">
        <header className="app-bar">
          <Link href="/" className="brand-mark">
            <span className="logo-dot" />
            <span className="brand-name">ShortPulse</span>
            <span className="brand-sub">Dashboard</span>
          </Link>
          <div className="user-cluster">
            <div className="icon-row">
              <button className="icon-btn" aria-label="Notifications">
                <Bell size={16} weight="bold" />
              </button>
              <button className="icon-btn" aria-label="Settings">
                <GearSix size={16} weight="bold" />
              </button>
            </div>
            <div className="avatar">{initials}</div>
            <div className="user-meta">
              <span className="user-name">{displayName}</span>
              <span className="workspace">{workspaceLabel}</span>
            </div>
            <span className="brand-sub">
              <CaretDown size={14} weight="bold" />
            </span>
          </div>
        </header>

        <section className="workspace-grid">
          <div className="workspace-left">
            <div className="section-heading minimal">
              <div>
                <p className="eyebrow">Tools</p>
              </div>
            </div>

            <div className="module-grid">
              <Link href="/performance" className="module-tile emphasized">
                <div className="module-top">
                  <span className="pill pill-teal">Live</span>
                </div>
                <div className="tool-icon">
                  <ChartLineUp size={18} weight="bold" />
                </div>
                <h3>Performance Analytics</h3>
                <p>Explore high-performing Reels, TikToks, and Shorts.</p>
                <div className="dash-cta">
                  <span>Open →</span>
                </div>
              </Link>

              <Link href="/saved-creators" className="module-tile">
                <div className="module-top">
                  <span className="pill pill-teal">Beta</span>
                </div>
                <div className="tool-icon">
                  <UserList size={18} weight="bold" />
                </div>
                <h3>Saved Creators</h3>
                <p>Track handles you follow for analytics filters.</p>
                <div className="dash-cta">
                  <span>Open →</span>
                </div>
              </Link>

              <Link href="/creator-studio" className="module-tile disabled-card" aria-disabled>
                <div className="module-top">
                  <span className="pill pill-amber">Coming soon</span>
                </div>
                <div className="tool-icon">
                  <Sparkle size={18} weight="bold" />
                </div>
                <h3>Creator Studio</h3>
                <p>AI-assisted ideas and hooks.</p>
                <div className="dash-cta">
                  <span>Coming soon</span>
                </div>
              </Link>

              <Link href="/media-library" className="module-tile">
                <div className="module-top">
                  <span className="pill">Secure</span>
                </div>
                <div className="tool-icon">
                  <FolderSimpleLock size={18} weight="bold" />
                </div>
                <h3>Media Library</h3>
                <p>Your private vault for creative assets.</p>
                <div className="dash-cta">
                  <span>Open →</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="workspace-right">
            <div className="panel placeholder-panel">
              <p className="eyebrow">Workspace</p>
              <p className="subdued tiny">Reserved for upcoming modules.</p>
            </div>
          </div>
        </section>

        <div className="footer">
          ShortPulse keeps your performance data and media private to your account.
        </div>
      </main>
    </>
  );
}
