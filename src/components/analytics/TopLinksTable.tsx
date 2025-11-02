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
  timeRange: '7d' | '30d';
}

export function TopLinksTable({ links, timeRange }: TopLinksTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Links</CardTitle>
        <CardDescription>
          Your most clicked links in the last {timeRange === '7d' ? '7 days' : '30 days'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No link data yet. Share your profile to start tracking!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">{link.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {new URL(link.dest_url).hostname}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {link.clicks}
                  </TableCell>
                  <TableCell className="text-right">
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
