import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Instagram, X } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import { InstagramSetupGuide } from "@/components/onboarding/InstagramSetupGuide";

interface SetupBannerProps {
  userId: string;
  profileUrl: string;
  onDismiss: () => void;
}

export function SetupBanner({ userId, profileUrl, onDismiss }: SetupBannerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDismiss = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ setup_guide_dismissed: true })
      .eq('id', userId);

    if (error) {
      toast.error("Failed to dismiss banner");
    } else {
      onDismiss();
    }
    setIsUpdating(false);
  };

  const handleComplete = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ 
        instagram_bio_setup_completed: true,
        setup_guide_dismissed: true 
      })
      .eq('id', userId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Setup complete!");
      setShowDialog(false);
      onDismiss();
    }
    setIsUpdating(false);
  };

  return (
    <>
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-2 border-purple-500/20">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shrink-0">
            <Instagram className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-sm">Next step: Add your LinkPeek to Instagram</h3>
            <p className="text-sm text-muted-foreground">
              Share your unique URL in your Instagram bio to start tracking clicks and conversions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowDialog(true)}
              size="sm"
            >
              Show me how
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={isUpdating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add LinkPeek to Instagram</DialogTitle>
            <DialogDescription>
              Follow these steps to add your profile to Instagram
            </DialogDescription>
          </DialogHeader>
          <InstagramSetupGuide
            profileUrl={profileUrl}
            onComplete={handleComplete}
            onSkip={() => setShowDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
