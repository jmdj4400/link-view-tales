import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  title: string;
  description: string;
  feature: string;
  onDismiss?: () => void;
  variant?: "card" | "banner";
}

export function UpgradePrompt({ 
  title, 
  description, 
  feature,
  onDismiss,
  variant = "card" 
}: UpgradePromptProps) {
  const navigate = useNavigate();

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{description}</p>
              <Button size="sm" onClick={() => navigate('/billing')}>
                Upgrade to Pro
              </Button>
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle>{title}</CardTitle>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => navigate('/billing')} className="w-full">
          Upgrade to {feature}
        </Button>
      </CardContent>
    </Card>
  );
}
