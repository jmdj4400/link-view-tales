import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RecoveryStats {
  totalRecoveries: number;
  successRate: number;
  topStrategy: string;
  platformBreakdown: {
    platform: string;
    attempts: number;
    successRate: number;
  }[];
}

export function useRecoveryStats(days: number = 30) {
  const [stats, setStats] = useState<RecoveryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecoveryStats();
  }, [days]);

  const fetchRecoveryStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data: attempts } = await supabase
        .from('recovery_attempts')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('created_at', daysAgo);

      if (attempts && attempts.length > 0) {
        const totalRecoveries = attempts.filter(a => a.success).length;
        const successRate = (totalRecoveries / attempts.length) * 100;

        // Find most successful strategy
        const strategyStats = attempts.reduce((acc, attempt) => {
          if (!acc[attempt.strategy_used]) {
            acc[attempt.strategy_used] = { total: 0, success: 0 };
          }
          acc[attempt.strategy_used].total++;
          if (attempt.success) acc[attempt.strategy_used].success++;
          return acc;
        }, {} as Record<string, { total: number; success: number }>);

        const topStrategy = Object.entries(strategyStats)
          .sort(([, a], [, b]) => b.success - a.success)[0]?.[0] || 'none';

        // Platform breakdown
        const platformStats = attempts.reduce((acc, attempt) => {
          if (!acc[attempt.platform]) {
            acc[attempt.platform] = { total: 0, success: 0 };
          }
          acc[attempt.platform].total++;
          if (attempt.success) acc[attempt.platform].success++;
          return acc;
        }, {} as Record<string, { total: number; success: number }>);

        const platformBreakdown = Object.entries(platformStats).map(([platform, data]) => ({
          platform,
          attempts: data.total,
          successRate: (data.success / data.total) * 100,
        }));

        setStats({
          totalRecoveries,
          successRate,
          topStrategy,
          platformBreakdown,
        });
      }
    } catch (error) {
      console.error('Error fetching recovery stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchRecoveryStats };
}
