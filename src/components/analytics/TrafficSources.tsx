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
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl">Traffic Sources</CardTitle>
        <CardDescription className="text-base">
          Where your clicks are coming from ({timeRange === '7d' ? 'last 7 days' : 'last 30 days'})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sources.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mb-3 text-4xl">🌍</div>
            <p className="font-medium">No traffic data yet</p>
            <p className="text-sm mt-1">Share your links to see where visitors come from</p>
          </div>
        ) : (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sources}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
                <XAxis 
                  dataKey="source" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                />
                <Bar 
                  dataKey="clicks" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              {sources.map((source, idx) => (
                <div key={source.source} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-primary/10' : 'bg-muted'}`}>
                      {getSourceIcon(source.source)}
                    </div>
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {source.percentage.toFixed(1)}%
                    </span>
                    <span className="font-bold text-lg">{source.clicks}</span>
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
