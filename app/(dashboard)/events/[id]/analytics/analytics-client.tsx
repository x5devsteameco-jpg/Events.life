'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface AnalyticsData {
  event: {
    id: string;
    title: string;
    slug: string;
    date: Date;
    status: string;
    maxAttendees: number | null;
  };
  stats: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    waitlisted: number;
    pageViewCount: number;
    conversionRate: string;
    uniqueVisitors: number;
    attributedViews: number;
  };
  dailyRsvps: { date: string; count: number }[];
  dailyViews: { date: string; count: number }[];
  topReferers: { source: string; count: number }[];
  topCampaigns: { campaign: string; count: number }[];
  topPaths: { path: string; count: number }[];
  quality: {
    recentViews: number;
    recentRsvps: number;
    viewsTrendPct: number;
    rsvpTrendPct: number;
    attributionRate: number;
  };
}

function MiniLineChart({
  data,
  color,
  height = 80,
}: {
  data: { date: string; count: number }[];
  color: string;
  height?: number;
}) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const w = 100 / (data.length - 1);
  const points = data
    .map((d, i) => `${i * w},${height - (d.count / maxVal) * (height - 8)}`)
    .join(' ');
  const area =
    `M0,${height} ` +
    data.map((d, i) => `L${i * w},${height - (d.count / maxVal) * (height - 8)}`).join(' ') +
    ` L${100},${height} Z`;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.length > 0 && (
        <circle
          cx={`${(data.length - 1) * w}`}
          cy={`${height - (data[data.length - 1].count / maxVal) * (height - 8)}`}
          r="2.5"
          fill={color}
        />
      )}
    </svg>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(12,26,31,0.7)',
        border: `1px solid ${color}22`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#4d7a90' }}>
        {label}
      </p>
      <p className="text-3xl font-black" style={{ color, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.04em' }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: '#4d7a90' }}>{sub}</p>}
    </motion.div>
  );
}

function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const r = 36;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;

  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const offset = cumulative;
    cumulative += pct;
    return { ...seg, pct, offset };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-28 h-28 flex-shrink-0">
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="10"
            strokeDasharray={`${arc.pct * circumference} ${circumference}`}
            strokeDashoffset={-arc.offset * circumference}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
          />
        ))}
        <circle cx={cx} cy={cy} r="26" fill="rgba(2,4,8,0.9)" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#e8f4f8" fontSize="14" fontWeight="bold">
          {total}
        </text>
        <text x={cx} y={cy + 13} textAnchor="middle" fill="#4d7a90" fontSize="6">
          total
        </text>
      </svg>
      <div className="space-y-2 flex-1">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: arc.color }} />
              <span className="text-xs" style={{ color: '#7aafc4' }}>{arc.label}</span>
            </div>
            <span className="text-xs font-bold" style={{ color: arc.color }}>
              {arc.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, color }: { data: { date: string; count: number }[]; color: string }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  // Show last 14 days for readability
  const visible = data.slice(-14);
  return (
    <div className="flex items-end gap-0.5 h-24 w-full">
      {visible.map((d, i) => {
        const h = Math.max((d.count / maxVal) * 100, d.count > 0 ? 6 : 0);
        const label = d.date.slice(5); // MM-DD
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 group relative" title={`${d.date}: ${d.count}`}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.02, duration: 0.4 }}
              className="w-full rounded-t-sm min-h-0"
              style={{ background: d.count > 0 ? color : 'rgba(255,255,255,0.05)', minHeight: d.count > 0 ? 4 : 2 }}
            />
            {i % 3 === 0 && (
              <span className="text-[8px] rotate-0 opacity-40" style={{ color: '#4d7a90' }}>
                {label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function exportToCSV(data: AnalyticsData) {
  const rows = [
    ['Date', 'RSVPs'],
    ...data.dailyRsvps.map((d) => [d.date, d.count.toString()]),
    [],
    ['Status', 'Count'],
    ['Confirmed', data.stats.confirmed.toString()],
    ['Pending', data.stats.pending.toString()],
    ['Cancelled', data.stats.cancelled.toString()],
    ['Waitlisted', data.stats.waitlisted.toString()],
    [],
    ['Source', 'Views'],
    ...data.topReferers.map((r) => [r.source, r.count.toString()]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.event.slug}-analytics.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const [chartTab, setChartTab] = useState<'rsvps' | 'views'>('rsvps');

  const trendTone = (value: number) => {
    if (value > 0) return '#10b981';
    if (value < 0) return '#ff3cac';
    return '#4d7a90';
  };

  const donutSegments = [
    { label: 'Confirmed', value: data.stats.confirmed, color: '#00e5cc' },
    { label: 'Pending', value: data.stats.pending, color: '#f59e0b' },
    { label: 'Waitlisted', value: data.stats.waitlisted, color: '#9c6bff' },
    { label: 'Cancelled', value: data.stats.cancelled, color: '#ff3cac' },
  ];

  const capacityPct =
    data.event.maxAttendees && data.event.maxAttendees > 0
      ? Math.round((data.stats.confirmed / data.event.maxAttendees) * 100)
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="Total RSVPs" value={data.stats.total} color="#00e5cc" delay={0} />
        <StatCard label="Confirmed" value={data.stats.confirmed} color="#10b981" delay={0.05} />
        <StatCard label="Pending" value={data.stats.pending} color="#f59e0b" delay={0.1} />
        <StatCard label="Waitlisted" value={data.stats.waitlisted} color="#9c6bff" delay={0.15} />
        <StatCard label="Page Views" value={data.stats.pageViewCount} color="#38bdf8" delay={0.2} />
        <StatCard label="Conversion" value={`${data.stats.conversionRate}%`} sub="views → RSVP" color="#ff3cac" delay={0.25} />
        <StatCard label="Unique Visitors" value={data.stats.uniqueVisitors} color="#8b5cf6" delay={0.3} />
        <StatCard label="Attributed" value={data.stats.attributedViews} sub="views with UTM" color="#f97316" delay={0.35} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <h2 className="font-bold text-[#e8f4f8] mb-3">Signal Health</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span style={{ color: '#7aafc4' }}>Views (7d)</span>
              <span className="font-semibold" style={{ color: '#38bdf8' }}>{data.quality.recentViews}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#7aafc4' }}>RSVPs (7d)</span>
              <span className="font-semibold" style={{ color: '#00e5cc' }}>{data.quality.recentRsvps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#7aafc4' }}>Views Trend</span>
              <span className="font-semibold" style={{ color: trendTone(data.quality.viewsTrendPct) }}>{data.quality.viewsTrendPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#7aafc4' }}>RSVP Trend</span>
              <span className="font-semibold" style={{ color: trendTone(data.quality.rsvpTrendPct) }}>{data.quality.rsvpTrendPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#7aafc4' }}>Attribution Coverage</span>
              <span className="font-semibold" style={{ color: data.quality.attributionRate >= 50 ? '#10b981' : '#f59e0b' }}>{data.quality.attributionRate}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="rounded-2xl p-5 lg:col-span-2"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <h2 className="font-bold text-[#e8f4f8] mb-3">Actionable Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="font-semibold mb-1" style={{ color: '#7aafc4' }}>Traffic Momentum</p>
              <p style={{ color: '#b9d5df' }}>
                {data.quality.viewsTrendPct >= 0
                  ? 'Traffic is stable or rising versus the previous week.'
                  : 'Traffic is softer week-over-week; increase distribution and ad-slot coverage.'}
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="font-semibold mb-1" style={{ color: '#7aafc4' }}>RSVP Momentum</p>
              <p style={{ color: '#b9d5df' }}>
                {data.quality.rsvpTrendPct >= 0
                  ? 'RSVP conversion is holding or improving this week.'
                  : 'RSVPs are slipping; review funnel copy and confirmation flow friction.'}
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="font-semibold mb-1" style={{ color: '#7aafc4' }}>Attribution Quality</p>
              <p style={{ color: '#b9d5df' }}>
                {data.quality.attributionRate >= 60
                  ? 'Attribution quality is strong for campaign-level optimization.'
                  : 'Add UTM tags consistently to improve campaign attribution confidence.'}
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="font-semibold mb-1" style={{ color: '#7aafc4' }}>Signal Confidence</p>
              <p style={{ color: '#b9d5df' }}>
                {data.stats.uniqueVisitors >= 25
                  ? 'Visitor volume is high enough for reliable weekly comparison.'
                  : 'Small sample size; treat week-over-week changes as directional only.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart + Donut row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#e8f4f8]">30-Day Trend</h2>
            <div className="flex gap-1">
              {(['rsvps', 'views'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChartTab(tab)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: chartTab === tab ? 'rgba(0,229,204,0.15)' : 'transparent',
                    color: chartTab === tab ? '#00e5cc' : '#4d7a90',
                    border: `1px solid ${chartTab === tab ? 'rgba(0,229,204,0.3)' : 'transparent'}`,
                  }}
                >
                  {tab === 'rsvps' ? 'RSVPs' : 'Views'}
                </button>
              ))}
            </div>
          </div>
          <BarChart
            data={chartTab === 'rsvps' ? data.dailyRsvps : data.dailyViews}
            color={chartTab === 'rsvps' ? '#00e5cc' : '#38bdf8'}
          />
        </motion.div>

        {/* Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <h2 className="font-bold text-[#e8f4f8] mb-4">RSVP Breakdown</h2>
          <DonutChart segments={donutSegments} />
          {capacityPct !== null && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#4d7a90' }}>Capacity</span>
                <span style={{ color: '#00e5cc' }}>{capacityPct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,229,204,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(capacityPct, 100)}%`, background: '#00e5cc' }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: '#4d7a90' }}>
                {data.stats.confirmed} / {data.event.maxAttendees} spots filled
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Conversion funnel + Traffic sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Conversion funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <h2 className="font-bold text-[#e8f4f8] mb-5">Conversion Funnel</h2>
          {[
            { label: 'Page Views', value: data.stats.pageViewCount, color: '#38bdf8', pct: 100 },
            { label: 'Total RSVPs', value: data.stats.total, color: '#9c6bff', pct: data.stats.pageViewCount > 0 ? Math.round((data.stats.total / data.stats.pageViewCount) * 100) : 0 },
            { label: 'Confirmed', value: data.stats.confirmed, color: '#00e5cc', pct: data.stats.total > 0 ? Math.round((data.stats.confirmed / data.stats.total) * 100) : 0 },
          ].map((row, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#7aafc4' }}>{row.label}</span>
                <span style={{ color: row.color }}>{row.value} ({row.pct}%)</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.pct}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ background: row.color }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Traffic sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <h2 className="font-bold text-[#e8f4f8] mb-5">Traffic Sources</h2>
          {data.topReferers.length === 0 ? (
            <p className="text-sm" style={{ color: '#4d7a90' }}>No view data yet. Share your event to start tracking!</p>
          ) : (
            <div className="space-y-3">
              {data.topReferers.map((ref, i) => {
                const maxC = data.topReferers[0].count;
                const pct = Math.round((ref.count / maxC) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="truncate max-w-[200px]" style={{ color: '#7aafc4' }}>
                        {ref.source.length > 30 ? ref.source.slice(0, 30) + '…' : ref.source}
                      </span>
                      <span style={{ color: '#9c6bff' }}>{ref.count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: '#9c6bff' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <h2 className="font-bold text-[#e8f4f8] mb-5">Campaign Attribution</h2>
          {data.topCampaigns.length === 0 ? (
            <p className="text-sm" style={{ color: '#4d7a90' }}>No campaign-tagged traffic yet. Add UTM parameters to event links.</p>
          ) : (
            <div className="space-y-3">
              {data.topCampaigns.map((item, index) => {
                const maxCount = data.topCampaigns[0].count;
                const pct = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={`${item.campaign}-${index}`}>
                    <div className="flex justify-between text-xs mb-1 gap-2">
                      <span className="truncate" style={{ color: '#7aafc4' }}>{item.campaign}</span>
                      <span style={{ color: '#f97316' }}>{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#f97316' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <h2 className="font-bold text-[#e8f4f8] mb-5">Top Landing Paths</h2>
          {data.topPaths.length === 0 ? (
            <p className="text-sm" style={{ color: '#4d7a90' }}>No landing path data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topPaths.map((item, index) => (
                <div key={`${item.path}-${index}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="truncate text-sm" style={{ color: '#b9d5df' }}>{item.path}</span>
                  <span className="text-xs font-bold" style={{ color: '#38bdf8' }}>{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Export row */}
      <div className="flex justify-end">
        <button
          onClick={() => exportToCSV(data)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'rgba(0,229,204,0.1)', border: '1px solid rgba(0,229,204,0.25)', color: '#00e5cc' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>
    </div>
  );
}
