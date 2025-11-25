import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Sparkles, Link as LinkIcon, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateDemoLink } from "@/lib/demo-data-generator";
import { toast } from "sonner";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingModal({ open, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);

  const handleCreateDemo = async () => {
    setIsCreatingDemo(true);
    try {
      await generateDemoLink();
      toast.success("Demo link created with realistic data!");
      setCurrentStep(2); // Move to final step
    } catch (error) {
      console.error("Error creating demo:", error);
      toast.error("Failed to create demo link");
    } finally {
      setIsCreatingDemo(false);
    }
  };

  const steps = [
    {
      title: "What We Do",
      icon: Sparkles,
      content: (
        <div className="space-y-4 py-6">
          <p className="text-base text-muted-foreground leading-relaxed">
            LinkPeek automatically <strong>cleans</strong>, <strong>unwraps</strong>, and <strong>monitors</strong> your social media links.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div>
                <p className="font-medium text-sm">Unwrap Social Wrappers</p>
                <p className="text-sm text-muted-foreground">Remove Instagram, Facebook, TikTok link redirects</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div>
                <p className="font-medium text-sm">Clean UTM Parameters</p>
                <p className="text-sm text-muted-foreground">Fix broken tracking parameters automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div>
                <p className="font-medium text-sm">Monitor Redirect Health</p>
                <p className="text-sm text-muted-foreground">Get alerts when links fail or slow down</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Create Demo Link",
      icon: LinkIcon,
      content: (
        <div className="space-y-4 py-6">
          <p className="text-base text-muted-foreground leading-relaxed">
            Let's create a demo link with <strong>realistic click data</strong> so you can see how LinkPeek works.
          </p>
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground mb-3">The demo will show you:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-primary" />
                Real-time click tracking
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-primary" />
                Redirect success rates
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-primary" />
                Device & browser breakdown
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-primary" />
                24-hour activity sparkline
              </li>
            </ul>
          </div>
          <Button
            onClick={handleCreateDemo}
            disabled={isCreatingDemo}
            className="w-full"
            size="lg"
          >
            {isCreatingDemo ? "Creating Demo..." : "Create Demo Link"}
          </Button>
        </div>
      ),
    },
    {
      title: "See Real Data",
      icon: BarChart3,
      content: (
        <div className="space-y-4 py-6">
          <p className="text-base text-muted-foreground leading-relaxed">
            Your dashboard is now populated with <strong>demo data</strong>. Explore the metrics to see how LinkPeek helps you:
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <p className="font-medium text-sm">Track Click Patterns</p>
                <p className="text-sm text-muted-foreground">See when and where your audience engages</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
              <div>
                <p className="font-medium text-sm">Monitor Link Health</p>
                <p className="text-sm text-muted-foreground">Get instant alerts for failing redirects</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
              <div>
                <p className="font-medium text-sm">Optimize Performance</p>
                <p className="text-sm text-muted-foreground">Identify slow redirects and bottlenecks</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground pt-4 border-t">
            Ready to create your own links? Click <strong>Get Started</strong> below.
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed_at: new Date().toISOString() })
          .eq('id', user.id);
      }
      onComplete();
      onClose();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      onClose();
    }
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{steps[currentStep].title}</DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Step {currentStep + 1} of {steps.length}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-[300px]">
          {steps[currentStep].content}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={currentStep === 1 && isCreatingDemo}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Get Started
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
