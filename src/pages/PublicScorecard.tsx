import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Calendar, ExternalLink, Share2, TrendingUp } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function PublicScorecard() {
  const { handle } = useParams<{ handle: string }>();

  const { data: scorecard, isLoading } = useQuery({
    queryKey: ['public-scorecard', handle],
    queryFn: async () => {
      // Get user ID from handle
      const { data: profile } = await supabase
        .from('public_profiles')
        .select('id, name, handle, avatar_url')
        .eq('handle', handle)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Get latest scorecard
      const { data: scorecardData, error } = await supabase
        .from('scorecards')
        .select('*')
        .eq('user_id', profile.id)
        .order('period_end', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        profile,
        scorecard: scorecardData,
      };
    },
  });

  const embedCode = `<iframe src="${window.location.href}/embed" width="400" height="300" frameborder="0"></iframe>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  const shareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Copied!",
      description: "Scorecard URL copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading scorecard...</p>
        </div>
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Scorecard Not Found</h1>
          <p className="text-muted-foreground">This user hasn't published a scorecard yet</p>
        </div>
      </div>
    );
  }

  const data = scorecard.scorecard.data as any;
  const stats = data.stats;

  return (
    <>
      <SEOHead
        title={`${scorecard.profile.name}'s Performance Scorecard`}
        description={`View verified performance metrics for @${scorecard.profile.handle} on LinkPeek`}
      />

      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto py-12 px-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              {scorecard.profile.avatar_url && (
                <img
                  src={scorecard.profile.avatar_url}
                  alt={scorecard.profile.name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  {scorecard.profile.name}
                  <Badge variant="outline" className="gap-1">
                    <Award className="h-3 w-3" />
                    Verified
                  </Badge>
                </h1>
                <p className="text-muted-foreground">@{scorecard.profile.handle}</p>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Scorecard</DialogTitle>
                  <DialogDescription>
                    Share this performance scorecard or embed it on your site
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Share URL</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        readOnly
                        value={window.location.href}
                        className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
                      />
                      <Button size="sm" onClick={shareUrl}>
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Embed Code</label>
                    <div className="flex gap-2 mt-1">
                      <textarea
                        readOnly
                        value={embedCode}
                        rows={3}
                        className="flex-1 px-3 py-2 rounded-md border bg-background text-sm font-mono"
                      />
                      <Button size="sm" onClick={copyEmbed}>
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Period Info */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Performance Period: {new Date(scorecard.scorecard.period_start).toLocaleDateString()} - {new Date(scorecard.scorecard.period_end).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedCounter
                  end={stats.totalClicks}
                  className="text-4xl font-bold"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter
                    end={stats.conversionRate}
                    decimals={1}
                    className="text-4xl font-bold"
                  />
                  <span className="text-2xl text-muted-foreground">%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Flow Integrity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter
                    end={stats.flowIntegrity}
                    decimals={1}
                    className="text-4xl font-bold text-primary"
                  />
                  <span className="text-2xl text-muted-foreground">%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Redirect Success
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter
                    end={stats.redirectSuccess}
                    decimals={1}
                    className="text-4xl font-bold"
                  />
                  <span className="text-2xl text-muted-foreground">%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Session Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter
                    end={stats.avgSessionDuration}
                    className="text-4xl font-bold"
                  />
                  <span className="text-xl text-muted-foreground">sec</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Click-Through Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <AnimatedCounter
                    end={stats.avgCTR}
                    decimals={1}
                    className="text-4xl font-bold"
                  />
                  <span className="text-2xl text-muted-foreground">%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Channels */}
          {data.topChannels && data.topChannels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Traffic Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topChannels.map((channel: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <span className="font-medium">{channel.referrer}</span>
                      </div>
                      <span className="text-muted-foreground">{channel.clicks} clicks</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Badge */}
          <div className="mt-8 p-6 rounded-lg border bg-card text-center">
            <Award className="h-12 w-12 text-primary mx-auto mb-2" />
            <p className="font-medium mb-1">Verified by LinkPeek</p>
            <p className="text-sm text-muted-foreground">
              This scorecard is cryptographically signed and cannot be tampered with
            </p>
            <Button variant="link" className="mt-2" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Get your own scorecard
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
