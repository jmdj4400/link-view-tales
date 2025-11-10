import { AlertCircle, Clock, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TrialCountdownBannerProps {
  trialDaysRemaining: number;
  planName: string;
  trialEndDate: string;
}

export function TrialCountdownBanner({ 
  trialDaysRemaining, 
  planName,
  trialEndDate 
}: TrialCountdownBannerProps) {
  const navigate = useNavigate();
  
  // Don't show if trial has ended
  if (trialDaysRemaining <= 0) return null;
  
  const isUrgent = trialDaysRemaining <= 3;
  const formattedDate = new Date(trialEndDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <Alert 
      variant={isUrgent ? "destructive" : "default"}
      className="mb-6 border-2"
    >
      <div className="flex items-start gap-3">
        {isUrgent ? (
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        ) : (
          <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <AlertTitle className="text-lg font-heading font-bold">
            {isUrgent ? `⚠️ Trial Ending Soon!` : `🎉 ${planName} Trial Active`}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="text-sm">
              Your {planName} trial {isUrgent ? 'ends' : 'will end'} on <strong>{formattedDate}</strong>
              {' '}({trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining)
            </p>
            {isUrgent && (
              <p className="text-sm font-medium">
                Your payment method will be charged automatically when the trial ends.
              </p>
            )}
          </AlertDescription>
        </div>
        <Button 
          variant={isUrgent ? "secondary" : "outline"}
          size="sm"
          onClick={() => navigate('/billing')}
          className="flex-shrink-0"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Manage Plan
        </Button>
      </div>
    </Alert>
  );
}