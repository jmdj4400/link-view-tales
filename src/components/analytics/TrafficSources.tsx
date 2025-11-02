import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe, Instagram, Youtube, Twitter, Facebook } from "lucide-react";

interface TrafficSource {
  source: string;
  clicks: number;
  percentage: number;
}

interface TrafficSourcesProps {
  sources: TrafficSource[];
  timeRange: '7d' | '30d';
}

const getSourceIcon = (source: string) => {
  const lowerSource = source.toLowerCase();
  if (lowerSource.includes('instagram')) return <Instagram className="h-4 w-4" />;
  if (lowerSource.includes('youtube')) return <Youtube className="h-4 w-4" />;
  if (lowerSource.includes('twitter') || lowerSource.includes('x.com')) return <Twitter className="h-4 w-4" />;
  if (lowerSource.includes('facebook')) return <Facebook className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
};

export function TrafficSources({ sources, timeRange }: TrafficSourcesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
        <CardDescription>
          Where your clicks are coming from ({timeRange === '7d' ? 'last 7 days' : 'last 30 days'})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No traffic data yet
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sources}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="source" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="clicks" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="space-y-2">
              {sources.map((source) => (
                <div key={source.source} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(source.source)}
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {source.percentage.toFixed(1)}%
                    </span>
                    <span className="font-bold">{source.clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
