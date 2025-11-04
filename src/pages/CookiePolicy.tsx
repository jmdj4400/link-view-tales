import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Cookie Policy - LinkPeek"
        description="Learn about how LinkPeek uses cookies and similar technologies to provide and improve our services. Understand your cookie preferences and choices."
        canonicalUrl="https://yourapp.lovable.app/cookies"
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
            <h1>Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: November 4, 2025</p>

            <section>
              <h2>1. Introduction</h2>
              <p>
                This Cookie Policy explains how LinkPeek ("we," "us," or "our") uses cookies and similar technologies when you visit our website and use our services. This policy should be read together with our Privacy Policy.
              </p>
              <p>
                By using LinkPeek, you agree to our use of cookies in accordance with this Cookie Policy. If you do not agree with our use of cookies, you can disable them through your browser settings, though this may affect your ability to use certain features of our Service.
              </p>
            </section>

            <section>
              <h2>2. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p>
                Cookies can be "persistent" or "session" cookies:
              </p>
              <ul>
                <li><strong>Persistent cookies:</strong> Remain on your device for a set period or until you delete them</li>
                <li><strong>Session cookies:</strong> Expire when you close your browser</li>
              </ul>
            </section>

            <section>
              <h2>3. Types of Cookies We Use</h2>
              
              <h3>3.1 Strictly Necessary Cookies</h3>
              <p>
                These cookies are essential for the operation of our Service and cannot be disabled. They enable core functionality such as:
              </p>
              <ul>
                <li><strong>Authentication:</strong> Keeping you logged in as you navigate through different pages</li>
                <li><strong>Security:</strong> Protecting your account and detecting malicious activity</li>
                <li><strong>Session management:</strong> Maintaining your preferences during your session</li>
              </ul>
              <p><em>Legal basis:</em> These cookies are necessary for the performance of our contract with you.</p>

              <h3>3.2 Performance and Analytics Cookies</h3>
              <p>
                These cookies help us understand how visitors interact with our Service by collecting anonymous information. We use this data to:
              </p>
              <ul>
                <li>Analyze website traffic and usage patterns</li>
                <li>Identify popular features and content</li>
                <li>Detect and troubleshoot technical issues</li>
                <li>Improve user experience and Service performance</li>
              </ul>
              <p>
                <em>Note:</em> LinkPeek uses privacy-first analytics. We do not use third-party tracking cookies or share your data with advertising networks.
              </p>
              <p><em>Legal basis:</em> Your consent, which can be withdrawn at any time.</p>

              <h3>3.3 Functionality Cookies</h3>
              <p>
                These cookies allow our Service to remember choices you make (such as theme preferences or language settings) to provide a more personalized experience.
              </p>
              <ul>
                <li>Theme preference (light/dark mode)</li>
                <li>Dashboard view preferences</li>
                <li>Filter and sort settings</li>
              </ul>
              <p><em>Legal basis:</em> Your consent or our legitimate interest in improving user experience.</p>
            </section>

            <section>
              <h2>4. Third-Party Cookies</h2>
              <p>
                In addition to our own cookies, we may use third-party services that set their own cookies. These include:
              </p>
              
              <h3>4.1 Payment Processing</h3>
              <p>
                When you make a payment, our payment processor (Stripe) may set cookies to facilitate secure transactions. These cookies are governed by Stripe's privacy policy.
              </p>

              <h3>4.2 Authentication Services</h3>
              <p>
                If you sign in using Google or other third-party authentication providers, these services may set their own cookies as described in their respective privacy policies.
              </p>

              <h3>4.3 Content Delivery</h3>
              <p>
                We use content delivery networks (CDNs) to serve static assets efficiently. These providers may set technical cookies to optimize delivery.
              </p>

              <p>
                <strong>Important:</strong> LinkPeek does not use advertising cookies or share your data with advertising networks.
              </p>
            </section>

            <section>
              <h2>5. Cookies Used for Link Analytics</h2>
              <p>
                When visitors click on links you create through LinkPeek, we collect minimal, privacy-first analytics data:
              </p>
              <ul>
                <li>Click timestamp</li>
                <li>Referrer URL (where the click came from)</li>
                <li>Device type and browser (generalized)</li>
                <li>Geographic location (country/city level only)</li>
              </ul>
              <p>
                <strong>Privacy-first approach:</strong> We do NOT use tracking cookies, pixels, or fingerprinting technologies. We do not track visitors across different websites or build user profiles.
              </p>
            </section>

            <section>
              <h2>6. How to Manage Cookies</h2>
              
              <h3>6.1 Browser Controls</h3>
              <p>
                Most web browsers allow you to control cookies through their settings preferences. You can:
              </p>
              <ul>
                <li>View what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>

              <p>To manage cookies in popular browsers:</p>
              <ul>
                <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>

              <h3>6.2 Impact of Disabling Cookies</h3>
              <p>
                If you choose to disable cookies, some features of our Service may not function properly:
              </p>
              <ul>
                <li>You may not be able to stay logged in</li>
                <li>Your preferences will not be saved</li>
                <li>Some interactive features may not work</li>
                <li>Analytics and reporting features may be limited</li>
              </ul>

              <h3>6.3 Do Not Track Signals</h3>
              <p>
                Some browsers include a "Do Not Track" (DNT) feature. We respect DNT signals and do not track users who have enabled this setting. However, our strictly necessary cookies will still be used to provide essential functionality.
              </p>
            </section>

            <section>
              <h2>7. Mobile Devices</h2>
              <p>
                On mobile devices, you can manage cookies and tracking through your device settings:
              </p>
              <ul>
                <li><strong>iOS:</strong> Settings → Safari → Privacy & Security</li>
                <li><strong>Android:</strong> Settings → Site settings → Cookies</li>
              </ul>
            </section>

            <section>
              <h2>8. Cookie Duration</h2>
              <p>Different cookies have different lifespans:</p>
              <ul>
                <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Authentication cookies:</strong> Typically valid for 7-30 days</li>
                <li><strong>Preference cookies:</strong> May persist for up to 1 year</li>
                <li><strong>Analytics cookies:</strong> Usually expire after 90 days</li>
              </ul>
            </section>

            <section>
              <h2>9. Updates to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. When we make material changes, we will notify you by:
              </p>
              <ul>
                <li>Updating the "Last updated" date at the top of this policy</li>
                <li>Sending you an email notification (if you have an account)</li>
                <li>Displaying a prominent notice on our Service</li>
              </ul>
              <p>
                We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
              </p>
            </section>

            <section>
              <h2>10. Your Rights and Consent</h2>
              <p>
                Under data protection laws (including GDPR and CCPA), you have rights regarding cookies and tracking:
              </p>
              <ul>
                <li><strong>Right to information:</strong> We provide clear information about our cookie usage</li>
                <li><strong>Right to consent:</strong> For non-essential cookies, we obtain your consent</li>
                <li><strong>Right to withdraw consent:</strong> You can change your cookie preferences at any time</li>
                <li><strong>Right to object:</strong> You can object to certain types of cookie processing</li>
              </ul>
            </section>

            <section>
              <h2>11. Links to Other Websites</h2>
              <p>
                Our Service contains links to other websites. This Cookie Policy only applies to LinkPeek. When you click on links created through our Service, you will be redirected to third-party websites that have their own cookie policies. We are not responsible for the cookie practices of external websites.
              </p>
            </section>

            <section>
              <h2>12. GDPR and International Compliance</h2>
              <p>
                For users in the European Economic Area (EEA), United Kingdom, and Switzerland:
              </p>
              <ul>
                <li>We comply with GDPR requirements for cookie consent</li>
                <li>Strictly necessary cookies are used based on legitimate interest</li>
                <li>Non-essential cookies require your explicit consent</li>
                <li>You can withdraw consent at any time through browser settings</li>
              </ul>
            </section>

            <section>
              <h2>13. Contact Us About Cookies</h2>
              <p>
                If you have questions or concerns about our use of cookies, please contact us at:
              </p>
              <p>
                Email: privacy@linkpeek.com<br />
                Subject line: Cookie Policy Inquiry
              </p>
              <p>
                For general privacy questions, please review our <button onClick={() => navigate("/privacy")} className="text-primary hover:underline">Privacy Policy</button>.
              </p>
            </section>

            <section>
              <h2>14. Additional Resources</h2>
              <p>
                For more information about cookies and how to manage them, visit:
              </p>
              <ul>
                <li><a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AboutCookies.org</a></li>
                <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AllAboutCookies.org</a></li>
                <li><a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">YourOnlineChoices.com</a> (EU)</li>
              </ul>
            </section>
          </article>
        </div>
      </div>
    </>
  );
};

export default CookiePolicy;
