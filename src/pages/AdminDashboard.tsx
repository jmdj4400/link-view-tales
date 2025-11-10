import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminSystemMetrics } from "@/components/admin/AdminSystemMetrics";
import { AdminActivityLog } from "@/components/admin/AdminActivityLog";
import { AdminRoleManagement } from "@/components/admin/AdminRoleManagement";
import { AdminAuthLogs } from "@/components/admin/AdminAuthLogs";
import { Shield, Users, Activity, Settings, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useUserRoles();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Admin Dashboard" showBack />
      
      <main className="container mx-auto px-6 py-8">
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You have administrator access. Handle user data responsibly.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="auth">
              <Lock className="h-4 w-4 mr-2" />
              Auth Logs
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <Activity className="h-4 w-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Settings className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <AdminRoleManagement />
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            <AdminAuthLogs />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <AdminSystemMetrics />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <AdminActivityLog />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
