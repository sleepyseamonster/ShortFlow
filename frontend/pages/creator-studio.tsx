import Head from "next/head";
import Link from "next/link";

export default function CreatorStudio() {
  return (
    <>
      <Head>
        <title>ShortPulse · Creator Studio</title>
        <meta name="description" content="Creator Studio coming soon." />
      </Head>
      <main className="page page-wide">
        <div className="page-top">
          <Link href="/" className="ghost-btn small">← Back</Link>
        </div>
        <section className="hero-banner">
          <div className="hero-text">
            <div className="badge">Creator Studio</div>
            <h1 className="title">Coming soon</h1>
            <p className="lede">
              A workspace for scripting, ideation, AI assists, and batch planning. We’ll wire this up next; for now,
              bookmark it from your dashboard.
            </p>
            <div className="pill-stack">
              <span className="pill pill-amber">Storyboards</span>
              <span className="pill">Hooks & scripts</span>
              <span className="pill pill-teal">AI assists</span>
            </div>
          </div>
          <div className="hero-right">
            <div className="stat-grid">
              <div className="stat-card-alt">
                <p className="stat-label">Status</p>
                <p className="stat-value">Building</p>
                <p className="stat-hint">Prototype in progress</p>
              </div>
              <div className="stat-card-alt">
                <p className="stat-label">Focus</p>
                <p className="stat-value">Ideation → Execution</p>
                <p className="stat-hint">Funnel for creators</p>
              </div>
              <div className="stat-card-alt">
                <p className="stat-label">Launch</p>
                <p className="stat-value">TBD</p>
                <p className="stat-hint">Watch this space</p>
              </div>
            </div>
          </div>
        </section>
        <div className="panel">
          <p className="subdued">
            We’ll add creation workflows, templates, and AI helpers here. Your media stays isolated per user—no shared
            access to other accounts.
          </p>
        </div>
      </main>
    </>
  );
}
