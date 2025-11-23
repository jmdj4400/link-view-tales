import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowVisualization } from "@/components/analytics/FlowVisualization";
import { ChannelBenchmarks } from "@/components/analytics/ChannelBenchmarks";
import { SmartRecommendations } from "@/components/analytics/SmartRecommendations";
import { ChannelAlerts } from "@/components/analytics/ChannelAlerts";
import { ReliabilityMetrics } from "@/components/analytics/ReliabilityMetrics";
import { ConversionMetrics } from "@/components/analytics/ConversionMetrics";
import { TrendingUp, Zap, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { useCommonShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useQueryClient } from "@tanstack/react-query";

export default function Insights() {
  useCommonShortcuts();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleRealtimeUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
  }, [queryClient]);

  useRealtimeEvents({ userId: user?.id, onUpdate: handleRealtimeUpdate });

  return (
    <>
      <SEOHead 
        title="Traffic Intelligence - LinkPeek"
        description="Deep analytics, benchmarks, and AI-powered optimization"
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        <PageHeader title="LinkPeek" />
        <div className="container mx-auto py-10 px-4 space-y-8">
          <BreadcrumbNav />
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-3">Social Traffic Intelligence</h1>
            <p className="text-lg text-muted-foreground">
              Deep analytics, benchmarks, and AI-powered optimization
            </p>
          </div>

          <ChannelAlerts />

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="benchmarks" className="gap-2">
                <Zap className="h-4 w-4" />
                Benchmarks
              </TabsTrigger>
              <TabsTrigger value="optimize" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                Optimize
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ReliabilityMetrics />
                <ConversionMetrics />
              </div>
              <FlowVisualization />
            </TabsContent>

            <TabsContent value="benchmarks" className="space-y-6">
              <ChannelBenchmarks />
              <div className="grid gap-6 md:grid-cols-2">
                <ReliabilityMetrics />
                <ConversionMetrics />
              </div>
            </TabsContent>

            <TabsContent value="optimize" className="space-y-6">
              <SmartRecommendations />
              <FlowVisualization />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
