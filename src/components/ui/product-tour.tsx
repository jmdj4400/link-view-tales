import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  title: string;
  description: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface ProductTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  show: boolean;
}

export function ProductTour({ steps, onComplete, onSkip, show }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!show) return;

    const updatePosition = () => {
      const target = steps[currentStep]?.target;
      if (target) {
        const element = document.querySelector(target);
        if (element) {
          const rect = element.getBoundingClientRect();
          const pos = steps[currentStep]?.position || "bottom";
          
          let top = rect.bottom + 10;
          let left = rect.left;

          if (pos === "top") {
            top = rect.top - 200;
          } else if (pos === "left") {
            top = rect.top;
            left = rect.left - 320;
          } else if (pos === "right") {
            top = rect.top;
            left = rect.right + 10;
          }

          setPosition({ top, left });
        }
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [currentStep, show, steps]);

  if (!show) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
      
      {/* Tour Card */}
      <Card 
        className="fixed z-50 w-80 shadow-lg border-2 border-primary/20"
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`,
          transition: "all 0.3s ease"
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Step {currentStep + 1} of {steps.length}
              </div>
              <CardTitle className="text-base">{step.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">
            {step.description}
          </CardDescription>
          
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {isLastStep ? (
              <Button size="sm" onClick={onComplete}>
                <Check className="h-4 w-4 mr-2" />
                Got it
              </Button>
            ) : (
              <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-1 pt-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i === currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}