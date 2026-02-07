import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function TermsPage() {
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
          <h1>Terms of Service</h1>
          <p className="lead">
            Last updated: February 7, 2026
          </p>

          <p>
            These Terms of Service ("Terms") govern your use of the OfferReady web application
            ("Service") operated by OfferReady ("we", "us", or "our"). By accessing or using the
            Service, you agree to be bound by these Terms.
          </p>

          <h2>1. Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information.
            You are responsible for safeguarding the password you use to access the Service and for
            any activities or actions under your account. You agree not to share your account
            credentials with any third party.
          </p>

          <h2>2. Use of the Service</h2>
          <p>
            OfferReady provides tools for managing your investment banking recruiting process,
            including a networking CRM, flashcard study system, mock interview practice, and
            calendar integration. You agree to use the Service only for its intended purpose and in
            compliance with all applicable laws.
          </p>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or its infrastructure</li>
            <li>Upload malicious code or content</li>
            <li>Scrape, crawl, or use automated means to access the Service without permission</li>
          </ul>

          <h2>3. Subscriptions &amp; Payments</h2>
          <p>
            Some features of the Service require a paid subscription. By subscribing, you agree to
            pay the applicable fees as described at the time of purchase. Payments are processed
            securely through Stripe. We do not store your payment card details.
          </p>
          <p>
            Subscriptions automatically renew unless canceled before the end of the current billing
            period. You may cancel your subscription at any time through the Settings page or by
            contacting us.
          </p>

          <h2>4. Free Tier Limits</h2>
          <p>
            The free tier of OfferReady includes limited access to certain features (e.g., a limited
            number of mock interview sessions, flashcard reviews, and CRM contacts). Usage beyond
            these limits requires a paid subscription.
          </p>

          <h2>5. Google Account Integration</h2>
          <p>
            If you choose to sign in with Google or connect your Google Calendar, you authorize us
            to access the specific Google account data described in our{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            . You may revoke this access at any time through your Google Account settings.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by
            OfferReady and are protected by copyright, trademark, and other intellectual property
            laws. You retain ownership of any content you create within the Service (e.g., notes,
            contacts, interaction logs).
          </p>

          <h2>7. AI-Generated Content</h2>
          <p>
            OfferReady uses artificial intelligence to score mock interviews and provide feedback.
            AI-generated scores and feedback are provided for educational purposes only and should
            not be considered professional advice. We make no guarantees about the accuracy or
            completeness of AI-generated content.
          </p>

          <h2>8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided on an "as is" and "as available" basis without warranties of any
            kind, whether express or implied, including but not limited to implied warranties of
            merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, OfferReady shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or any loss of profits or
            revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill,
            or other intangible losses resulting from your use of the Service.
          </p>

          <h2>10. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for conduct
            that we believe violates these Terms or is harmful to other users, us, or third parties,
            or for any other reason at our sole discretion. Upon termination, your right to use the
            Service will immediately cease.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of material
            changes by posting the updated Terms on this page and updating the "Last updated" date.
            Your continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United
            States, without regard to its conflict of law provisions.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:support@offerready.ai">support@offerready.ai</a>.
          </p>
        </article>
      </div>
    </div>
  );
}
