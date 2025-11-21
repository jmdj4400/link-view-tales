import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Link as LinkIcon, User, Share2, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: any;
  action: () => void;
  actionLabel: string;
}

export function FirstStepsChecklist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSteps();
    }
  }, [user]);

  const checkSteps = async () => {
    if (!user?.id) return;

    // Check profile completion
    const { data: profile } = await supabase
      .from('profiles')
      .select('bio, avatar_url')
      .eq('id', user.id)
      .single();

    const hasProfile = !!(profile?.bio || profile?.avatar_url);

    // Check if user has created a link
    const { data: links } = await supabase
      .from('links')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    const hasLinks = (links?.length || 0) > 0;

    // Check if user has shared (has any clicks)
    const { data: events } = await supabase
      .from('events')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_type', 'click')
      .limit(1);

    const hasClicks = (events?.length || 0) > 0;

    setSteps([
      {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your bio and avatar to personalize your LinkPeek page',
        completed: hasProfile,
        icon: User,
        action: () => navigate('/settings/profile'),
        actionLabel: 'Edit Profile',
      },
      {
        id: 'link',
        title: 'Create Your First Link',
        description: 'Add a tracking link to start monitoring clicks',
        completed: hasLinks,
        icon: LinkIcon,
        action: () => navigate('/links'),
        actionLabel: 'Create Link',
      },
      {
        id: 'share',
        title: 'Share Your Profile',
        description: 'Add your LinkPeek URL to Instagram or other social media',
        completed: hasClicks,
        icon: Share2,
        action: () => navigate('/settings/profile'),
        actionLabel: 'Get Link',
      },
    ]);

    setLoading(false);
  };

  if (loading) return null;

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  // Don't show if all complete
  if (completedCount === steps.length) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Get Started with LinkPeek</CardTitle>
            <CardDescription>
              Complete these steps to unlock the full potential
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{completedCount}/{steps.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
        <Progress value={progress} className="mt-3" />
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="mt-0.5">
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <step.icon className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-sm">{step.title}</p>
              </div>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            {!step.completed && (
              <Button
                size="sm"
                variant="ghost"
                onClick={step.action}
                className="shrink-0"
              >
                {step.actionLabel}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
