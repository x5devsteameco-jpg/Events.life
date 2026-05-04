import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const user = { name: session.user.name ?? null, email: session.user.email ?? '', image: session.user.image ?? null };
    const role: string | undefined = session.user.role;

  return (
    <div className="flex h-screen bg-[#020408] overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:flex">
          <Sidebar user={user} isAdmin={role === 'ADMIN'} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top nav */}
          <MobileNav user={user} isAdmin={role === 'ADMIN'} />

        {/* Desktop top bar */}
        <header
          className="hidden lg:flex h-11 items-center justify-end px-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,229,204,0.05)', background: 'rgba(6,13,16,0.6)', backdropFilter: 'blur(12px)' }}
        >
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-[#4d7a90] hidden sm:block">{session.user.email}</span>
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#020408]" style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}>
                {(session.user.name?.[0] ?? session.user.email?.[0] ?? 'U').toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Main content — responsive padding */}
        <main
          id="main-content"
          role="main"
          className="flex-1 overflow-y-auto"
          style={{
            padding: 'clamp(1rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem) 2rem',
            backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(0,229,204,0.03) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(0,180,150,0.02) 0%, transparent 50%)',
            paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
