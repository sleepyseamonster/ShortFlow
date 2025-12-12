import Head from "next/head";
import Link from "next/link";

export default function MediaLibrary() {
  return (
    <>
      <Head>
        <title>ShortPulse · Media Library</title>
        <meta name="description" content="Secure per-user media library." />
      </Head>
      <main className="page page-wide">
        <div className="page-top">
          <Link href="/" className="ghost-btn small">← Back</Link>
        </div>
        <section className="hero-banner">
          <div className="hero-text">
            <div className="badge">Media Library</div>
            <h1 className="title">Secure, per-user storage</h1>
            <p className="lede">
              Store images, videos, exports, and organized content. Strict isolation by user—no one can access another
              user’s media or exports.
            </p>
            <div className="pill-stack">
              <span className="pill pill-teal">User isolation</span>
              <span className="pill">Images & video</span>
              <span className="pill pill-amber">Organized content</span>
            </div>
          </div>
          <div className="hero-right">
            <div className="stat-grid">
              <div className="stat-card-alt">
                <p className="stat-label">Access</p>
                <p className="stat-value">User-scoped</p>
                <p className="stat-hint">Never shared by default</p>
              </div>
              <div className="stat-card-alt">
                <p className="stat-label">Formats</p>
                <p className="stat-value">Images · Video</p>
                <p className="stat-hint">Exports & assets</p>
              </div>
              <div className="stat-card-alt">
                <p className="stat-label">Status</p>
                <p className="stat-value">Available</p>
                <p className="stat-hint">Navigate from dashboard</p>
              </div>
            </div>
          </div>
        </section>
        <div className="panel">
          <p className="subdued">
            Hook this page to Supabase auth and storage. Enforce RLS and per-user bucket paths. No cross-user access to
            media, exports, or metadata.
          </p>
        </div>
      </main>
    </>
  );
}
