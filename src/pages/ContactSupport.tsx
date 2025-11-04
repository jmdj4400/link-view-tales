import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle, Clock, HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  category: z.string()
    .min(1, { message: "Please select a category" }),
  subject: z.string()
    .trim()
    .min(1, { message: "Subject is required" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactSupport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: data,
      });

      if (error) throw error;

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      
      reset();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Issue" },
    { value: "billing", label: "Billing & Payments" },
    { value: "account", label: "Account & Settings" },
    { value: "feature", label: "Feature Request" },
    { value: "bug", label: "Bug Report" },
    { value: "other", label: "Other" },
  ];

  return (
    <>
      <SEOHead
        title="Contact Support - LinkPeek"
        description="Get help with LinkPeek. Contact our support team for technical issues, billing questions, feature requests, or general inquiries."
        canonicalUrl="https://yourapp.lovable.app/contact"
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h1 className="text-4xl font-heading font-bold mb-4">Contact Support</h1>
                <p className="text-lg text-muted-foreground">
                  Have a question or need help? Fill out the form below and we will get back to you as soon as possible.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Please provide as much detail as possible to help us assist you better.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          {...register("name")}
                          placeholder="Your full name"
                          disabled={isSubmitting}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="your@email.com"
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        onValueChange={(value) => setValue("category", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-destructive">{errors.category.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        {...register("subject")}
                        placeholder="Brief description of your issue"
                        disabled={isSubmitting}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        {...register("message")}
                        placeholder="Please provide details about your question or issue..."
                        rows={8}
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Minimum 10 characters, maximum 2000 characters
                      </p>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Mail className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Email Support</CardTitle>
                  <CardDescription>
                    Prefer email? Send us a message at
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href="mailto:support@linkpeek.com"
                    className="text-primary hover:underline font-medium"
                  >
                    support@linkpeek.com
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Response Time</CardTitle>
                  <CardDescription>
                    We typically respond within
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Critical issues:</strong> 2-4 hours
                  </p>
                  <p>
                    <strong>General inquiries:</strong> 24 hours
                  </p>
                  <p>
                    <strong>Feature requests:</strong> 48 hours
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Business hours: Monday-Friday, 9 AM - 5 PM EST
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <HelpCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Before You Contact</CardTitle>
                  <CardDescription>
                    Check our resources first
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/help")}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Browse Help Center
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/privacy")}
                  >
                    View Privacy Policy
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/terms")}
                  >
                    View Terms of Service
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactSupport;
