import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AdminRoleManagement() {
  const queryClient = useQueryClient();

  const { data: roleAssignments, isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("id, role, created_at, user_id")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data separately
      const rolesWithProfiles = await Promise.all(
        roles.map(async (role) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, handle, name")
            .eq("id", role.user_id)
            .single();

          return { ...role, profiles: profile };
        })
      );

      return rolesWithProfiles;
    },
  });

  const removeRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("Role removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove role: " + error.message);
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
        <CardDescription>
          Manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roleAssignments?.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  {assignment.profiles?.name || assignment.profiles?.handle}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {assignment.profiles?.email}
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {assignment.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(assignment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRole.mutate(assignment.id)}
                    disabled={removeRole.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
