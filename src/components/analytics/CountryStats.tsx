import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface CountryStatsProps {
  countryStats: Array<{ country: string; count: number; percentage: number }>;
}

export function CountryStats({ countryStats }: CountryStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Geographic Distribution
        </CardTitle>
        <CardDescription>Traffic by country</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {countryStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No geographic data yet
            </p>
          ) : (
            countryStats.map((country) => (
              <div key={country.country} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{country.country || 'Unknown'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{country.count}</span>
                    <span className="font-medium">{country.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
