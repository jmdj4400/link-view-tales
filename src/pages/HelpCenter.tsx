import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, BookOpen, BarChart3, Link as LinkIcon, Settings, CreditCard, MessageCircle } from "lucide-react";
import { useState } from "react";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      description: "Learn the basics of LinkPeek",
    },
    {
      id: "analytics",
      title: "Analytics & Tracking",
      icon: BarChart3,
      description: "Understand your link performance",
    },
    {
      id: "links",
      title: "Link Management",
      icon: LinkIcon,
      description: "Create and customize your links",
    },
    {
      id: "account",
      title: "Account & Settings",
      icon: Settings,
      description: "Manage your profile and preferences",
    },
    {
      id: "billing",
      title: "Billing & Plans",
      icon: CreditCard,
      description: "Subscription and payment help",
    },
  ];

  const faqs = {
    "getting-started": [
      {
        question: "How do I create my first link?",
        answer: "After signing up, go to your Dashboard and click 'Add Link' button. Enter your destination URL, customize the title and description, then click 'Create Link'. Your link will be added to your public profile immediately."
      },
      {
        question: "What is the 60-second setup challenge?",
        answer: "Complete your profile setup (name, bio, and first link) in under 60 seconds during onboarding to unlock a free 1-month Pro trial. A timer will show your progress. This is a one-time offer for new users."
      },
      {
        question: "How do I share my LinkPeek profile?",
        answer: "Your public profile URL is link-peek.org/yourhandle. You can share this link on your social media bios, email signatures, or anywhere you want to consolidate your links. Find it in your Dashboard or Profile Settings."
      },
      {
        question: "Can I customize my profile appearance?",
        answer: "Yes! Go to Profile Settings to customize your bio, profile picture, social links, and theme. Pro users can also remove LinkPeek branding and connect custom domains."
      },
    ],
    "analytics": [
      {
        question: "What analytics data does LinkPeek track?",
        answer: "We track click counts, page views, referral sources, geographic location (country/city), device types, browsers, and engagement over time. All data is privacy-first with no cookies or tracking pixels."
      },
      {
        question: "How accurate is the analytics tracking?",
        answer: "Very accurate. We filter bot traffic and provide real-time data. Our privacy-first approach means we don't use third-party trackers, giving you clean, reliable metrics about genuine human interactions."
      },
      {
        question: "Can I export my analytics data?",
        answer: "Yes! All plans include CSV export. Click the 'Export' button in your analytics dashboard to download your data for analysis in spreadsheet tools or your own analytics platform."
      },
      {
        question: "What is UTM tracking and how do I use it?",
        answer: "UTM parameters help you track campaign performance. In the link editor, use the UTM Builder to add source, medium, campaign, term, and content parameters. This helps you see which marketing channels drive the most traffic."
      },
      {
        question: "How often does analytics data update?",
        answer: "Analytics update in real-time. You'll see new clicks and views within seconds. Aggregate metrics (like daily/weekly summaries) are calculated hourly for optimal performance."
      },
    ],
    "links": [
      {
        question: "How many links can I create?",
        answer: "Free plan: 5 active links. Pro plan: Unlimited links. Business plan: Unlimited links with team collaboration. You can archive/delete links anytime to stay within your limit on the free plan."
      },
      {
        question: "Can I schedule links to activate/deactivate automatically?",
        answer: "Yes! Pro and Business users can set start and end dates for links. Perfect for limited-time promotions, seasonal campaigns, or event-specific links that should automatically expire."
      },
      {
        question: "What are click limits and how do they work?",
        answer: "Click limits allow you to automatically disable a link after a certain number of clicks. Great for limited promotions, beta access, or controlling resource access. Available on Pro and Business plans."
      },
      {
        question: "How do I generate QR codes for my links?",
        answer: "Open any link in your dashboard and click the QR code icon. You can download the QR code as PNG or SVG. QR codes are tracked the same as regular clicks, giving you offline-to-online analytics."
      },
      {
        question: "Can I edit a link after creating it?",
        answer: "Yes! You can edit the title, description, destination URL, and settings anytime. Click the edit icon next to any link in your dashboard. Analytics history is preserved when you edit links."
      },
    ],
    "account": [
      {
        question: "How do I change my profile handle?",
        answer: "Go to Profile Settings and click 'Edit Handle'. Enter your new handle and click 'Save'. Note: Your old profile URL will stop working, so update your shared links everywhere."
      },
      {
        question: "Can I connect a custom domain?",
        answer: "Yes! Pro and Business users can connect custom domains (e.g., links.yourdomain.com). Go to Settings → Domain and follow the DNS configuration instructions. Full setup guide is available in domain settings."
      },
      {
        question: "How do I enable/disable theme (dark mode)?",
        answer: "Click the theme toggle in the navigation bar to switch between light, dark, and system themes. Your preference is saved automatically and applied across all pages."
      },
      {
        question: "How do I delete my account?",
        answer: "Go to Account Settings → Danger Zone → Delete Account. This action is permanent and will delete all your links, analytics data, and profile information. Download your data first if needed."
      },
      {
        question: "Can I change my email address?",
        answer: "Yes. Go to Account Settings → Email and enter your new email address. You'll receive a verification email to confirm the change. Your login credentials will update automatically."
      },
    ],
    "billing": [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and debit cards through Stripe. We do not accept PayPal or cryptocurrency at this time."
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes! Cancel anytime from Billing settings. You'll retain Pro features until the end of your billing period, then automatically switch to the Free plan. No cancellation fees."
      },
      {
        question: "Do you offer refunds?",
        answer: "We offer a 14-day money-back guarantee for annual subscriptions. Monthly subscriptions are non-refundable but you can cancel anytime to prevent future charges. Contact support for refund requests."
      },
      {
        question: "What happens if my payment fails?",
        answer: "We'll retry the payment automatically and send you an email notification. If payment fails after multiple attempts, your account will be downgraded to Free plan. Update your payment method to restore Pro access."
      },
      {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes! Upgrade anytime to access more features. Downgrade at the end of your billing cycle. When downgrading from Pro to Free, links beyond the 5-link limit will be archived (not deleted)."
      },
      {
        question: "Do you offer discounts for annual billing?",
        answer: "Yes! Annual billing gives you 2 months free (equivalent to ~17% discount). You can switch to annual billing from your Billing settings at any time."
      },
    ],
  };

  const guides = [
    {
      title: "Complete your profile in 60 seconds",
      description: "Step-by-step guide to the setup challenge and unlocking your free Pro trial",
      category: "Getting Started",
      steps: [
        "Click 'Get Started' and create your account",
        "The timer starts! Enter your name and write a compelling bio (2-3 sentences)",
        "Add your first link with title and URL",
        "Complete before timer expires to unlock 1 month Pro free",
        "Continue adding more links and customizing your profile"
      ]
    },
    {
      title: "Understanding your analytics dashboard",
      description: "Learn how to interpret clicks, views, and engagement metrics",
      category: "Analytics",
      steps: [
        "Navigate to Dashboard and select a date range",
        "Total Clicks: Number of times your links were clicked",
        "Page Views: Times your profile page was visited",
        "Click-through Rate: Percentage of profile visitors who clicked links",
        "Geographic data shows where your audience is located",
        "Device/Browser data helps optimize for your audience",
        "Referral sources show which platforms drive traffic"
      ]
    },
    {
      title: "Creating effective link campaigns with UTM parameters",
      description: "Track marketing campaigns across different channels",
      category: "Analytics",
      steps: [
        "Open the link you want to track and click 'Edit'",
        "Click 'UTM Builder' to open the parameter editor",
        "Add Source (e.g., 'instagram', 'newsletter', 'twitter')",
        "Add Medium (e.g., 'social', 'email', 'paid')",
        "Add Campaign name (e.g., 'summer_sale', 'product_launch')",
        "Optionally add Term and Content for detailed tracking",
        "Save and share your link. View UTM data in Analytics → Sources"
      ]
    },
    {
      title: "Setting up your custom domain",
      description: "Connect your own domain for professional branding (Pro plan required)",
      category: "Advanced",
      steps: [
        "Upgrade to Pro or Business plan",
        "Go to Settings → Custom Domain",
        "Enter your desired subdomain (e.g., links.yourdomain.com)",
        "Add the provided DNS records to your domain registrar",
        "CNAME record: Point your subdomain to linkpeek.app",
        "Wait 24-48 hours for DNS propagation",
        "Verify connection in domain settings",
        "All new links will use your custom domain automatically"
      ]
    },
  ];

  const filteredFaqs = searchQuery
    ? Object.entries(faqs).reduce((acc, [category, questions]) => {
        const filtered = questions.filter(
          (q) =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) {
          acc[category] = filtered;
        }
        return acc;
      }, {} as typeof faqs)
    : faqs;

  const filteredGuides = searchQuery
    ? guides.filter(
        (g) =>
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guides;

  return (
    <>
      <SEOHead
        title="Help Center - LinkPeek Support & FAQs"
        description="Get answers to common questions about LinkPeek. Learn how to create links, track analytics, and optimize your profile. Browse FAQs and guides."
        canonicalUrl="https://link-peek.org/help"
      />
      <StructuredData
        type="FAQPage"
        faqs={[
          { question: "How do I create my first link?", answer: "After signing up, go to your Dashboard and click 'Add Link' button. Enter your destination URL, customize the title and description, then click 'Create Link'." },
          { question: "What analytics data does LinkPeek track?", answer: "We track click counts, page views, referral sources, geographic location, device types, browsers, and engagement over time. All data is privacy-first with no cookies." },
          { question: "How many links can I create?", answer: "Free plan: 5 active links. Pro plan: Unlimited links. Business plan: Unlimited links with team collaboration." },
          { question: "Can I connect a custom domain?", answer: "Yes! Pro and Business users can connect custom domains. Go to Settings → Domain and follow the DNS configuration instructions." },
          { question: "Can I cancel my subscription anytime?", answer: "Yes! Cancel anytime from Billing settings. You'll retain Pro features until the end of your billing period, then automatically switch to the Free plan." },
        ]}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Help Center</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers, guides, and support for LinkPeek
            </p>

            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>

          {!searchQuery && (
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:border-primary transition-all"
                  onClick={() => {
                    const element = document.getElementById(category.id);
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          <Tabs defaultValue="faqs" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
            </TabsList>

            <TabsContent value="faqs" className="space-y-8">
              {Object.entries(filteredFaqs).map(([categoryId, questions]) => {
                const category = categories.find((c) => c.id === categoryId);
                return (
                  <section key={categoryId} id={categoryId}>
                    <div className="flex items-center gap-3 mb-6">
                      {category && <category.icon className="h-6 w-6 text-primary" />}
                      <h2 className="text-2xl font-heading font-bold">
                        {category?.title || categoryId}
                      </h2>
                    </div>
                    <Accordion type="single" collapsible className="space-y-2">
                      {questions.map((faq, index) => (
                        <AccordionItem
                          key={index}
                          value={`${categoryId}-${index}`}
                          className="border rounded-lg px-4"
                        >
                          <AccordionTrigger className="text-left hover:no-underline">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </section>
                );
              })}

              {Object.keys(filteredFaqs).length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      No results found for "{searchQuery}"
                    </p>
                    <Button onClick={() => setSearchQuery("")}>Clear search</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="guides" className="space-y-6">
              {filteredGuides.map((guide, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{guide.title}</CardTitle>
                        <CardDescription>{guide.description}</CardDescription>
                      </div>
                      <span className="text-xs font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                        {guide.category}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                            {stepIndex + 1}
                          </span>
                          <span className="text-muted-foreground leading-relaxed pt-0.5">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}

              {filteredGuides.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      No guides found for "{searchQuery}"
                    </p>
                    <Button onClick={() => setSearchQuery("")}>Clear search</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <Card className="mt-12 border-primary/50">
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Still need help?</CardTitle>
              <CardDescription className="text-base">
                Cannot find the answer you are looking for? Our support team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button size="lg" onClick={() => navigate("/contact")}>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default HelpCenter;
