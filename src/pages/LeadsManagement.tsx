import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormBuilder } from "@/components/leads/FormBuilder";
import { FormManager } from "@/components/leads/FormManager";
import { LeadsList } from "@/components/leads/LeadsList";
import { PageLoader } from "@/components/ui/loading-spinner";
import { SEOHead } from "@/components/SEOHead";
import { PageHeader } from "@/components/ui/page-header";

export default function LeadsManagement() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title="Lead Management - LinkPeek"
        description="Manage your leads and contact forms."
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        <PageHeader showBack title="LinkPeek" />

        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">Lead Generation</h1>
            <p className="text-muted-foreground">Create forms and manage your leads</p>
          </div>

          <Tabs defaultValue="forms" className="space-y-6">
            <TabsList>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
            </TabsList>

            <TabsContent value="forms" className="space-y-6">
              <div className="flex justify-end">
                <FormBuilder />
              </div>
              <FormManager />
            </TabsContent>

            <TabsContent value="leads">
              <LeadsList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
