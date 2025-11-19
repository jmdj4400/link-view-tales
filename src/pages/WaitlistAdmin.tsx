import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { Search, Download, Mail, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface WaitlistEntry {
  id: string;
  email: string;
  status: string;
  created_at: string;
  invited_at: string | null;
}

export default function WaitlistAdmin() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("beta_whitelist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      toast.error("Failed to load waitlist entries");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ["Email", "Status", "Joined Date", "Confirmed Date"],
      ...entries.map((entry) => [
        entry.email,
        entry.status,
        format(new Date(entry.created_at), "yyyy-MM-dd HH:mm:ss"),
        entry.invited_at
          ? format(new Date(entry.invited_at), "yyyy-MM-dd HH:mm:ss")
          : "Not confirmed",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Waitlist exported successfully");
  };

  const filteredEntries = entries.filter((entry) =>
    entry.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: entries.length,
    pending: entries.filter((e) => e.status === "pending").length,
    confirmed: entries.filter((e) => e.status === "confirmed").length,
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <PageHeader showBack title="Waitlist Admin" />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Signups</p>
                  <p className="text-3xl font-bold mt-2">{stats.total}</p>
                </div>
                <Mail className="h-10 w-10 text-primary/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold mt-2">{stats.pending}</p>
                </div>
                <Clock className="h-10 w-10 text-warning/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-3xl font-bold mt-2">{stats.confirmed}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-success/20" />
              </div>
            </Card>
          </div>

          {/* Actions Bar */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </Card>

          {/* Waitlist Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Joined Date</th>
                    <th className="text-left p-4 font-medium">Confirmed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-8 text-muted-foreground">
                        {searchQuery ? "No results found" : "No waitlist entries yet"}
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{entry.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={entry.status === "confirmed" ? "default" : "secondary"}
                          >
                            {entry.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {format(new Date(entry.created_at), "MMM dd, yyyy HH:mm")}
                        </td>
                        <td className="p-4">
                          {entry.invited_at ? (
                            <div className="flex items-center gap-2 text-sm text-success">
                              <CheckCircle className="h-4 w-4" />
                              {format(new Date(entry.invited_at), "MMM dd, yyyy")}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Pending
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
