import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DraggableLinkEditor } from "@/components/profile/DraggableLinkEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SEOHead } from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";

export default function LinkManagement() {
  const navigate = useNavigate();

  const { data: links = [], refetch } = useQuery({
    queryKey: ["links-management"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <SEOHead
        title="Link Management - LinkPeek"
        description="Drag and drop to reorder your links"
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        <PageHeader showBack title="Link Management" />

        <div className="container mx-auto px-6 py-10 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Manage Your Links</h1>
              <p className="text-muted-foreground">Drag to reorder, toggle visibility</p>
            </div>
            <Button onClick={() => navigate("/settings/links")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>

          {links.length > 0 ? (
            <DraggableLinkEditor links={links} onReorder={() => refetch()} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No links yet. Create your first link!</p>
              <Button onClick={() => navigate("/settings/links")} className="mt-4">
                Create Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
