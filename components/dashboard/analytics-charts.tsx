'use client';

interface BarItem {
  label: string;
  value: number;
  color?: string;
  maxValue?: number;
}

interface Props {
  data: BarItem[];
  title?: string;
  height?: number;
}

export function AnalyticsBarChart({ data, title, height = 160 }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
      {title && (
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4d7a90] mb-4">{title}</p>
      )}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, i) => {
          const pct = (item.value / max) * 100;
          const color = item.color ?? '#00e5cc';
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="relative flex-1 w-full flex items-end">
                <div
                  className="w-full rounded-t-lg transition-all duration-700 ease-out group-hover:opacity-80"
                  style={{
                    height: `${pct}%`,
                    minHeight: item.value > 0 ? '4px' : '0',
                    background: `linear-gradient(to top, ${color}cc, ${color})`,
                  }}
                />
              </div>
              <span className="text-[10px] text-[#4d7a90] text-center leading-tight truncate w-full">{item.label}</span>
              <span className="text-xs font-bold" style={{ color }}>{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface FunnelItem {
  label: string;
  value: number;
  color: string;
}

export function ConversionFunnel({ data, title }: { data: FunnelItem[]; title?: string }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(12,26,31,0.7)', border: '1px solid rgba(0,229,204,0.1)' }}>
      {title && (
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4d7a90] mb-4">{title}</p>
      )}
      <div className="space-y-2.5">
        {data.map((item, i) => {
          const pct = (item.value / maxVal) * 100;
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-[#7aafc4]">{item.label}</span>
                <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: `linear-gradient(to right, ${item.color}88, ${item.color})` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
