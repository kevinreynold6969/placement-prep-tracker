import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Lock, ShieldCheck, Database, KeyRound, Cookie } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen poster-grid bg-paper text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="space-y-4 border-b border-line pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-punch-500/10 border border-punch-500/20 text-punk-500 text-xs font-mono">
            <Lock className="w-3.5 h-3.5" />
            Data Protection & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Privacy Policy
          </h1>
          <p className="text-muted text-sm">
            Last Updated: November 17, 2026 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ Honest, transparent disclosure of data handling practices
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-10 text-muted text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">01.</span> What Information Is Collected
            </h2>
            <p>
              Placement Preparation Tracker collects only the minimal information strictly required to provide account authentication and problem progress metrics:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted">
              <li>
                <strong className="text-ink">Account Credentials:</strong> Full name, email address (normalised to lowercase), and a salted cryptographic password hash. We never store or log your plaintext password.
              </li>
              <li>
                <strong className="text-ink">Preparation Records:</strong> Problem titles, problem URLs, DSA topics, platforms, difficulties, solution approaches, complexity annotations, personal notes, and revision flags.
              </li>
              <li>
                <strong className="text-ink">Technical Request Logs:</strong> Standard web server IP addresses and request timestamps recorded transiently by rate limiters to prevent brute-force attacks and abuse.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">02.</span> Why Information Is Collected
            </h2>
            <p>
              Your data is collected strictly to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li>Authenticate your identity when you access the platform.</li>
              <li>Isolate your personal problem records from other candidates.</li>
              <li>Calculate your genuine preparation analytics and revision backlogs.</li>
              <li>Prevent unauthorized scraping, spam, or denial-of-service attempts.</li>
            </ul>
            <p className="text-muted text-xs italic">
              Your preparation data is never sold, rented, monetised, or shared with third-party advertisers or recruitment agencies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">03.</span> How Passwords Are Protected
            </h2>
            <div className="p-4 rounded-xl bg-panel border border-line space-y-3">
              <div className="flex items-center gap-2 text-punk-500 font-mono text-xs font-semibold">
                <KeyRound className="w-4 h-4" />
                Adaptive One-Way Hashing with Salt
              </div>
              <p className="text-xs text-muted">
                Passwords are hashed using <strong>bcryptjs</strong> with an adaptive cost factor of <strong>12</strong> (4,096 computation rounds).
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted text-xs">
                <li>Every password receives a unique, cryptographically random salt prior to hashing, rendering rainbow-table attacks useless.</li>
                <li>The Mongoose user schema sets <code className="text-punk-500">select: false</code> on the password field, ensuring the hash is never returned in ordinary database queries or API responses.</li>
                <li>Bcrypt is a one-way function: it is mathematically impossible to reverse or decrypt stored hashes into plaintext passwords.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">04.</span> Cookies and Session Handling
            </h2>
            <div className="p-4 rounded-xl bg-panel border border-line space-y-3">
              <div className="flex items-center gap-2 text-punk-500 font-mono text-xs font-semibold">
                <Cookie className="w-4 h-4" />
                Single HttpOnly Authentication Cookie
              </div>
              <p className="text-xs text-muted">
                This platform uses exactly <strong>one session cookie</strong> named <code className="text-punk-500">token</code>.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted text-xs">
                <li><strong className="text-ink">HttpOnly:</strong> Browser JavaScript cannot read or access the token, neutralizing Cross-Site Scripting (XSS) token theft.</li>
                <li><strong className="text-ink">SameSite=Strict:</strong> The browser refuses to attach the cookie on cross-site requests, providing built-in protection against Cross-Site Request Forgery (CSRF).</li>
                <li><strong className="text-ink">No Analytics/Ad Cookies:</strong> We do not load Google Analytics, Facebook Pixel, tracking beacons, or third-party advertising cookies.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">05.</span> How User Records Are Stored & Isolated
            </h2>
            <p>
              All user records are stored in a cloud-hosted <strong>MongoDB Atlas</strong> cluster.
            </p>
            <p>
              Every problem record stores a foreign reference <code className="text-punk-500">userId</code> referencing the owner's account. Our backend architecture enforces ownership filtering on every database query (<code className="text-punk-500">&#123; _id: problemId, userId: req.user.id &#125;</code>). It is impossible for another candidate to read or modify your notes even if they know your problem ID.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">06.</span> Third-Party Services
            </h2>
            <p>
              The application uses only the following external infrastructure providers:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li><strong className="text-ink">MongoDB Atlas:</strong> Managed database hosting provider storing encrypted document data at rest.</li>
              <li><strong className="text-ink">Google Fonts:</strong> Web typography loaded for clean cross-platform font rendering.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">07.</span> Honest Security Limitations
            </h2>
            <p>
              In accordance with our engineering honesty policy, we transparently document the following limitations of this current release:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li><strong className="text-ink">No Email Verification:</strong> The registration endpoint does not verify email ownership via confirmation emails.</li>
              <li><strong className="text-ink">Stateless JWT Revocation:</strong> In stateless JWT systems without Redis blacklists, a valid token remains valid until its 7-day expiration time. Logging out clears the client cookie immediately.</li>
              <li><strong className="text-ink">No Two-Factor Authentication (2FA):</strong> Multi-factor authentication is not yet implemented.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">08.</span> Data Retention & Account Deletion
            </h2>
            <p>
              Your problem records and account profile persist as long as your account remains active. If you wish to delete your entire account and all associated DSA logs, you can contact the developer to trigger an automated database purge.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-punk-500 font-mono text-xs">09.</span> Contact Information
            </h2>
            <div className="p-4 rounded-lg bg-panel border border-line text-muted font-mono text-xs">
              Project Developer: [Candidate / Developer Name Placeholder]<br />
              Privacy & Data Officer: [Developer Contact / Portfolio Placeholder]<br />
              Location: [Development / University / Project Context Placeholder]
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-line flex items-center justify-between">
          <Link to="/" className="text-sm font-medium text-muted hover:text-ink transition-colors">
            ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Back to Homepage
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-punch-600 text-button font-semibold text-sm hover:bg-punch-500 transition-colors"
          >
            Review & Create Account
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
