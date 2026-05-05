'use client';

import { useState } from 'react';

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  company: string | null;
  createdAt: Date;
  _count: { hostedEvents: number; rsvps: number };
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#ff3cac',
  HOST: '#00e5cc',
  ATTENDEE: '#9c6bff',
};

export default function AdminUsersClient({ users, actorId }: { users: User[]; actorId: string }) {
  const [list, setList] = useState(users);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const changeRole = async (userId: string, newRole: string) => {
    if (userId === actorId && newRole !== 'ADMIN') {
      showToast('Cannot demote your own admin account.');
      return;
    }
    setLoading(userId + newRole);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setList((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`Role updated to ${newRole}`);
    } catch (e: unknown) {
      showToast((e as Error).message);
    } finally {
      setLoading(null);
    }
  };

  if (list.length === 0) {
    return (
      <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(12,26,31,0.4)', border: '1px dashed rgba(0,229,204,0.15)' }}>
        <p className="text-4xl mb-3">👥</p>
        <h3 className="text-lg font-bold text-[#e8f4f8]">No users found</h3>
        <p className="text-sm text-[#4d7a90] mt-1">Try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl" style={{ background: 'rgba(0,229,204,0.15)', border: '1px solid rgba(0,229,204,0.3)', color: '#00e5cc' }}>
          {toast}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,229,204,0.1)' }}>
        {/* Header row */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#4d7a90]" style={{ background: 'rgba(0,229,204,0.04)' }}>
          <span>User</span>
          <span>Role</span>
          <span>Events</span>
          <span>RSVPs</span>
          <span>Actions</span>
        </div>

        <div>
          {list.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center"
              style={{ background: 'rgba(12,26,31,0.5)', borderTop: '1px solid rgba(0,229,204,0.05)' }}
            >
              {/* User info */}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#e8f4f8] truncate">{user.name ?? '—'}</p>
                <p className="text-xs text-[#4d7a90] truncate">{user.email}</p>
                {user.company && <p className="text-xs text-[#2d5268] truncate">{user.company}</p>}
                <p className="text-[10px] text-[#1e3d4f] mt-0.5">
                  Joined {new Date(user.createdAt).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Role badge */}
              <div>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: `${ROLE_COLORS[user.role] ?? '#7aafc4'}15`,
                    color: ROLE_COLORS[user.role] ?? '#7aafc4',
                    border: `1px solid ${ROLE_COLORS[user.role] ?? '#7aafc4'}30`,
                  }}
                >
                  {user.role}
                </span>
              </div>

              {/* Counts */}
              <div className="text-sm text-[#7aafc4]">{user._count.hostedEvents}</div>
              <div className="text-sm text-[#7aafc4]">{user._count.rsvps}</div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {user.role !== 'HOST' && (
                  <button
                    onClick={() => changeRole(user.id, 'HOST')}
                    disabled={loading === user.id + 'HOST'}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 min-h-[32px]"
                    style={{ background: 'rgba(0,229,204,0.08)', color: '#00e5cc', border: '1px solid rgba(0,229,204,0.2)' }}
                  >
                    {loading === user.id + 'HOST' ? '…' : '→ Host'}
                  </button>
                )}
                {user.role !== 'ATTENDEE' && user.id !== actorId && (
                  <button
                    onClick={() => changeRole(user.id, 'ATTENDEE')}
                    disabled={loading === user.id + 'ATTENDEE'}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 min-h-[32px]"
                    style={{ background: 'rgba(157,216,234,0.06)', color: '#7aafc4', border: '1px solid rgba(157,216,234,0.15)' }}
                  >
                    {loading === user.id + 'ATTENDEE' ? '…' : '→ Attendee'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#2d5268] text-right">{list.length} user{list.length !== 1 ? 's' : ''} shown</p>
    </>
  );
}
