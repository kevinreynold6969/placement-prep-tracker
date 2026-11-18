import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen poster-grid bg-paper text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="space-y-4 border-b border-line pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-punch-500/10 border border-punch-500/20 text-punk-500 text-xs font-mono">
            <FileText className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Terms & Conditions
          </h1>
          <p className="text-muted text-sm">
            Last Updated: November 17, 2026 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ Effective Immediately Upon Account Creation
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-10 text-muted text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">01.</span> Purpose of the Platform
            </h2>
            <p>
              Placement Preparation Tracker is an educational software platform engineered to help students, developers, and placement candidates record, categorise, and track their Data Structures & Algorithms (DSA) practice.
            </p>
            <div className="p-4 rounded-lg bg-panel border border-line text-muted text-xs">
              <strong className="text-ink">Placement Disclaimer:</strong> This application does not guarantee employment, internship placement, salary offers, or interview success at any specific organisation. It serves solely as a personal logging and analytics tool.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">02.</span> Account Responsibilities
            </h2>
            <p>
              To access tracking features, you must register an account with a valid email address and secure password. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li>Maintain the confidentiality of your account credentials.</li>
              <li>Provide accurate personal information during registration.</li>
              <li>Notify the system operator immediately if you suspect unauthorised access to your account.</li>
              <li>Take responsibility for all problem submissions, notes, and records stored under your account.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">03.</span> Acceptable Use Policy
            </h2>
            <p>
              You agree not to misuse the platform. Prohibited activities include, but are not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li>Attempting to bypass authentication, brute-force credentials, or probe backend API endpoints without authorisation.</li>
              <li>Attempting to read, modify, or delete another user's problem records by tampering with request payloads or IDs.</li>
              <li>Automated scraping, excessive concurrent request flooding, or introducing malicious code.</li>
              <li>Storing illegal, infringing, or abusive material within notes or problem metadata.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">04.</span> User-Generated Content
            </h2>
            <p>
              You retain ownership of any notes, algorithmic solution summaries, and complexity analyses you write into the tracker. You grant the platform a limited licence to store, process, and display this data solely for providing you with the tracking and analytics features.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">05.</span> Intellectual Property & Third-Party Platforms
            </h2>
            <p>
              Names such as "LeetCode", "Codeforces", "HackerRank", "CodeChef", and "GeeksForGeeks" are trademarks of their respective owners. Placement Preparation Tracker is an independent project and is not affiliated with, endorsed by, or sponsored by any of these platforms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">06.</span> Service Availability & Data Storage
            </h2>
            <p>
              This application is hosted on cloud services (including MongoDB Atlas free tier) for portfolio, evaluation, and educational demonstration purposes. While best engineering practices are followed to maintain data integrity:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li>The service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of uninterrupted uptime.</li>
              <li>Routine maintenance, database restarts, or platform migrations may occur without advance notice.</li>
              <li>You are encouraged to maintain local backups of critical personal preparation notes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">07.</span> Limitations of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, the author and operator of this software shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of, or inability to use, this application or loss of preparation records.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">08.</span> Account Suspension & Termination
            </h2>
            <p>
              The platform administrator reserves the right to suspend or terminate accounts that violate the Acceptable Use Policy, abuse API rate limits, or engage in suspicious activity. Users may also request full deletion of their account and associated problem logs at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">09.</span> Contact Information
            </h2>
            <p>
              For inquiries, terms clarification, or technical questions regarding this project:
            </p>
            <div className="p-4 rounded-lg bg-panel border border-line text-muted font-mono text-xs">
              Project Developer: [Candidate / Developer Name Placeholder]<br />
              Repository & Portfolio Inquiries: Available via project demonstration context.
            </div>
          </section>
        </div>

        {/* CTA Back to Register */}
        <div className="mt-12 pt-8 border-t border-line flex items-center justify-between">
          <Link to="/" className="text-sm font-medium text-muted hover:text-ink transition-colors">
            ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Back to Homepage
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-punch-600 text-button font-semibold text-sm hover:bg-punch-500 transition-colors"
          >
            Agree & Create Account
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
