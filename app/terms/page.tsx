import type { Metadata } from 'next';
import Link from 'next/link';
import { POLICY_VERSION } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Gatewise Events terms of service and host responsibility terms.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#020408] text-[#e8f4f8] px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Gatewise Events Terms of Service
        </h1>
        <p className="text-sm text-[#4d7a90] mb-8">Policy version: {POLICY_VERSION}</p>

        <div className="space-y-6 text-sm leading-relaxed text-[#7aafc4]">
          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">1. Platform Role</h2>
            <p>
              Gatewise Events is an industry-neutral software platform that enables event hosts to create, publish, and manage events.
              We are not an event organizer, promoter, venue operator, liquor authority, cannabis retailer, or legal representative for hosts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">2. Host Responsibility</h2>
            <p>
              Hosts are solely responsible for event legality, permits, age restrictions, attendee safety, venue compliance,
              product handling, and all representations made to attendees. Hosts must ensure their events comply with applicable
              federal, provincial, territorial, and municipal laws in Canada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">3. Age-Gated and Regulated Events</h2>
            <p>
              The platform supports age-gated events and optional certification checks (for example, CannSell, Smart Serve,
              security licensing, and equivalent credentials). Using these features does not replace legal obligations,
              permit requirements, or compliance reviews required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">4. Prohibited Use</h2>
            <p>
              Hosts may not use Gatewise Events for illegal activity, fraud, unsafe operations, hate content, harassment,
              trafficking, unauthorized sales, or any activity that violates law or third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">5. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Gatewise Events is not liable for host-created events,
              event outcomes, host conduct, attendee conduct, injuries, losses, enforcement actions, or regulatory penalties
              connected to events created on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">6. Account Enforcement</h2>
            <p>
              We may suspend or remove content or accounts that violate these terms or create legal, safety, or reputational risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">7. Legal Guidance</h2>
            <p>
              These terms are operational platform terms, not legal advice. Hosts should obtain qualified legal advice for specific
              event types and regulated activities.
            </p>
          </section>
        </div>

        <p className="text-xs text-[#2d5268] mt-10">
          Questions about these terms: <Link href="mailto:legal@gatewiseevents.com" className="text-[#00e5cc]">legal@gatewiseevents.com</Link>
        </p>
      </div>
    </main>
  );
}
