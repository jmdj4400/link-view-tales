import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

interface TopLink {
  id: string;
  title: string;
  dest_url: string;
  clicks: number;
  views: number;
  ctr: number;
}

interface TopLinksTableProps {
  links: TopLink[];
  timeRange?: '7d' | '30d';
}

export function TopLinksTable({ links, timeRange }: TopLinksTableProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl">Top Performing Links</CardTitle>
        <CardDescription className="text-base">
          Your most clicked links
        </CardDescription>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mb-3 text-4xl">📊</div>
            <p className="font-medium">No link data yet</p>
            <p className="text-sm mt-1">Share your profile to start tracking!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Link</TableHead>
                <TableHead className="text-right font-semibold">Clicks</TableHead>
                <TableHead className="text-right font-semibold">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">{link.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {new URL(link.dest_url).hostname}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-lg">
                    {link.clicks}
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {link.ctr.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
