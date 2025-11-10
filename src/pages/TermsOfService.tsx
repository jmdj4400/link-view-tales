import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Terms of Service - LinkPeek"
        description="Read LinkPeek's Terms of Service to understand the rules and guidelines for using our URL shortening and link management platform."
        canonicalUrl="https://link-peek.org/terms"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <article className="prose prose-slate dark:prose-invert max-w-none">
            <h1>Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: November 4, 2025</p>

            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using LinkPeek ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
              </p>
            </section>

            <section>
              <h2>2. Description of Service</h2>
              <p>
                LinkPeek provides URL shortening, link management, analytics, and related services. The Service allows users to create shortened URLs, manage links, track analytics, and customize their link profiles.
              </p>
            </section>

            <section>
              <h2>3. User Accounts</h2>
              <p>
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2>4. Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Shorten URLs that link to illegal, harmful, or malicious content</li>
                <li>Distribute spam, malware, viruses, or other harmful code</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
              </ul>
            </section>

            <section>
              <h2>5. Content and Links</h2>
              <p>
                You are solely responsible for all URLs you shorten and content you share through the Service. We reserve the right to remove or disable any links that violate these terms or are deemed inappropriate without prior notice.
              </p>
              <p>
                We do not pre-screen links but reserve the right to monitor and review content. We are not responsible for the content of destination URLs.
              </p>
            </section>

            <section>
              <h2>6. Subscription and Billing</h2>
              <p>
                Some features of the Service require a paid subscription. By subscribing, you agree to:
              </p>
              <ul>
                <li>Pay all fees associated with your subscription plan</li>
                <li>Provide accurate billing information</li>
                <li>Authorize automatic recurring charges</li>
                <li>Understand that refunds are subject to our refund policy</li>
              </ul>
              <p>
                We reserve the right to modify pricing with 30 days notice to active subscribers.
              </p>
            </section>

            <section>
              <h2>7. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by LinkPeek and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You retain all rights to content you create using the Service, but grant us a license to use, display, and distribute your content as necessary to provide the Service.
              </p>
            </section>

            <section>
              <h2>8. Analytics and Data</h2>
              <p>
                We collect and analyze data about how links created through our Service are used. This analytics data is provided to you as part of the Service and may be used by us in aggregate form to improve our Service.
              </p>
            </section>

            <section>
              <h2>9. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including if you breach these Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive.
              </p>
            </section>

            <section>
              <h2>10. Disclaimer of Warranties</h2>
              <p>
                The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2>11. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, LinkPeek shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
              </p>
            </section>

            <section>
              <h2>12. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless LinkPeek and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2>13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date.
              </p>
              <p>
                Your continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2>14. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which LinkPeek operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2>15. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                Email: legal@linkpeek.com<br />
                Address: [Your Company Address]
              </p>
            </section>
          </article>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
