import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface Variant {
  id: string;
  name: string;
  dest_url: string;
  traffic_percentage: number;
  is_active: boolean;
}

interface ABTestManagerProps {
  linkId: string;
  linkTitle: string;
}

export function ABTestManager({ linkId, linkTitle }: ABTestManagerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [destUrl, setDestUrl] = useState("");
  const [trafficPercentage, setTrafficPercentage] = useState(50);
  const queryClient = useQueryClient();

  const { data: variants = [] } = useQuery({
    queryKey: ["link-variants", linkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("link_variants")
        .select("*")
        .eq("link_id", linkId)
        .order("created_at");
      if (error) throw error;
      return data as Variant[];
    },
  });

  const { data: variantStats } = useQuery({
    queryKey: ["variant-stats", linkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("variant_id")
        .eq("link_id", linkId)
        .eq("event_type", "click");
      
      if (error) throw error;

      const stats = data.reduce((acc, event) => {
        const variantId = event.variant_id || "original";
        acc[variantId] = (acc[variantId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return stats;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newVariant: { name: string; dest_url: string; traffic_percentage: number }) => {
      const { error } = await supabase.from("link_variants").insert({
        link_id: linkId,
        ...newVariant,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["link-variants", linkId] });
      toast.success("Variant created");
      resetForm();
    },
    onError: () => toast.error("Failed to create variant"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("link_variants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["link-variants", linkId] });
      toast.success("Variant deleted");
    },
    onError: () => toast.error("Failed to delete variant"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, dest_url: destUrl, traffic_percentage: trafficPercentage });
  };

  const resetForm = () => {
    setName("");
    setDestUrl("");
    setTrafficPercentage(50);
    setOpen(false);
  };

  const totalClicks = Object.values(variantStats || {}).reduce((sum, clicks) => sum + clicks, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            A/B Test Variants - {linkTitle}
          </span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create A/B Test Variant</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="variant-name">Variant Name</Label>
                  <Input
                    id="variant-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Version B, Test 1..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="variant-url">Destination URL</Label>
                  <Input
                    id="variant-url"
                    type="url"
                    value={destUrl}
                    onChange={(e) => setDestUrl(e.target.value)}
                    placeholder="https://example.com/variant"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="traffic">Traffic Allocation (%)</Label>
                  <Input
                    id="traffic"
                    type="number"
                    min="0"
                    max="100"
                    value={trafficPercentage}
                    onChange={(e) => setTrafficPercentage(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Create Variant</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original Link Stats */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Original</span>
            <span className="text-sm text-muted-foreground">
              {variantStats?.["original"] || 0} clicks
            </span>
          </div>
          {totalClicks > 0 && (
            <div className="space-y-1">
              <Progress 
                value={((variantStats?.["original"] || 0) / totalClicks) * 100} 
              />
              <p className="text-xs text-muted-foreground">
                {(((variantStats?.["original"] || 0) / totalClicks) * 100).toFixed(1)}% of traffic
              </p>
            </div>
          )}
        </div>

        {/* Variants */}
        {variants.map((variant) => (
          <div key={variant.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{variant.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(variant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground truncate">{variant.dest_url}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Target: {variant.traffic_percentage}% traffic
                </span>
                <span className="text-muted-foreground">
                  {variantStats?.[variant.id] || 0} clicks
                </span>
              </div>
              {totalClicks > 0 && (
                <>
                  <Progress 
                    value={((variantStats?.[variant.id] || 0) / totalClicks) * 100} 
                  />
                  <p className="text-xs text-muted-foreground">
                    {(((variantStats?.[variant.id] || 0) / totalClicks) * 100).toFixed(1)}% actual traffic
                  </p>
                </>
              )}
            </div>
          </div>
        ))}

        {variants.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No variants created yet. Add one to start A/B testing.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
