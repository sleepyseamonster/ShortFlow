import React from "react";
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

export type ReelPerformance = {
  reel_id: string;
  reel_url: string;
  platform: string;
  publish_time: string;
  latest_scraped_at: string;
  views: number;
  likes: number;
  comments: number;
  shares_or_saves?: number | null;
  hours_since_publish: number;
  views_per_hour: number;
  engagement_rate: number;
  views_percentile: number;
  views_per_hour_percentile: number;
  engagement_rate_percentile: number;
  performance_score: number;
};

type Props = {
  data: ReelPerformance[];
  loading: boolean;
};

const formatNumber = (value: number) => value.toLocaleString();
const formatPercentile = (value: number) => `${value.toFixed(1)}pctl`;
const formatRate = (value: number) => `${(value * 100).toFixed(2)}%`;

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: ReelPerformance = payload[0].payload;
  return (
    <div className="tooltip-card">
      <a href={d.reel_url} target="_blank" rel="noreferrer" className="tooltip-title">
        {d.reel_url}
      </a>
      <div className="tooltip-metric">
        <span>Performance score</span>
        <strong>{d.performance_score.toFixed(2)}</strong>
      </div>
      <div className="tooltip-metric">
        <span>Engagement rate</span>
        <strong>{formatRate(d.engagement_rate)}</strong>
      </div>
      <div className="tooltip-metric">
        <span>Views per hour</span>
        <strong>{formatNumber(d.views_per_hour)}</strong>
      </div>
      <div className="tooltip-metric">
        <span>Views</span>
        <strong>{formatNumber(d.views)}</strong>
      </div>
      <div className="tooltip-meta">
        <span>Published</span>
        <span>{new Date(d.publish_time).toUTCString()}</span>
      </div>
    </div>
  );
};

export function PerformanceScatter({ data, loading }: Props) {
  const highlightThreshold = 95;
  const highlighted = data.filter((d) => d.performance_score >= highlightThreshold);
  const baseline = data.filter((d) => d.performance_score < highlightThreshold);

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Scatter · 7d cohort</p>
          <h2>Reels performance field</h2>
          <p className="subdued">X: views/hr percentile · Y: engagement percentile · Size: views</p>
        </div>
        <div className="chip-row">
          <span className="chip">Total: {data.length}</span>
          <span className="chip chip-highlight">Breakouts: {highlighted.length}</span>
        </div>
      </div>
      <div className="chart-shell">
        {loading ? (
          <div className="loading">Pulling latest signals…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid stroke="rgba(201,205,214,0.12)" />
              <XAxis
                type="number"
                dataKey="views_per_hour_percentile"
                name="Views/hour pct"
                domain={[0, 100]}
                tick={{ fill: "var(--color-ash-70)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-ash-40)" }}
                tickLine={{ stroke: "var(--color-ash-30)" }}
              />
              <YAxis
                type="number"
                dataKey="engagement_rate_percentile"
                name="Engagement pct"
                domain={[0, 100]}
                tick={{ fill: "var(--color-ash-70)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-ash-40)" }}
                tickLine={{ stroke: "var(--color-ash-30)" }}
              />
              <ZAxis type="number" dataKey="views" range={[60, 280]} name="Views" />
              <Tooltip cursor={{ stroke: "var(--color-ash-30)" }} content={<CustomTooltip />} />
              <Legend />
              <Scatter
                name="Cohort"
                data={baseline}
                fill="var(--color-teal-soft)"
                opacity={0.85}
                shape="circle"
              />
              <Scatter
                name="Top performers"
                data={highlighted}
                fill="var(--color-amber)"
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

