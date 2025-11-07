import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";

export function AdminUserManagement() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, name, handle, plan, created_at, firewall_enabled")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch roles separately for each user
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);

          return { ...profile, user_roles: roles || [] };
        })
      );

      return usersWithRoles;
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage users and their roles across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Handle</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Firewall</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">{user.email}</TableCell>
                <TableCell>{user.name || "—"}</TableCell>
                <TableCell>@{user.handle}</TableCell>
                <TableCell>
                  <Badge variant={user.plan === "pro" ? "default" : "secondary"}>
                    {user.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.user_roles && user.user_roles.length > 0 ? (
                      user.user_roles.map((ur: any) => (
                        <Badge key={ur.role} variant="outline" className="text-xs">
                          {ur.role}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No roles</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.firewall_enabled ? "default" : "secondary"}>
                    {user.firewall_enabled ? "On" : "Off"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
