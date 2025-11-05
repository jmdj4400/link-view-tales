import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, BarChart3, Copy } from "lucide-react";
import { toast } from "sonner";

interface LeadForm {
  id: string;
  name: string;
  title: string;
  submission_count: number;
  is_active: boolean;
  created_at: string;
}

export function FormManager() {
  const queryClient = useQueryClient();

  const { data: forms = [] } = useQuery({
    queryKey: ["lead-forms"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("lead_forms")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LeadForm[];
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("lead_forms")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-forms"] });
      toast.success("Form status updated");
    },
    onError: () => toast.error("Failed to update form"),
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lead_forms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-forms"] });
      toast.success("Form deleted");
    },
    onError: () => toast.error("Failed to delete form"),
  });

  const copyEmbedCode = (formId: string) => {
    const embedCode = `<iframe src="${window.location.origin}/embed/form/${formId}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Your Forms</h2>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No forms created yet. Create your first form to start collecting leads.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{form.name}</CardTitle>
                    <CardDescription>{form.title}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={() =>
                        toggleActiveMutation.mutate({ id: form.id, isActive: form.is_active })
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {form.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {form.submission_count} submission{form.submission_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyEmbedCode(form.id)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Embed Code
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteFormMutation.mutate(form.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
