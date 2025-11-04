import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

interface UTMBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: {
    id: string;
    title: string;
    dest_url: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
  };
  onSave: (linkId: string, utmSource: string | null, utmMedium: string | null, utmCampaign: string | null) => Promise<void>;
}

export function UTMBuilderDialog({ open, onOpenChange, link, onSave }: UTMBuilderDialogProps) {
  const [utmSource, setUtmSource] = useState(link.utm_source || "");
  const [utmMedium, setUtmMedium] = useState(link.utm_medium || "");
  const [utmCampaign, setUtmCampaign] = useState(link.utm_campaign || "");
  const [isSaving, setIsSaving] = useState(false);

  const buildPreviewUrl = () => {
    const url = new URL(link.dest_url);
    if (utmSource) url.searchParams.set('utm_source', utmSource);
    if (utmMedium) url.searchParams.set('utm_medium', utmMedium);
    if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
    return url.toString();
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(
      link.id,
      utmSource || null,
      utmMedium || null,
      utmCampaign || null
    );
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildPreviewUrl());
    toast.success("URL copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>UTM Parameters</DialogTitle>
          <DialogDescription>
            Add tracking parameters to "{link.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="utm-source">
              UTM Source <span className="text-muted-foreground text-xs">(e.g., facebook, newsletter)</span>
            </Label>
            <Input
              id="utm-source"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="facebook"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="utm-medium">
              UTM Medium <span className="text-muted-foreground text-xs">(e.g., social, email, cpc)</span>
            </Label>
            <Input
              id="utm-medium"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="social"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="utm-campaign">
              UTM Campaign <span className="text-muted-foreground text-xs">(e.g., spring-sale)</span>
            </Label>
            <Input
              id="utm-campaign"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="spring-sale"
            />
          </div>

          {(utmSource || utmMedium || utmCampaign) && (
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Preview URL:</Label>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  Copy
                </Button>
              </div>
              <p className="text-xs break-all font-mono">{buildPreviewUrl()}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save UTM"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
