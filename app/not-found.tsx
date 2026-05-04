import Link from 'next/link';
import { BrandLogo } from '@/components/brand/logo';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#020408' }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5" style={{ background: '#00e5cc', filter: 'blur(100px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5" style={{ background: '#ff3cac', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 max-w-lg">
        <Link href="/" className="inline-block mb-10">
          <BrandLogo size="sm" />
        </Link>

        {/* Glitchy 404 */}
        <div className="relative mb-6">
          <p
            className="text-[120px] sm:text-[160px] font-black leading-none select-none"
            style={{
              fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)",
              background: 'linear-gradient(135deg, #00e5cc 0%, #009984 50%, #ff3cac 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 0.9,
            }}
            aria-hidden="true"
          >
            404
          </p>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-black text-[#e8f4f8] mb-4"
          style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}
        >
          Page Not Found
        </h1>
        <p className="text-[#4d7a90] mb-10 leading-relaxed">
          The event or page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[#020408]"
            style={{ background: 'linear-gradient(135deg, #00c4a8, #00e5cc)' }}
          >
            ← Back to Home
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[#00e5cc] transition-all"
            style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)' }}
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
