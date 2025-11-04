import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Privacy Policy - LinkPeek"
        description="Learn how LinkPeek collects, uses, and protects your personal information. Read our comprehensive privacy policy for transparency on data handling."
        canonicalUrl="https://yourapp.lovable.app/privacy"
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
            <h1>Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: November 4, 2025</p>

            <section>
              <h2>1. Introduction</h2>
              <p>
                LinkPeek ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
              <p>
                Please read this Privacy Policy carefully. By using LinkPeek, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2>2. Information We Collect</h2>
              
              <h3>2.1 Information You Provide</h3>
              <ul>
                <li><strong>Account Information:</strong> Email address, name, password, and profile details</li>
                <li><strong>Payment Information:</strong> Billing details processed through secure third-party payment processors</li>
                <li><strong>Links and Content:</strong> URLs you shorten, custom aliases, and associated metadata</li>
                <li><strong>Profile Customization:</strong> Bio, social links, profile images, and branding preferences</li>
              </ul>

              <h3>2.2 Automatically Collected Information</h3>
              <ul>
                <li><strong>Analytics Data:</strong> Click data, referral sources, geographic location (country/city level), device types, browsers, and timestamps</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, session duration, and interaction patterns</li>
                <li><strong>Technical Data:</strong> IP addresses, browser type and version, operating system, and device information</li>
                <li><strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies to track activity and store information</li>
              </ul>

              <h3>2.3 Third-Party Information</h3>
              <p>
                When you use social login features (e.g., Google sign-in), we receive basic profile information from those services in accordance with their privacy policies.
              </p>
            </section>

            <section>
              <h2>3. How We Use Your Information</h2>
              <p>We use collected information for the following purposes:</p>
              <ul>
                <li><strong>Service Provision:</strong> To create and manage your account, process transactions, and provide core features</li>
                <li><strong>Analytics and Insights:</strong> To provide you with detailed analytics about your shortened links</li>
                <li><strong>Communication:</strong> To send service updates, security alerts, onboarding emails, and weekly reports</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve our Service</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
                <li><strong>Marketing:</strong> To send promotional communications (with your consent, where required)</li>
              </ul>
            </section>

            <section>
              <h2>4. How We Share Your Information</h2>
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              
              <h3>4.1 With Your Consent</h3>
              <p>We share information when you explicitly authorize us to do so.</p>

              <h3>4.2 Service Providers</h3>
              <p>We share information with third-party service providers who perform services on our behalf:</p>
              <ul>
                <li>Cloud hosting and infrastructure providers</li>
                <li>Payment processors (Stripe)</li>
                <li>Email service providers</li>
                <li>Analytics services</li>
              </ul>

              <h3>4.3 Public Information</h3>
              <p>
                Information you choose to make public through your public profile page (username, bio, social links, public links) is accessible to anyone who visits your profile URL.
              </p>

              <h3>4.4 Legal Requirements</h3>
              <p>We may disclose information if required by law or in response to valid legal requests.</p>

              <h3>4.5 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </p>
            </section>

            <section>
              <h2>5. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information within 90 days, except where we are required to retain it for legal purposes.
              </p>
              <p>
                Analytics data may be retained in aggregate, anonymized form for historical analysis.
              </p>
            </section>

            <section>
              <h2>6. Your Rights and Choices</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for processing where we rely on consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@linkpeek.com.
              </p>
            </section>

            <section>
              <h2>7. Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar tracking technologies to:</p>
              <ul>
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze how you use our Service</li>
                <li>Track link clicks and engagement</li>
              </ul>
              <p>
                You can control cookies through your browser settings, but disabling cookies may limit functionality of the Service.
              </p>
            </section>

            <section>
              <h2>8. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure data centers and infrastructure</li>
              </ul>
              <p>
                However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2>9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2>10. Children's Privacy</h2>
              <p>
                Our Service is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete that information.
              </p>
            </section>

            <section>
              <h2>11. Third-Party Links</h2>
              <p>
                Our Service contains links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2>12. California Privacy Rights (CCPA)</h2>
              <p>
                If you are a California resident, you have additional rights under the California Consumer Privacy Act:
              </p>
              <ul>
                <li>Right to know what personal information is collected</li>
                <li>Right to know whether personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to deletion of personal information</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>
              <p>Note: We do not sell personal information.</p>
            </section>

            <section>
              <h2>13. European Privacy Rights (GDPR)</h2>
              <p>
                If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict processing, data portability, and to object to processing.
              </p>
              <p>
                We process your personal information based on the following legal grounds:
              </p>
              <ul>
                <li>Performance of a contract with you</li>
                <li>Legitimate interests (improving our Service, security)</li>
                <li>Your consent (marketing communications)</li>
                <li>Legal obligations</li>
              </ul>
            </section>

            <section>
              <h2>14. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p>
                We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2>15. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p>
                Email: privacy@linkpeek.com<br />
                Address: [Your Company Address]
              </p>
            </section>
          </article>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
