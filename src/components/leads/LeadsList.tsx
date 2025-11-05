import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Lead {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  created_at: string;
}

export function LeadsList() {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  const exportLeads = () => {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    // Create CSV content
    const headers = ["Email", "Name", "Phone", "Message", "Source", "Date"];
    const rows = leads.map(lead => [
      lead.email,
      lead.name || "",
      lead.phone || "",
      lead.message || "",
      lead.source,
      format(new Date(lead.created_at), "yyyy-MM-dd HH:mm:ss"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Leads exported successfully");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Leads</h2>
          <p className="text-muted-foreground">{leads.length} total leads</p>
        </div>
        {leads.length > 0 && (
          <Button onClick={exportLeads} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No leads yet. Create a form to start collecting leads.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {lead.email}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(lead.created_at), "MMM dd, yyyy 'at' HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {lead.name && (
                  <div className="text-sm">
                    <span className="font-medium">Name:</span> {lead.name}
                  </div>
                )}
                {lead.phone && (
                  <div className="text-sm flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </div>
                )}
                {lead.message && (
                  <div className="text-sm">
                    <span className="font-medium">Message:</span>
                    <p className="mt-1 text-muted-foreground">{lead.message}</p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Source: {lead.source}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
