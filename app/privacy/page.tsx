import type { Metadata } from 'next';
import { POLICY_VERSION } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Gatewise Events privacy policy for hosts and attendees.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#020408] text-[#e8f4f8] px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Gatewise Events Privacy Policy
        </h1>
        <p className="text-sm text-[#4d7a90] mb-8">Policy version: {POLICY_VERSION}</p>

        <div className="space-y-6 text-sm leading-relaxed text-[#7aafc4]">
          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">1. Data We Collect</h2>
            <p>
              We collect account details (name, email, company, position), event data you create, RSVP responses,
              and compliance-related fields configured by hosts (for example, age confirmation and certification uploads).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">2. Why We Use Data</h2>
            <p>
              Data is used to operate the platform, secure accounts, support RSVP flows, send operational emails,
              and provide host analytics. We also store policy acceptance timestamps to maintain legal audit trails.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">3. Host-Controlled Data</h2>
            <p>
              Hosts control the data they collect from attendees through custom RSVP forms. Hosts are responsible for
              ensuring the collection and use of attendee information complies with applicable privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">4. Canadian Compliance</h2>
            <p>
              We design our practices to support Canadian privacy expectations, including principles associated with PIPEDA.
              Depending on your province and event type, additional obligations may apply.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">5. Data Sharing</h2>
            <p>
              We do not sell personal information. Data may be shared with processors that help run the platform
              (hosting, email, storage) under contractual confidentiality obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">6. Retention and Security</h2>
            <p>
              We retain information for as long as needed to provide services, satisfy legal obligations, and resolve disputes.
              We apply reasonable technical and organizational safeguards to protect data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">7. Access and Correction</h2>
            <p>
              You may request access to or correction of your personal information, subject to legal and operational limits.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
