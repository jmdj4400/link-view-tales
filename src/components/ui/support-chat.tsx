import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, X, Send, Loader2, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: { 
          email, 
          message,
          subject: "Support Request from LinkPeek"
        }
      });

      if (error) throw error;

      toast.success("Message sent! We'll get back to you soon.");
      setMessage("");
      setEmail("");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        size="lg"
        className={cn(
          "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg transition-all",
          isOpen && "scale-0"
        )}
        onClick={() => setIsOpen(true)}
        aria-label="Open support chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-96 shadow-2xl border-2 animate-in slide-in-from-bottom-5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Need help?</CardTitle>
                <CardDescription>Send us a message</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </div>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Message
                </div>
                <Textarea
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? "Sending..." : "Send message"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We typically respond within 24 hours
              </p>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}