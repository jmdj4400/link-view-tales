import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DraggableLinkEditor } from "@/components/profile/DraggableLinkEditor";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SEOHead } from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage Your Links</h1>
              <p className="text-base text-muted-foreground">Drag to reorder, toggle visibility</p>
            </div>
            <Button onClick={() => navigate("/settings/links")} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>

          {links.length > 0 ? (
            <DraggableLinkEditor links={links} onReorder={() => refetch()} />
          ) : (
            <EmptyState
              icon={LinkIcon}
              title="No links yet"
              description="Create your first tracking link to start monitoring clicks and engagement from your social media profiles."
              action={{
                label: "Create First Link",
                onClick: () => navigate("/settings/links")
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
