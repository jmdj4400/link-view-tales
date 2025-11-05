import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Code, Webhook } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";

interface Goal {
  id: string;
  name: string;
  type: 'pixel' | 'webhook';
  active: boolean;
  created_at: string;
}

export default function ConversionTracking() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalType, setNewGoalType] = useState<'pixel' | 'webhook'>('pixel');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data as Goal[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createGoal = async () => {
    if (!newGoalName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a goal name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase.from('goals').insert({
        user_id: user.user.id,
        name: newGoalName,
        type: newGoalType,
        active: true
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal created successfully"
      });

      setNewGoalName("");
      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = async (goalId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ active: !currentState })
        .eq('id', goalId);

      if (error) throw error;
      fetchGoals();
      
      toast({
        title: "Success",
        description: `Goal ${!currentState ? 'activated' : 'deactivated'}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`
    });
  };

  const getPixelCode = (goalId: string) => {
    const baseUrl = window.location.origin;
    return `<img src="${baseUrl}/api/pixel?goal_id=${goalId}&e={{EVENT_ID}}" width="1" height="1" style="display:none" />`;
  };

  const getWebhookCode = (goalId: string) => {
    const baseUrl = window.location.origin;
    return `POST ${baseUrl}/api/webhook
Content-Type: application/json

{
  "goal_id": "${goalId}",
  "event_ref": "{{YOUR_EVENT_ID}}",
  "value": 99.99
}`;
  };

  return (
    <>
      <SEOHead 
        title="Conversion Tracking - LinkPeek"
        description="Track conversions with pixel and webhook integrations"
      />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Conversion Tracking</h1>
          <p className="text-muted-foreground">
            Create goals and track conversions with pixels or webhooks
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
            <CardDescription>
              Add a conversion goal to track clicks that result in desired actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g., Newsletter Signup, Purchase, Booking"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="goal-type">Tracking Type</Label>
                <Select value={newGoalType} onValueChange={(v) => setNewGoalType(v as 'pixel' | 'webhook')}>
                  <SelectTrigger id="goal-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pixel">Pixel (Image Tag)</SelectItem>
                    <SelectItem value="webhook">Webhook (API)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={createGoal} disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                Create Goal
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Goals</CardTitle>
            <CardDescription>
              Manage conversion goals and get tracking codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No goals yet. Create one to start tracking conversions.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {goal.type === 'pixel' ? <Code className="mr-1 h-3 w-3" /> : <Webhook className="mr-1 h-3 w-3" />}
                          {goal.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={goal.active ? "default" : "secondary"}>
                          {goal.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(
                            goal.type === 'pixel' ? getPixelCode(goal.id) : getWebhookCode(goal.id),
                            `${goal.type} code`
                          )}
                        >
                          <Copy className="mr-2 h-3 w-3" />
                          Copy Code
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleGoal(goal.id, goal.active)}
                        >
                          {goal.active ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
