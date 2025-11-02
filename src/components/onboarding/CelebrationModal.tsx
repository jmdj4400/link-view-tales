import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Zap } from "lucide-react";
import confetti from "canvas-confetti";

interface CelebrationModalProps {
  open: boolean;
  seconds: number;
  onContinue: () => void;
}

export function CelebrationModal({ open, seconds, onContinue }: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open && !showConfetti) {
      setShowConfetti(true);
      
      // Fire confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [open, showConfetti]);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            🎉 Challenge Complete!
          </DialogTitle>
          <DialogDescription className="text-center space-y-4">
            <div className="text-lg font-semibold text-foreground">
              You did it in {seconds} seconds!
            </div>
            <div className="flex items-center justify-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium text-primary">
                1 Month of Pro unlocked
              </span>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground">
              Your Pro trial includes:
            </div>
            <ul className="text-sm space-y-1 text-left mx-auto max-w-xs">
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Unlimited links
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                90-day analytics history
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                CSV export & advanced features
              </li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <Button onClick={onContinue} size="lg" className="w-full mt-4">
          Continue to Dashboard
        </Button>
      </DialogContent>
    </Dialog>
  );
}
