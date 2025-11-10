import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Clock, Shield } from "lucide-react";
import type { AuthEventType, AuthEventStatus } from "@/lib/logger";

interface AuthLog {
  id: string;
  user_id: string | null;
  event_type: AuthEventType;
  status: AuthEventStatus;
  error_code: string | null;
  error_message: string | null;
  metadata: Record<string, any>;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export function AdminAuthLogs() {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
  }, [eventFilter, statusFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('auth_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventFilter !== "all") {
        query = query.eq('event_type', eventFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as AuthLog[]);
    } catch (error) {
      console.error('Error fetching auth logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: AuthEventStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: AuthEventStatus) => {
    const variants = {
      success: "default",
      failure: "destructive",
      pending: "secondary",
    } as const;

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const getEventBadge = (eventType: AuthEventType) => {
    const colors = {
      signup: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      signin: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      signout: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      password_reset_request: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      password_reset_complete: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      email_verification: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      session_refresh: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      auth_error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return (
      <Badge className={colors[eventType]}>
        {eventType.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Authentication Logs</CardTitle>
        </div>
        <CardDescription>
          Monitor all authentication events and track security issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="signup">Sign Up</SelectItem>
              <SelectItem value="signin">Sign In</SelectItem>
              <SelectItem value="signout">Sign Out</SelectItem>
              <SelectItem value="password_reset_request">Password Reset Request</SelectItem>
              <SelectItem value="password_reset_complete">Password Reset Complete</SelectItem>
              <SelectItem value="email_verification">Email Verification</SelectItem>
              <SelectItem value="session_refresh">Session Refresh</SelectItem>
              <SelectItem value="auth_error">Auth Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No authentication logs found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>{getEventBadge(log.event_type)}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.user_id ? log.user_id.substring(0, 8) + '...' : 'anonymous'}
                    </TableCell>
                    <TableCell>
                      {log.error_message ? (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {log.error_code}: {log.error_message}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <details className="text-xs cursor-pointer">
                          <summary className="text-muted-foreground hover:text-foreground">
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
