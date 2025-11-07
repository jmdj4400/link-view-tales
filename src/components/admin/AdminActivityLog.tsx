import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function AdminActivityLog() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          id,
          action,
          created_at,
          meta,
          profiles (
            email,
            handle
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>
          Recent system activity and audit trail
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant="outline">{log.action}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.profiles?.email || "System"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {log.meta ? JSON.stringify(log.meta).substring(0, 50) + "..." : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
