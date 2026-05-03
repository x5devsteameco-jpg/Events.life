import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <div className="flex h-screen bg-[#020408] overflow-hidden">
      <Sidebar user={{ name: session.user.name ?? null, email: session.user.email ?? '', image: session.user.image ?? null }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 flex items-center justify-between px-6 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,229,204,0.08)', background: 'rgba(6,13,16,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-sm font-bold gradient-text-static" style={{ fontFamily: 'var(--font-display)' }}>
              Gatewise Events
            </span>
          </div>

          {/* User menu */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-[#4d7a90] hidden sm:block">
              {session.user.email}
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#020408]"
              style={{ background: 'linear-gradient(135deg, #00e5cc, #7fff00)' }}
            >
              {(session.user.name?.[0] ?? session.user.email?.[0] ?? 'U').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
