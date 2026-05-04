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
        <h1 className="text-4xl font-black mb-3" style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}>
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

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">8. Right to Erasure (PIPEDA)</h2>
            <p>
              Under PIPEDA and applicable provincial laws, you have the right to request deletion of your personal information.
              We will process verified deletion requests within 30 days. Some information may be retained where required by law
              (for example, financial records, legal audit trails, or information needed to resolve disputes).
            </p>
            <p className="mt-2">
              To submit a deletion request, visit your{' '}
              <a href="/dashboard/settings" className="text-[#00e5cc] hover:underline">account settings</a>
              {' '}and use the &quot;Request Data Deletion&quot; option, or contact us at{' '}
              <a href="mailto:privacy@gatewise.ca" className="text-[#00e5cc] hover:underline">privacy@gatewise.ca</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">9. Data Portability</h2>
            <p>
              You may request a copy of your personal data in a structured, machine-readable format by contacting
              {' '}<a href="mailto:privacy@gatewise.ca" className="text-[#00e5cc] hover:underline">privacy@gatewise.ca</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#00e5cc] mb-2">10. Contact Our Privacy Officer</h2>
            <p>
              For privacy concerns, questions, or to exercise your rights, contact our Privacy Officer at{' '}
              <a href="mailto:privacy@gatewise.ca" className="text-[#00e5cc] hover:underline">privacy@gatewise.ca</a>.
              We respond within 30 days of receiving a complaint as required under PIPEDA.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
