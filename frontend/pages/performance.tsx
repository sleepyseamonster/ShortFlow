import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlass } from "phosphor-react";
import { PerformanceScatter, ReelPerformance } from "../components/PerformanceScatter";

type PlatformFilter = "all" | "instagram" | "tiktok" | "youtube";
type DateRange = "7d" | "30d" | "90d";
type CategoryFilter = "All" | (typeof NICHES)[number]["value"];
type TrendDirection = "up" | "stable" | "down";

type TrendingVideo = ReelPerformance & {
  platform_label: "Instagram" | "TikTok" | "YouTube";
  category: Exclude<CategoryFilter, "All"> | string;
  completion_rate: number;
  click_through_rate: number;
  watch_time_seconds: number;
  trend_direction: TrendDirection;
  rank: number;
};

type ScoredVideo = TrendingVideo & {
  outlierMultiplier: number;
  isIqrOutlier: boolean;
  baselineViews: number;
  iqrUpperFence: number;
};

const SCRAPE_CADENCE = "Daily scrape · 00:00 UTC";
const SCRAPE_NOTE = "Scrape pipeline not yet wired; displaying sample cohort.";
const OUTLIER_MULTIPLIER_THRESHOLD = 3; // placeholder until scrape-derived thresholds arrive
const BREAKOUT_SCORE = 95;

const NICHES = [
  { value: "Religion", label: "Religion", tone: "premium" as const },
  { value: "Spirituality", label: "Spirituality", tone: "premium" as const },
  { value: "Wisdom", label: "Wisdom", tone: "premium" as const },
  { value: "Health & Fitness", label: "Health & Fitness", tone: "premium" as const },
  { value: "Pets", label: "Pets", tone: "premium" as const },
  { value: "Vikings", label: "Vikings", tone: "premium" as const },
  { value: "AI News & Tools", label: "AI News & Tools", tone: "premium" as const },
  { value: "Consumer", label: "Consumer", tone: "premium" as const },
  { value: "Adorable", label: "Adorable", tone: "premium" as const },
  { value: "AI Vlogs", label: "AI Vlogs", tone: "premium" as const },
  { value: "Fantasy", label: "Fantasy", tone: "entertainment" as const },
  { value: "Hybrid & Fusion", label: "Hybrid & Fusion", tone: "entertainment" as const },
  { value: "History", label: "History", tone: "entertainment" as const },
  { value: "Bizarre", label: "Bizarre", tone: "entertainment" as const },
  { value: "Horror", label: "Horror", tone: "entertainment" as const },
  { value: "Luxury", label: "Luxury", tone: "entertainment" as const },
  { value: "Shocking Realistic", label: "SHOCKING \"Realistic\"", tone: "entertainment" as const },
];

const SAMPLE_IMAGES = [
  "https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/3771836/pexels-photo-3771836.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1181352/pexels-photo-1181352.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/3937174/pexels-photo-3937174.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/6335029/pexels-photo-6335029.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/574070/pexels-photo-574070.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const TRENDING_VIDEOS: TrendingVideo[] = [
  {
    reel_id: "ig_aurora_flow",
    reel_url: "https://www.instagram.com/reel/aurora_flow",
    platform: "instagram",
    platform_label: "Instagram",
    category: "Wisdom",
    creator_username: "studio.verve",
    caption_text: "Morning reset in 30 seconds. Coffee, light, and a one-line mantra.",
    thumbnail_url: SAMPLE_IMAGES[0],
    publish_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 1270000,
    likes: 83000,
    comments: 4600,
    shares_or_saves: 18900,
    hours_since_publish: 6,
    views_per_hour: 211666,
    engagement_rate: 0.083,
    views_percentile: 98.2,
    views_per_hour_percentile: 98.5,
    engagement_rate_percentile: 96.8,
    performance_score: 98.6,
    completion_rate: 0.72,
    click_through_rate: 0.17,
    watch_time_seconds: 38,
    trend_direction: "up",
    rank: 1,
  },
  {
    reel_id: "tt_loop_burn",
    reel_url: "https://www.tiktok.com/@fitloop/video/loop_burn",
    platform: "tiktok",
    platform_label: "TikTok",
    category: "Health & Fitness",
    creator_username: "fitloop",
    caption_text: "7-sec loop challenge. Shoulders + cardio. Save and try tonight.",
    thumbnail_url: SAMPLE_IMAGES[1],
    publish_time: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 980000,
    likes: 91000,
    comments: 7200,
    shares_or_saves: 24100,
    hours_since_publish: 14,
    views_per_hour: 70000,
    engagement_rate: 0.091,
    views_percentile: 96.8,
    views_per_hour_percentile: 95.5,
    engagement_rate_percentile: 97.4,
    performance_score: 97.2,
    completion_rate: 0.69,
    click_through_rate: 0.21,
    watch_time_seconds: 41,
    trend_direction: "up",
    rank: 2,
  },
  {
    reel_id: "yt_short_ai",
    reel_url: "https://www.youtube.com/shorts/ai_bts",
    platform: "youtube",
    platform_label: "YouTube",
    category: "AI News & Tools",
    creator_username: "neontech",
    caption_text: "AI b-roll workflow that cuts edit time in half.",
    thumbnail_url: SAMPLE_IMAGES[2],
    publish_time: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 1460000,
    likes: 61000,
    comments: 3400,
    shares_or_saves: 12700,
    hours_since_publish: 36,
    views_per_hour: 40555,
    engagement_rate: 0.062,
    views_percentile: 97.5,
    views_per_hour_percentile: 92.1,
    engagement_rate_percentile: 88.3,
    performance_score: 94.1,
    completion_rate: 0.68,
    click_through_rate: 0.19,
    watch_time_seconds: 35,
    trend_direction: "up",
    rank: 3,
  },
  {
    reel_id: "ig_glowedit",
    reel_url: "https://www.instagram.com/reel/glowedit",
    platform: "instagram",
    platform_label: "Instagram",
    category: "Consumer",
    creator_username: "glowedit",
    caption_text: "One brush, 2 minutes, glass-skin finish. No filter.",
    thumbnail_url: SAMPLE_IMAGES[3],
    publish_time: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 640000,
    likes: 41000,
    comments: 2100,
    shares_or_saves: 8200,
    hours_since_publish: 20,
    views_per_hour: 32000,
    engagement_rate: 0.074,
    views_percentile: 93.4,
    views_per_hour_percentile: 90.2,
    engagement_rate_percentile: 91.1,
    performance_score: 92.5,
    completion_rate: 0.66,
    click_through_rate: 0.15,
    watch_time_seconds: 33,
    trend_direction: "stable",
    rank: 4,
  },
  {
    reel_id: "tt_foodheat",
    reel_url: "https://www.tiktok.com/@heatseekers/video/spicy_udon",
    platform: "tiktok",
    platform_label: "TikTok",
    category: "Bizarre",
    creator_username: "heatseekers",
    caption_text: "Spicy udon in 90 seconds. POV chef cam + crunch audio.",
    thumbnail_url: SAMPLE_IMAGES[4],
    publish_time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 520000,
    likes: 48000,
    comments: 2600,
    shares_or_saves: 19400,
    hours_since_publish: 8,
    views_per_hour: 65000,
    engagement_rate: 0.082,
    views_percentile: 92.5,
    views_per_hour_percentile: 94.2,
    engagement_rate_percentile: 93.8,
    performance_score: 94.6,
    completion_rate: 0.74,
    click_through_rate: 0.23,
    watch_time_seconds: 36,
    trend_direction: "up",
    rank: 5,
  },
  {
    reel_id: "yt_newsflash",
    reel_url: "https://www.youtube.com/shorts/newsflash",
    platform: "youtube",
    platform_label: "YouTube",
    category: "History",
    creator_username: "nowstream",
    caption_text: "Overnight market recap in 45s. Charts only, no fluff.",
    thumbnail_url: SAMPLE_IMAGES[5],
    publish_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 430000,
    likes: 22000,
    comments: 980,
    shares_or_saves: 5600,
    hours_since_publish: 6,
    views_per_hour: 71666,
    engagement_rate: 0.048,
    views_percentile: 90.1,
    views_per_hour_percentile: 93.2,
    engagement_rate_percentile: 72.4,
    performance_score: 90.3,
    completion_rate: 0.61,
    click_through_rate: 0.12,
    watch_time_seconds: 29,
    trend_direction: "up",
    rank: 6,
  },
  {
    reel_id: "ig_runclub",
    reel_url: "https://www.instagram.com/reel/runclub",
    platform: "instagram",
    platform_label: "Instagram",
    category: "Health & Fitness",
    creator_username: "runclub",
    caption_text: "Zone 2 to sprint in 12s. Split-screen pacing you can copy.",
    thumbnail_url: SAMPLE_IMAGES[6],
    publish_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 360000,
    likes: 27000,
    comments: 1600,
    shares_or_saves: 9100,
    hours_since_publish: 4,
    views_per_hour: 90000,
    engagement_rate: 0.076,
    views_percentile: 88.6,
    views_per_hour_percentile: 96.1,
    engagement_rate_percentile: 92.3,
    performance_score: 93.8,
    completion_rate: 0.7,
    click_through_rate: 0.2,
    watch_time_seconds: 34,
    trend_direction: "up",
    rank: 7,
  },
  {
    reel_id: "tt_studiotour",
    reel_url: "https://www.tiktok.com/@studio/videostour",
    platform: "tiktok",
    platform_label: "TikTok",
    category: "AI Vlogs",
    creator_username: "studiolab",
    caption_text: "Desk tour for editors: shortcuts, macros, and lighting presets.",
    thumbnail_url: SAMPLE_IMAGES[7],
    publish_time: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 260000,
    likes: 21000,
    comments: 1200,
    shares_or_saves: 4800,
    hours_since_publish: 18,
    views_per_hour: 14444,
    engagement_rate: 0.061,
    views_percentile: 82.2,
    views_per_hour_percentile: 74.5,
    engagement_rate_percentile: 84.1,
    performance_score: 80.4,
    completion_rate: 0.58,
    click_through_rate: 0.14,
    watch_time_seconds: 27,
    trend_direction: "stable",
    rank: 8,
  },
  {
    reel_id: "yt_gaming_ultra",
    reel_url: "https://www.youtube.com/shorts/ultra_run",
    platform: "youtube",
    platform_label: "YouTube",
    category: "Fantasy",
    creator_username: "lvlup",
    caption_text: "Speedrun strat fixed: new glide cancel saves 2.4s.",
    thumbnail_url: SAMPLE_IMAGES[8],
    publish_time: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 890000,
    likes: 52000,
    comments: 2800,
    shares_or_saves: 6800,
    hours_since_publish: 30,
    views_per_hour: 29666,
    engagement_rate: 0.058,
    views_percentile: 95.4,
    views_per_hour_percentile: 89.5,
    engagement_rate_percentile: 82.2,
    performance_score: 90.8,
    completion_rate: 0.64,
    click_through_rate: 0.18,
    watch_time_seconds: 31,
    trend_direction: "stable",
    rank: 9,
  },
  {
    reel_id: "ig_moodboard",
    reel_url: "https://www.instagram.com/reel/moodboard",
    platform: "instagram",
    platform_label: "Instagram",
    category: "Hybrid & Fusion",
    creator_username: "patternlabs",
    caption_text: "Design sprint moodboard in 45s. Palette, shots, and hooks.",
    thumbnail_url: SAMPLE_IMAGES[9],
    publish_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 310000,
    likes: 19000,
    comments: 900,
    shares_or_saves: 5100,
    hours_since_publish: 12,
    views_per_hour: 25833,
    engagement_rate: 0.055,
    views_percentile: 86.4,
    views_per_hour_percentile: 85.1,
    engagement_rate_percentile: 79.4,
    performance_score: 86.2,
    completion_rate: 0.6,
    click_through_rate: 0.13,
    watch_time_seconds: 28,
    trend_direction: "stable",
    rank: 10,
  },
  {
    reel_id: "tt_citynight",
    reel_url: "https://www.tiktok.com/@loopcity/video/nightloop",
    platform: "tiktok",
    platform_label: "TikTok",
    category: "Luxury",
    creator_username: "loopcity",
    caption_text: "City night loop with ambient audio. Perfect for bg.",
    thumbnail_url: SAMPLE_IMAGES[10],
    publish_time: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 295000,
    likes: 26000,
    comments: 1400,
    shares_or_saves: 7300,
    hours_since_publish: 22,
    views_per_hour: 13409,
    engagement_rate: 0.067,
    views_percentile: 84.1,
    views_per_hour_percentile: 77.3,
    engagement_rate_percentile: 86.6,
    performance_score: 84.9,
    completion_rate: 0.62,
    click_through_rate: 0.16,
    watch_time_seconds: 30,
    trend_direction: "down",
    rank: 11,
  },
  {
    reel_id: "yt_labdrop",
    reel_url: "https://www.youtube.com/shorts/labdrop",
    platform: "youtube",
    platform_label: "YouTube",
    category: "AI News & Tools",
    creator_username: "labdrop",
    caption_text: "Studio lighting test: three looks you can copy in 5m.",
    thumbnail_url: SAMPLE_IMAGES[11],
    publish_time: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    latest_scraped_at: new Date().toISOString(),
    views: 410000,
    likes: 24000,
    comments: 1500,
    shares_or_saves: 4300,
    hours_since_publish: 40,
    views_per_hour: 10250,
    engagement_rate: 0.053,
    views_percentile: 88.8,
    views_per_hour_percentile: 72.6,
    engagement_rate_percentile: 78.2,
    performance_score: 82.1,
    completion_rate: 0.57,
    click_through_rate: 0.12,
    watch_time_seconds: 26,
    trend_direction: "down",
    rank: 12,
  },
];

const dateOptions: { label: string; value: DateRange }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

const formatNumber = (value: number) => value.toLocaleString();
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
const formatCompact = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
const formatAgo = (publish: string) => {
  const diffHours = (Date.now() - new Date(publish).getTime()) / (1000 * 60 * 60);
  if (diffHours < 1) return `${Math.max(1, Math.round(diffHours * 60))}m ago`;
  if (diffHours < 48) return `${Math.round(diffHours)}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
};
const formatHandle = (handle?: string | null) => {
  if (!handle) return "";
  return handle.startsWith("@") ? handle : `@${handle}`;
};
const median = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};
const iqrStats = (values: number[]) => {
  if (!values.length) return { q1: 0, q3: 0, iqr: 0, upperFence: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const q1Pos = (sorted.length - 1) * 0.25;
  const q3Pos = (sorted.length - 1) * 0.75;
  const lerp = (pos: number) => {
    const lower = Math.floor(pos);
    const upper = Math.ceil(pos);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (pos - lower);
  };
  const q1 = lerp(q1Pos);
  const q3 = lerp(q3Pos);
  const iqr = q3 - q1;
  const upperFence = q3 + 1.5 * iqr;
  return { q1, q3, iqr, upperFence };
};
const nextUtcMidnight = () => {
  const next = new Date();
  next.setUTCDate(next.getUTCDate() + 1);
  next.setUTCHours(0, 0, 0, 0);
  return next.toUTCString();
};

type CardProps = {
  video: ScoredVideo;
  onClick: () => void;
};

const CompactVideoCard = ({ video, onClick }: CardProps) => (
  <article className="compact-card" onClick={onClick} role="button" tabIndex={0}
    aria-pressed="false"
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}>
    <div className="compact-thumb">
      <img src={video.thumbnail_url || ""} alt={video.caption_text || "Video thumbnail"} loading="lazy" />
      <span className="rank-badge">#{video.rank}</span>
    </div>
    <div className="compact-body">
      <h4 className="compact-title" title={video.caption_text || ""}>
        {video.caption_text || "Untitled"}
      </h4>
      <div className="compact-metrics">
        <span className="metric-views">{formatCompact(video.views)} views</span>
        <span className="outlier-badge">{video.outlierMultiplier.toFixed(1)}× over median</span>
      </div>
      <div className="compact-meta">
        <span className={`platform-pill tiny ${video.platform}`}>{video.platform_label}</span>
        <span className="pill tiny">{video.category}</span>
        <span className="pill tiny">{formatAgo(video.publish_time)}</span>
        <span className="pill tiny">ER {formatPercent(video.engagement_rate)}</span>
      </div>
    </div>
  </article>
);

type ModalProps = {
  video?: ScoredVideo;
  open: boolean;
  onClose: () => void;
};

const VideoDetailModal = ({ video, open, onClose }: ModalProps) => {
  if (!open || !video) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-shell"
        role="dialog"
        aria-modal="true"
        aria-label="Video detail"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="modal-row">
          <div className="modal-thumb phone">
            <img src={video.thumbnail_url || ""} alt={video.caption_text || ""} />
          </div>
          <div className="modal-column">
            <p className="eyebrow">{video.platform_label.toUpperCase()}</p>
            <h3 className="modal-title">{video.caption_text || "Untitled"}</h3>
            <p className="subdued">{formatHandle(video.creator_username)} · {formatAgo(video.publish_time)}</p>
            <div className="pill-stack">
              <span className="pill pill-amber">Rank #{video.rank}</span>
              <span className="pill pill-teal">{video.category}</span>
            </div>

            <div className="snapshot">
              <p className="tiny subdued">Performance snapshot</p>
              <div className="snapshot-row">
                <span className="pill pill-ghost strong">{formatCompact(video.views)} views</span>
                <span className="pill pill-amber strong">Outlier {video.outlierMultiplier.toFixed(2)}×</span>
                <span className="pill pill-ghost">{formatCompact(video.views_per_hour)}/hr</span>
                <span className="pill pill-ghost">ER {formatPercent(video.engagement_rate)}</span>
              </div>
            </div>

            <div className="modal-metric-grid">
              <div>
                <p className="metric-label">Views</p>
                <p className="metric-value">{formatCompact(video.views)}</p>
                <p className="metric-label tiny">IQR fence {formatCompact(video.iqrUpperFence)}</p>
              </div>
              <div>
                <p className="metric-label">Outlier factor</p>
                <p className="metric-value">{video.outlierMultiplier.toFixed(2)}×</p>
                <p className="metric-label tiny">Platform median {formatCompact(video.baselineViews)}</p>
              </div>
              <div>
                <p className="metric-label">Velocity</p>
                <p className="metric-value">{formatCompact(video.views_per_hour)}/hr</p>
                <p className="metric-label tiny">{video.views_per_hour_percentile.toFixed(1)}pctl</p>
              </div>
              <div>
                <p className="metric-label">Engagement</p>
                <p className="metric-value">{formatPercent(video.engagement_rate)}</p>
                <p className="metric-label tiny">Comments {formatCompact(video.comments)}</p>
              </div>
              <div>
                <p className="metric-label">Shares/Saves</p>
                <p className="metric-value">{formatCompact(video.shares_or_saves || 0)}</p>
                <p className="metric-label tiny">Likes {formatCompact(video.likes)}</p>
              </div>
              <div>
                <p className="metric-label">Completion</p>
                <p className="metric-value">{formatPercent(video.completion_rate)}</p>
                <p className="metric-label tiny">Avg watch {video.watch_time_seconds}s</p>
              </div>
            </div>

            <div className="modal-divider" />
            <div className="modal-actions">
              <Link href={video.reel_url} target="_blank" rel="noreferrer" className="primary-btn full">
                Open on platform ↗
              </Link>
            </div>

            <details className="modal-accordion">
              <summary>Analytics breakdown</summary>
              <p className="subdued tiny">
                Outlier = views ÷ platform median (time window). IQR upper fence = Q3 + 1.5×IQR. Velocity = views per hour. Engagement = likes + comments + saves vs views.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

type CohortProps = {
  dataset: ScoredVideo[];
  advancedOpen: boolean;
  onToggle: () => void;
};

const CohortAnalyticsSection = ({ dataset, advancedOpen, onToggle }: CohortProps) => {
  const breakoutCount = dataset.filter((d) => d.performance_score >= BREAKOUT_SCORE).length;
  const breakoutShare = dataset.length ? (breakoutCount / dataset.length) * 100 : 0;
  const medianEngagement = median(dataset.map((d) => d.engagement_rate * 100));
  const medianVelocity = median(dataset.map((d) => d.views_per_hour));
  const top = dataset.length
    ? dataset.reduce((prev, curr) => (curr.performance_score > prev.performance_score ? curr : prev), dataset[0])
    : undefined;
  const medianOutlier = median(dataset.map((d) => d.outlierMultiplier));

  return (
    <section className="panel">
      <button className="collapse-header" onClick={onToggle} aria-expanded={advancedOpen}>
        <span>{advancedOpen ? "Advanced cohort analytics ▴" : "Advanced cohort analytics ▾"}</span>
      </button>
      {advancedOpen ? (
        <>
          <div className="stat-rail minimal">
            <div className="stat-card">
              <p className="stat-label">Breakout share</p>
              <p className="stat-value">
                <span>{breakoutShare.toFixed(0)}%</span>
              </p>
              <p className="stat-sub">{breakoutCount} videos ≥ {BREAKOUT_SCORE} score</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Median engagement</p>
              <p className="stat-value">{medianEngagement.toFixed(2)}%</p>
              <p className="stat-sub">Across current filters</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Median velocity</p>
              <p className="stat-value">{formatCompact(medianVelocity)}/hr</p>
              <p className="stat-sub">Views per hour</p>
            </div>
            <div className="stat-card stat-card-accent">
              <p className="stat-label">Median outlier factor</p>
              <p className="stat-value">{medianOutlier ? `${medianOutlier.toFixed(1)}×` : "—"}</p>
              <p className="stat-sub">Outlier baseline multiplier</p>
            </div>
          </div>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Momentum field</p>
              <h3>Velocity vs engagement</h3>
            </div>
            <span className="chip">Cohort · {dataset.length}</span>
          </div>
          <PerformanceScatter data={dataset} loading={false} />
        </>
      ) : null}
    </section>
  );
};

export default function PerformanceAnalyticsPage() {
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [selectedId, setSelectedId] = useState<string>(TRENDING_VIDEOS[0].reel_id);
  const [outliersOnly, setOutliersOnly] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [minViews, setMinViews] = useState<string>("");
  const [minLikes, setMinLikes] = useState<string>("");
  const [minFollowers, setMinFollowers] = useState<string>("");
  const [maxFollowers, setMaxFollowers] = useState<string>("");
  const nextScrapeLabel = useMemo(() => nextUtcMidnight(), []);
  const lastScrapeLabel = useMemo(() => new Date().toUTCString(), []);

  const { filtered } = useMemo<{
    filtered: ScoredVideo[];
  }>(() => {
    const windowHours = dateRange === "7d" ? 168 : dateRange === "30d" ? 720 : 2160;
    const windowed = TRENDING_VIDEOS.filter((video) => video.hours_since_publish <= windowHours)
      .filter((video) => (platform === "all" ? true : video.platform === platform))
      .filter((video) => (categoryFilter === "All" ? true : video.category === categoryFilter));

    const medianViewsAll = median(windowed.map((v) => v.views)) || 1;
    const platformBuckets = windowed.reduce<Record<string, number[]>>((acc, video) => {
      acc[video.platform] = acc[video.platform] || [];
      acc[video.platform].push(video.views);
      return acc;
    }, {});
    const platformMedianViews: Record<string, number> = Object.fromEntries(
      Object.entries(platformBuckets).map(([key, values]) => [key, median(values) || medianViewsAll]),
    );
    const viewsForIqr = windowed.map((v) => v.views);
    const { upperFence } = iqrStats(viewsForIqr);

    const scored: ScoredVideo[] = windowed
      .map((video) => {
        const baseline = platformMedianViews[video.platform] || medianViewsAll || 1;
        const outlierMultiplier = video.views / baseline;
        const isIqrOutlier = video.views > upperFence;
        return { ...video, outlierMultiplier, isIqrOutlier, baselineViews: baseline, iqrUpperFence: upperFence };
      })
      .sort((a, b) => a.rank - b.rank);

    const filtered = outliersOnly
      ? scored.filter((v) => v.outlierMultiplier >= OUTLIER_MULTIPLIER_THRESHOLD)
      : scored;

    return { filtered };
  }, [dateRange, platform, categoryFilter, outliersOnly]);

  useEffect(() => {
    if (filtered.length && !filtered.find((v) => v.reel_id === selectedId)) {
      setSelectedId(filtered[0].reel_id);
    }
  }, [filtered, selectedId]);

  const selectedVideo = useMemo(() => {
    if (!filtered.length) return undefined;
    return filtered.find((v) => v.reel_id === selectedId) || filtered[0];
  }, [filtered, selectedId]);

  const dataset = filtered;

  const aggregate = useMemo(() => {
    if (!dataset.length) {
      return {
        avgEngagement: 0,
        avgCompletion: 0,
        totalViews: 0,
        topCategory: "—",
        fastestPlatform: "—",
        trendingDirection: "stable" as TrendDirection,
      };
    }

    const avgEngagement = dataset.reduce((sum, v) => sum + v.engagement_rate, 0) / dataset.length;
    const avgCompletion = dataset.reduce((sum, v) => sum + v.completion_rate, 0) / dataset.length;
    const totalViews = dataset.reduce((sum, v) => sum + v.views, 0);
    const byPlatform = dataset.reduce<Record<string, { velocity: number; count: number }>>((acc, v) => {
      acc[v.platform] = acc[v.platform] || { velocity: 0, count: 0 };
      acc[v.platform].velocity += v.views_per_hour;
      acc[v.platform].count += 1;
      return acc;
    }, {});
    const fastestPlatform =
      Object.entries(byPlatform)
        .map(([key, value]) => ({ key, speed: value.velocity / value.count }))
        .sort((a, b) => b.speed - a.speed)[0]?.key || "—";

    const byCategory = dataset.reduce<Record<string, { score: number; count: number }>>((acc, v) => {
      acc[v.category] = acc[v.category] || { score: 0, count: 0 };
      acc[v.category].score += v.performance_score;
      acc[v.category].count += 1;
      return acc;
    }, {});
    const topCategory =
      Object.entries(byCategory)
        .map(([key, value]) => ({ key, score: value.score / value.count }))
        .sort((a, b) => b.score - a.score)[0]?.key || "—";

    const directionScore =
      dataset.reduce((score, v) => {
        if (v.trend_direction === "up") return score + 1;
        if (v.trend_direction === "down") return score - 1;
        return score;
      }, 0) / dataset.length;
    const trendingDirection: TrendDirection = directionScore > 0.15 ? "up" : directionScore < -0.15 ? "down" : "stable";

    return { avgEngagement, avgCompletion, totalViews, topCategory, fastestPlatform, trendingDirection };
  }, [dataset]);

  const highestViewsVideo = useMemo(
    () => (dataset.length ? [...dataset].sort((a, b) => b.views - a.views)[0] : undefined),
    [dataset],
  );

  const strongestOutlier = useMemo(
    () => (dataset.length ? Math.max(...dataset.map((v) => v.outlierMultiplier)) : 0),
    [dataset],
  );

  const medianOutlier = useMemo(() => median(dataset.map((v) => v.outlierMultiplier)), [dataset]);

  return (
    <>
      <Head>
        <title>ShortFlow · Performance Analytics</title>
        <meta
          name="description"
          content="Top-performing public videos trending across Instagram, TikTok, and YouTube with velocity, engagement, and completion."
        />
      </Head>
      <main className="page page-wide analytics-page minimal">
        <div className="page-top minimal">
          <Link href="/" className="ghost-btn small">← Back</Link>
        </div>

        <section className="filter-bar">
          <div className="filter-group">
            <div className="segmented">
              {dateOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={dateRange === opt.value ? "active" : ""}
                  onClick={() => setDateRange(opt.value)}
                  aria-pressed={dateRange === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="platform-toggle compact">
              {(["all", "instagram", "tiktok", "youtube"] as PlatformFilter[]).map((value) => (
                <button
                  key={value}
                  className={`platform-pill small ${platform === value ? "active" : ""}`}
                  onClick={() => setPlatform(value)}
                  aria-pressed={platform === value}
                >
                  {value === "all" ? "All" : value === "instagram" ? "Instagram" : value === "tiktok" ? "TikTok" : "YouTube"}
                </button>
              ))}
            </div>
            <div className="pill-select">
              <select
                className="niche-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                aria-label="Select niche"
              >
                <option value="All">All niches</option>
                {NICHES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className={`outlier-btn ${outliersOnly ? "active" : ""}`}
              onClick={() => setOutliersOnly((v) => !v)}
              aria-pressed={outliersOnly}
              title="Outlier = views / platform median"
            >
              Outliers
            </button>
            <div className="search-chip primary">
              <span className="search-icon" aria-hidden>
                <MagnifyingGlass size={16} weight="bold" />
              </span>
              <input
                type="text"
                placeholder="Search keywords, niches, creators…"
                aria-label="Search"
              />
            </div>
          </div>
        </section>

        <section className="filter-bar sub">
          <div className="filter-group">
            <div className="input-chip">
              <label className="tiny subdued" htmlFor="minViews">Min views</label>
              <input
                id="minViews"
                type="number"
                placeholder="0"
                value={minViews}
                onChange={(e) => setMinViews(e.target.value)}
              />
            </div>
            <div className="input-chip">
              <label className="tiny subdued" htmlFor="minLikes">Min likes</label>
              <input
                id="minLikes"
                type="number"
                placeholder="0"
                value={minLikes}
                onChange={(e) => setMinLikes(e.target.value)}
              />
            </div>
            <div className="input-chip">
              <label className="tiny subdued" htmlFor="minFollowers">Min followers</label>
              <input
                id="minFollowers"
                type="number"
                placeholder="0"
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
              />
            </div>
            <div className="input-chip">
              <label className="tiny subdued" htmlFor="maxFollowers">Max followers</label>
              <input
                id="maxFollowers"
                type="number"
                placeholder="Any"
                value={maxFollowers}
                onChange={(e) => setMaxFollowers(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="list-section">
          <div className="section-heading minimal">
            <div>
              <p className="eyebrow">Trending</p>
              <h3>Top videos</h3>
              <p className="tiny subdued">Sorted by views × outlier score</p>
            </div>
            <span className="pill tiny">{dataset.length} results</span>
          </div>
          {dataset.length ? (
            <div className="compact-grid">
              {dataset.map((video) => (
                <CompactVideoCard
                  key={video.reel_id}
                  video={video}
                  onClick={() => {
                    setSelectedId(video.reel_id);
                    setShowDetail(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="chart-empty">No videos match the current filters.</div>
          )}
        </section>

        <CohortAnalyticsSection
          dataset={dataset}
          advancedOpen={advancedOpen}
          onToggle={() => setAdvancedOpen((v) => !v)}
        />

        <VideoDetailModal video={selectedVideo} open={showDetail} onClose={() => setShowDetail(false)} />
      </main>
    </>
  );
}
