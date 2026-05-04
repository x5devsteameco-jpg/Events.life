import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at 25% 20%, rgba(0,229,204,0.09) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(0,180,150,0.07) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(0,229,204,0.03) 0%, transparent 70%), #020408' }}>
      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="auth-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00e5cc" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
      </div>

      {/* Decorative floating orbs */}
      <div className="fixed pointer-events-none" style={{ top: '15%', left: '8%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,204,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} aria-hidden="true" />
      <div className="fixed pointer-events-none" style={{ bottom: '20%', right: '8%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,150,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} aria-hidden="true" />
      <div className="fixed pointer-events-none" style={{ top: '60%', left: '30%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(127,255,0,0.05) 0%, transparent 70%)', filter: 'blur(30px)' }} aria-hidden="true" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:shadow-[0_0_24px_rgba(0,229,204,0.5)]"
              style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#020408" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span
              className="text-2xl font-black gradient-text-static"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Gatewise Events
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(8,18,24,0.85)', border: '1px solid rgba(0,229,204,0.15)', backdropFilter: 'blur(24px)', boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,204,0.05), inset 0 1px 0 rgba(0,229,204,0.08)' }}>
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#2d5268] mt-6">
          Built in Canada 🍁 &nbsp;·&nbsp; © {new Date().getFullYear()} Gatewise Events
        </p>
      </div>
    </div>
  );
}
