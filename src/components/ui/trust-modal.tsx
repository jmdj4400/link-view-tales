import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Target, Shield, TrendingUp, ExternalLink } from "lucide-react";

interface TrustModalProps {
  open: boolean;
  onClose: () => void;
}

export function TrustModal({ open, onClose }: TrustModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">How LinkPeek Measures Traffic</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Understanding the difference between taps and real arrivals
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Key difference */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm mb-2">Platforms count taps. We measure real delivered arrivals.</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instagram, TikTok, and Facebook report when someone <strong>taps</strong> your link. 
                  But many of those taps fail due to in-app browser issues, redirect chains, or network errors.
                </p>
              </div>
            </div>
          </div>

          {/* What we do */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              What LinkPeek Tracks
            </h4>
            <div className="space-y-2.5 ml-6">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">In-app browser detection:</strong> We identify traffic from Instagram, TikTok, Facebook, and LinkedIn browsers that often fail redirects.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Drop-off tracking:</strong> We measure where users tap but never reach your destination due to browser issues.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Real arrivals:</strong> We only count clicks when the user actually loads your destination page.
                </p>
              </div>
            </div>
          </div>

          {/* The result */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm mb-1.5">This gives you the true version of your traffic.</p>
                <p className="text-sm text-muted-foreground">
                  You'll see <strong>fewer clicks</strong> than platforms report, but these are <strong>real, delivered visits</strong> — 
                  not lost taps. This helps you understand your actual reach and redirect health.
                </p>
              </div>
            </div>
          </div>

          {/* Learn more link */}
          <div className="pt-2 border-t">
            <Button 
              variant="link" 
              className="text-sm p-0 h-auto" 
              onClick={() => window.open('https://linkpeek.com/docs/measurement', '_blank')}
            >
              Learn more about our measurement methodology
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}