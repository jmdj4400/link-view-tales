import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, ExternalLink, Instagram } from "lucide-react";
import { toast } from "sonner";

interface InstagramSetupGuideProps {
  profileUrl: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function InstagramSetupGuide({ profileUrl, onComplete, onSkip }: InstagramSetupGuideProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile URL copied");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const handleTestLink = () => {
    window.open(profileUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-elegant">
            <Instagram className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-heading font-semibold">Share your LinkPeek</h3>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Copy your unique URL and add it to your Instagram bio to start tracking clicks
        </p>
      </div>

      <Card className="p-6 space-y-4 bg-muted/30 border-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Your LinkPeek URL</label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-background border-2 rounded-xl font-mono text-sm break-all">
              {profileUrl}
            </div>
            <Button
              onClick={handleCopy}
              size="lg"
              variant={copied ? "default" : "outline"}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <Button
          onClick={handleTestLink}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Preview your profile
        </Button>
      </Card>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">How to add to Instagram</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              1
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Open Instagram and go to your profile</p>
              <p className="text-xs text-muted-foreground">Tap your profile picture or username</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              2
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Tap "Edit Profile"</p>
              <p className="text-xs text-muted-foreground">Look for the button below your bio</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              3
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Find the "Links" or "Website" field</p>
              <p className="text-xs text-muted-foreground">Paste your LinkPeek URL there</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              4
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Save your changes</p>
              <p className="text-xs text-muted-foreground">Your LinkPeek is now live on Instagram!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={onComplete}
          className="flex-1"
          size="lg"
        >
          <Check className="h-4 w-4 mr-2" />
          I've added it to Instagram
        </Button>
        <Button
          onClick={onSkip}
          variant="ghost"
          size="lg"
        >
          Skip for now
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        You can also add this URL to TikTok, LinkedIn, or any other social platform
      </p>
    </div>
  );
}
