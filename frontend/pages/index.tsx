import Head from "next/head";
import { useEffect, useState } from "react";
import { PerformanceScatter, ReelPerformance } from "../components/PerformanceScatter";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function Home() {
  const [data, setData] = useState<ReelPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/reels/performance`);
        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }
        const json = await res.json();
        setData(json.items || []);
      } catch (err: any) {
        setError(err.message || "Unable to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Head>
        <title>ShortFlow · Reel performance</title>
        <meta
          name="description"
          content="ShortFlow measures Instagram Reels performance via engagement and velocity percentiles."
        />
      </Head>
      <main className="page">
        <div className="hero">
          <div>
            <div className="badge">ShortFlow · v1</div>
            <h1 className="title">Instagram Reels performance index</h1>
            <p className="lede">
              Measurement-first analytics for algorithmically recommended Reels. Each point is one Reel: scored by
              engagement percentile, velocity, and total views within the last 7 days.
            </p>
          </div>
        </div>
        {error ? (
          <div className="panel">
            <p className="subdued">Error loading data: {error}</p>
          </div>
        ) : (
          <PerformanceScatter data={data} loading={loading} />
        )}
        <div className="footer">Data refresh cadence: every 6 hours · Percentiles scoped to 7-day publishes.</div>
      </main>
    </>
  );
}

