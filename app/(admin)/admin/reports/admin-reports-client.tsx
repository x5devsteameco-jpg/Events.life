'use client';

import { useState } from 'react';

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  reporterId: string | null;
  createdAt: Date;
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  RESOLVED:  { bg: 'rgba(0,229,204,0.08)',   color: '#00e5cc' },
  DISMISSED: { bg: 'rgba(77,122,144,0.1)',    color: '#4d7a90' },
};

export default function AdminReportsClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (reportId: string, status: string) => {
    setLoading(reportId + status);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status } : r));
      showToast(`Report marked as ${status.toLowerCase()}`);
    } catch (e: unknown) {
      showToast((e as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const pending = reports.filter((r) => r.status === 'PENDING');
  const resolved = reports.filter((r) => r.status !== 'PENDING');

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl" style={{ background: 'rgba(0,229,204,0.15)', border: '1px solid rgba(0,229,204,0.3)', color: '#00e5cc' }}>
          {toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: reports.length, color: '#7aafc4' },
          { label: 'Pending', value: pending.length, color: '#f59e0b' },
          { label: 'Resolved', value: resolved.length, color: '#00e5cc' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(12,26,31,0.6)', border: `1px solid ${stat.color}20` }}>
            <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-[#4d7a90] mt-1 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(12,26,31,0.4)', border: '1px dashed rgba(0,229,204,0.15)' }}>
          <div className="mb-3" style={{ color: '#00e5cc' }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
          <h3 className="text-lg font-bold text-[#e8f4f8]">No reports yet</h3>
          <p className="text-sm text-[#4d7a90] mt-1">The platform is clean.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const style = STATUS_STYLE[report.status] ?? STATUS_STYLE.PENDING;
            return (
              <div
                key={report.id}
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(12,26,31,0.6)',
                  border: `1px solid ${report.status === 'PENDING' ? 'rgba(245,158,11,0.2)' : 'rgba(0,229,204,0.08)'}`,
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: style.bg, color: style.color }}>
                        {report.status}
                      </span>
                      <span className="text-xs text-[#4d7a90]">{report.targetType} · {report.targetId.slice(0, 12)}…</span>
                    </div>
                    <p className="text-sm font-semibold text-[#e8f4f8]">{report.reason}</p>
                    {report.details && (
                      <p className="text-xs text-[#4d7a90] mt-1 line-clamp-2">{report.details}</p>
                    )}
                    <p className="text-xs text-[#2d5268] mt-2">
                      Reporter: {report.reporterId?.slice(0, 12) ?? 'Anonymous'} ·{' '}
                      {new Date(report.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Action buttons — only for pending */}
                  {report.status === 'PENDING' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateStatus(report.id, 'RESOLVED')}
                        disabled={loading === report.id + 'RESOLVED'}
                        className="text-xs font-bold px-3 py-2 rounded-lg transition-all disabled:opacity-50 min-h-[36px]"
                        style={{ background: 'rgba(0,229,204,0.1)', color: '#00e5cc', border: '1px solid rgba(0,229,204,0.25)' }}
                      >
                        {loading === report.id + 'RESOLVED' ? '...' : 'Resolve'}
                      </button>
                      <button
                        onClick={() => updateStatus(report.id, 'DISMISSED')}
                        disabled={loading === report.id + 'DISMISSED'}
                        className="text-xs font-bold px-3 py-2 rounded-lg transition-all disabled:opacity-50 min-h-[36px]"
                        style={{ background: 'rgba(77,122,144,0.08)', color: '#4d7a90', border: '1px solid rgba(77,122,144,0.2)' }}
                      >
                        {loading === report.id + 'DISMISSED' ? '...' : 'Dismiss'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
