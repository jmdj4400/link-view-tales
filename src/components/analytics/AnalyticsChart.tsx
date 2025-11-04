import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AnalyticsChartProps {
  data: Array<{
    date: string;
    clicks: number;
    views: number;
  }>;
  timeRange?: '7d' | '30d';
}

export function AnalyticsChart({ data, timeRange }: AnalyticsChartProps) {
  const isEmpty = !data || data.length === 0;
  
  return (
    <Card className="border-2 hover:border-primary/50 transition-all shadow-elegant animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-heading">Performance Overview</CardTitle>
        <CardDescription className="text-base">
          Track your engagement trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center h-[400px] text-center">
            <div className="space-y-3">
              <div className="text-5xl">📈</div>
              <p className="font-medium text-muted-foreground">No data yet</p>
              <p className="text-sm text-muted-foreground">Share your profile to start tracking engagement!</p>
            </div>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--primary))',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px 16px'
              }}
              labelStyle={{ 
                fontWeight: 700, 
                marginBottom: '8px',
                fontSize: '14px',
                fontFamily: 'var(--font-heading)'
              }}
              itemStyle={{
                fontSize: '13px',
                padding: '4px 0'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '24px',
                fontSize: '14px',
                fontWeight: 500
              }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              name="Page Views"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 5 }}
              activeDot={{ r: 8, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="hsl(262 83% 58%)" 
              strokeWidth={3}
              name="Link Clicks"
              dot={{ fill: 'hsl(262 83% 58%)', strokeWidth: 0, r: 5 }}
              activeDot={{ r: 8, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
