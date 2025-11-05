import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  conditions: any;
  dest_example: string;
  category: string;
  impact_score: number;
}

interface Recommendation {
  template: RuleTemplate;
  reason: string;
  priority: number;
}

export function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [appliedRules, setAppliedRules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get all rule templates
      const { data: templates } = await supabase
        .from('rule_templates')
        .select('*')
        .order('impact_score', { ascending: false });

      if (!templates) {
        setLoading(false);
        return;
      }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get user's links
      const { data: links } = await supabase
        .from('links')
        .select('id')
        .eq('user_id', user.user.id);

      if (!links || links.length === 0) {
        setLoading(false);
        return;
      }

      const linkIds = links.map(l => l.id);

      // Get redirect performance by platform
      const { data: redirects } = await supabase
        .from('redirects')
        .select('browser, success')
        .in('link_id', linkIds)
        .gte('ts', thirtyDaysAgo);

      // Analyze performance and generate recommendations
      const recs: Recommendation[] = [];

      if (redirects && redirects.length > 0) {
        // Check Instagram performance
        const instagramRedirects = redirects.filter(r => r.browser === 'Instagram');
        if (instagramRedirects.length > 10) {
          const successRate = (instagramRedirects.filter(r => r.success).length / instagramRedirects.length) * 100;
          if (successRate < 95) {
            const igTemplate = templates.find(t => t.name.includes('Instagram'));
            if (igTemplate) {
              recs.push({
                template: igTemplate,
                reason: `Instagram redirect success at ${successRate.toFixed(1)}% (${(95 - successRate).toFixed(1)}% below optimal)`,
                priority: 10 - Math.floor(successRate / 10)
              });
            }
          }
        }

        // Check TikTok performance
        const tiktokRedirects = redirects.filter(r => r.browser === 'TikTok');
        if (tiktokRedirects.length > 10) {
          const successRate = (tiktokRedirects.filter(r => r.success).length / tiktokRedirects.length) * 100;
          if (successRate < 95) {
            const ttTemplate = templates.find(t => t.name.includes('TikTok'));
            if (ttTemplate) {
              recs.push({
                template: ttTemplate,
                reason: `TikTok redirect success at ${successRate.toFixed(1)}%`,
                priority: 9
              });
            }
          }
        }

        // Add LinkedIn recommendation if traffic exists
        const linkedinRedirects = redirects.filter(r => r.browser === 'LinkedIn');
        if (linkedinRedirects.length > 5) {
          const linkedinTemplate = templates.find(t => t.name.includes('LinkedIn'));
          if (linkedinTemplate) {
            recs.push({
              template: linkedinTemplate,
              reason: 'Optimize LinkedIn traffic for B2B conversions',
              priority: 7
            });
          }
        }
      }

      // Add general best practices if no specific issues
      if (recs.length === 0 && templates.length > 0) {
        recs.push({
          template: templates[0],
          reason: 'Proactive optimization for better performance',
          priority: 5
        });
      }

      // Sort by priority
      recs.sort((a, b) => b.priority - a.priority);
      setRecommendations(recs.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyRule = async (template: RuleTemplate, linkId?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get user's first active link if no specific link provided
      if (!linkId) {
        const { data: links } = await supabase
          .from('links')
          .select('id')
          .eq('user_id', user.user.id)
          .eq('is_active', true)
          .limit(1);

        if (!links || links.length === 0) {
          toast.error('No active links found. Create a link first.');
          return;
        }
        linkId = links[0].id;
      }

      // Create the rule
      const { error } = await supabase
        .from('rules')
        .insert({
          link_id: linkId,
          conditions: template.conditions,
          dest_url: template.dest_example,
          priority: template.impact_score
        });

      if (error) throw error;

      setAppliedRules(prev => new Set([...prev, template.id]));
      toast.success(`Applied: ${template.name}`);
      
    } catch (error) {
      console.error('Error applying rule:', error);
      toast.error('Failed to apply recommendation');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reliability': return <Zap className="h-4 w-4" />;
      case 'conversion': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reliability': return 'bg-blue-500';
      case 'conversion': return 'bg-purple-500';
      case 'performance': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>AI-powered optimization suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Recommendations
        </CardTitle>
        <CardDescription>
          AI-analyzed optimizations based on your traffic patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-sm font-medium">All optimizations applied!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your traffic flow is performing optimally.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div 
                key={rec.template.id}
                className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="gap-1">
                        {getCategoryIcon(rec.template.category)}
                        {rec.template.category}
                      </Badge>
                      <Badge variant="outline">
                        Impact: {rec.template.impact_score}/10
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{rec.template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rec.template.description}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      ⚠️ {rec.reason}
                    </p>
                  </div>
                  <Button
                    onClick={() => applyRule(rec.template)}
                    disabled={appliedRules.has(rec.template.id)}
                    size="sm"
                  >
                    {appliedRules.has(rec.template.id) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Applied
                      </>
                    ) : (
                      'Apply Rule'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}