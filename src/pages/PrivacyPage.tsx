import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to OfferReady
            </Link>
          </Button>
        </div>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="lead">
            Last updated: February 7, 2026
          </p>

          <p>
            OfferReady ("we", "us", or "our") operates the OfferReady web application. This page
            informs you of our policies regarding the collection, use, and disclosure of personal
            data when you use our service.
          </p>

          <h2>Information We Collect</h2>

          <h3>Account Information</h3>
          <p>
            When you create an account, we collect your <strong>email address</strong> and, if you
            sign in with Google, your <strong>Google profile information</strong> (name and email
            address). This information is used solely to authenticate you and personalize your
            experience.
          </p>

          <h3>Google Account Data</h3>
          <p>
            If you choose to sign in with Google, we request access to the following scopes:
          </p>
          <ul>
            <li>
              <strong>Google Profile</strong> — Your name and profile picture, used to identify your
              account within the app.
            </li>
            <li>
              <strong>Email Address</strong> — Used as your unique account identifier and for
              transactional communications (e.g., password resets).
            </li>
            <li>
              <strong>Google Calendar (if enabled)</strong> — Used to sync your networking calls and
              coffee chats with your calendar. We only read and write events you explicitly create
              through OfferReady. We do not access or modify any other calendar events.
            </li>
          </ul>

          <h3>User-Generated Content</h3>
          <p>
            We store data you voluntarily enter into the application, including but not limited to:
          </p>
          <ul>
            <li>Contact and networking pipeline information</li>
            <li>Interaction logs and notes</li>
            <li>Flashcard study progress</li>
            <li>Mock interview session recordings and scores</li>
            <li>Task and goal settings</li>
          </ul>

          <h2>How We Use Your Data</h2>
          <p>We use the collected data for the following purposes:</p>
          <ul>
            <li>To provide and maintain the OfferReady service</li>
            <li>To authenticate your identity and manage your account</li>
            <li>To track your recruiting preparation progress</li>
            <li>To sync events with your Google Calendar (only when you opt in)</li>
            <li>To send transactional emails (e.g., password reset links)</li>
          </ul>

          <h2>Data Storage &amp; Security</h2>
          <p>
            Your data is stored securely using <strong>Supabase</strong>, which provides
            enterprise-grade security including encryption at rest and in transit. Authentication
            tokens are managed by Supabase Auth and are never exposed to third parties.
          </p>

          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>
              <strong>Supabase</strong> — Database, authentication, and file storage
            </li>
            <li>
              <strong>Google OAuth</strong> — Sign-in authentication
            </li>
            <li>
              <strong>Stripe</strong> — Payment processing for subscriptions (we do not store your
              payment card details)
            </li>
            <li>
              <strong>OpenAI</strong> — AI-powered mock interview scoring (session data is sent for
              analysis but is not used to train models)
            </li>
          </ul>

          <h2>Data Sharing</h2>
          <p>
            We do <strong>not</strong> sell, trade, or rent your personal data to third parties. We
            only share data with the third-party services listed above to the extent necessary to
            provide the OfferReady service.
          </p>

          <h2>Data Retention &amp; Deletion</h2>
          <p>
            Your data is retained for as long as your account is active. You may request deletion of
            your account and all associated data at any time by contacting us at{' '}
            <a href="mailto:support@offerready.ai">support@offerready.ai</a>.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Revoke Google account access at any time through your Google Account settings</li>
          </ul>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes
            by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at{' '}
            <a href="mailto:support@offerready.ai">support@offerready.ai</a>.
          </p>
        </article>
      </div>
    </div>
  );
}
