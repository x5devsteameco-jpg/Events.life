import Link from 'next/link';
import { BrandLogo } from '@/components/brand/logo';

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
      <div className="fixed pointer-events-none" style={{ top: '60%', left: '30%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,60,172,0.06) 0%, transparent 70%)', filter: 'blur(30px)' }} aria-hidden="true" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center group">
            <BrandLogo
              size="lg"
              className="group-hover:opacity-95 transition-opacity"
              textClassName="text-2xl tracking-[0.06em]"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(8,18,24,0.85)', border: '1px solid rgba(0,229,204,0.15)', backdropFilter: 'blur(24px)', boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,204,0.05), inset 0 1px 0 rgba(0,229,204,0.08)' }}>
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#2d5268] mt-6">
          Built in Canada &nbsp;·&nbsp; © {new Date().getFullYear()} Gatewise Events
        </p>
      </div>
    </div>
  );
}
