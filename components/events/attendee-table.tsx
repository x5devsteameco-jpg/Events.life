'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { RSVP } from '@/lib/types';

const STATUS_OPTIONS = ['ALL', 'CONFIRMED', 'WAITLISTED', 'CANCELLED'];

function exportCSV(rsvps: RSVP[], eventTitle: string) {
  const headers = ['Name', 'Email', 'Store', 'Store Address', 'Brand', 'Position', 'Status', 'Date'];
  const rows = rsvps.map((r) => [
    r.guestName,
    r.guestEmail,
    r.storeName ?? '',
    r.storeAddress ?? '',
    r.brand ?? '',
    r.position ?? '',
    r.status,
    new Date(r.createdAt).toLocaleDateString('en-CA'),
  ]);
  const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${eventTitle.replace(/\s+/g, '_')}_attendees.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  rsvps: RSVP[];
  eventTitle: string;
}

export function AttendeeTable({ rsvps, eventTitle }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<keyof RSVP>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof RSVP) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rsvps
      .filter((r) => statusFilter === 'ALL' || r.status === statusFilter)
      .filter((r) => !q || [r.guestName, r.guestEmail, r.storeName, r.brand, r.position].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => {
        const va = String(a[sortField] ?? '');
        const vb = String(b[sortField] ?? '');
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [rsvps, search, statusFilter, sortField, sortDir]);

  const SortIcon = ({ field }: { field: keyof RSVP }) => {
    if (sortField !== field) return <span className="text-[#2d5268] ml-1">↕</span>;
    return <span className="text-[#00e5cc] ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const badgeVariantMap: Record<string, 'live' | 'pending' | 'cancelled'> = {
    CONFIRMED: 'live',
    WAITLISTED: 'pending',
    CANCELLED: 'cancelled',
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${statusFilter === s ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.1)] text-[#00e5cc]' : 'border-[rgba(0,229,204,0.08)] text-[#4d7a90] hover:border-[rgba(0,229,204,0.2)]'}`}
            >
              {s === 'ALL' ? `All (${rsvps.length})` : `${s} (${rsvps.filter((r) => r.status === s).length})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search attendees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60"
          />
          <button
            type="button"
            onClick={() => exportCSV(filtered, eventTitle)}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-[#00e5cc] border border-[rgba(0,229,204,0.2)] hover:bg-[rgba(0,229,204,0.08)] transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,229,204,0.08)' }}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ background: 'rgba(12,26,31,0.4)' }}>
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm text-[#4d7a90]">{search || statusFilter !== 'ALL' ? 'No matching attendees' : 'No RSVPs yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(12,26,31,0.8)', borderBottom: '1px solid rgba(0,229,204,0.08)' }}>
                  {[
                    { key: 'guestName', label: 'Name' },
                    { key: 'guestEmail', label: 'Email' },
                    { key: 'storeName', label: 'Store' },
                    { key: 'brand', label: 'Brand' },
                    { key: 'position', label: 'Position' },
                    { key: 'status', label: 'Status' },
                    { key: 'createdAt', label: 'RSVP Date' },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key as keyof RSVP)}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#4d7a90] uppercase tracking-wider cursor-pointer hover:text-[#e8f4f8] transition-colors select-none"
                    >
                      {label}<SortIcon field={key as keyof RSVP} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rsvp, i) => (
                  <motion.tr
                    key={rsvp.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b transition-colors hover:bg-[rgba(0,229,204,0.02)]"
                    style={{ borderColor: 'rgba(0,229,204,0.06)' }}
                  >
                    <td className="px-4 py-3 font-medium text-[#e8f4f8]">{rsvp.guestName}</td>
                    <td className="px-4 py-3 text-[#4d7a90]">{rsvp.guestEmail}</td>
                    <td className="px-4 py-3 text-[#6b9bb0]">{rsvp.storeName ?? '—'}</td>
                    <td className="px-4 py-3 text-[#6b9bb0]">{rsvp.brand ?? '—'}</td>
                    <td className="px-4 py-3 text-[#6b9bb0]">{rsvp.position ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={badgeVariantMap[rsvp.status] ?? 'default'}>{rsvp.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[#4d7a90] text-xs">
                      {new Date(rsvp.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[#2d5268]">Showing {filtered.length} of {rsvps.length} attendees</p>
    </div>
  );
}
