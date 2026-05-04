'use client';

import { motion } from 'framer-motion';

interface SparklineProps {
  data: number[];
  label: string;
  total: number;
  color?: string;
}

export function RSVPSparkline({ data, label, total, color = '#00e5cc' }: SparklineProps) {
  const max = Math.max(...data, 1);
  const width = 120;
  const height = 40;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ` + points + ` ${width},${height}`;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{ background: 'rgba(12,26,31,0.6)', border: '1px solid rgba(0,229,204,0.08)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-[#4d7a90] uppercase tracking-wider">{label}</span>
        <motion.span
          key={total}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-black"
          style={{ color, fontFamily: 'var(--font-display)' }}
        >
          {total}
        </motion.span>
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#spark-fill)" />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Last dot */}
        {data.length > 0 && (
          <circle
            cx={(data.length - 1) / (data.length - 1) * width}
            cy={height - (data[data.length - 1]! / max) * (height - 4) - 2}
            r="3"
            fill={color}
          />
        )}
      </svg>
      <p className="text-[10px] text-[#2d5268]">Last 7 days</p>
    </div>
  );
}
