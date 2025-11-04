import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCompletenessProps {
  profile: {
    name?: string;
    bio?: string;
    avatar_url?: string;
  };
  linksCount: number;
}

export function ProfileCompleteness({ profile, linksCount }: ProfileCompletenessProps) {
  const tasks = [
    { label: "Add your name", completed: !!profile.name, points: 20 },
    { label: "Write a bio", completed: !!profile.bio, points: 25 },
    { label: "Upload avatar", completed: !!profile.avatar_url, points: 20 },
    { label: "Add your first link", completed: linksCount > 0, points: 20 },
    { label: "Add 3+ links", completed: linksCount >= 3, points: 15 },
  ];

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalPoints = tasks.reduce((sum, t) => sum + (t.completed ? t.points : 0), 0);
  const isComplete = completedTasks === tasks.length;

  return (
    <Card className={cn(
      "border-2 transition-all animate-fade-in",
      isComplete ? "border-primary gradient-subtle" : "border-border"
    )}>
      <CardHeader>
        <CardTitle className="text-xl font-heading flex items-center gap-2">
          {isComplete ? "🎉" : "📋"} Profile Setup
        </CardTitle>
        <CardDescription>
          {isComplete 
            ? "Your profile is 100% complete!" 
            : `${completedTasks} of ${tasks.length} tasks completed`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="font-bold text-primary">{totalPoints}%</span>
          </div>
          <Progress value={totalPoints} className="h-3" />
        </div>
        
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                task.completed ? "bg-primary/10" : "bg-muted/50"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full transition-all",
                task.completed 
                  ? "bg-primary text-white" 
                  : "bg-background border-2 border-muted-foreground/30"
              )}>
                {task.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3 fill-current opacity-30" />
                )}
              </div>
              <span className={cn(
                "flex-1 text-sm font-medium",
                task.completed && "text-muted-foreground line-through"
              )}>
                {task.label}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                +{task.points}%
              </span>
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="text-center pt-2">
            <p className="text-sm font-medium text-primary">
              ✨ All done! Your profile looks amazing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
