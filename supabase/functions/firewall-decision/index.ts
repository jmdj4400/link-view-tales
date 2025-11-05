import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FirewallRequest {
  linkId: string;
  userAgent: string;
  platform: string;
  country?: string;
  userId: string;
}

interface FirewallDecision {
  useFallback: boolean;
  strategy: string | null;
  riskScore: number;
  reason: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { linkId, userAgent, platform, country, userId }: FirewallRequest = await req.json();

    console.log('Firewall decision requested:', { linkId, platform, country });

    // Check if firewall is enabled for this user
    const { data: profile } = await supabase
      .from('profiles')
      .select('firewall_enabled, plan')
      .eq('id', userId)
      .single();

    if (!profile?.firewall_enabled || profile.plan === 'free') {
      return new Response(
        JSON.stringify({
          useFallback: false,
          strategy: null,
          riskScore: 0,
          reason: 'firewall_disabled',
        } as FirewallDecision),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate risk score using database function
    const { data: riskData, error: riskError } = await supabase.rpc('calculate_redirect_risk', {
      p_platform: platform,
      p_user_agent: userAgent,
      p_country: country || null,
    });

    if (riskError) {
      console.error('Risk calculation error:', riskError);
      throw riskError;
    }

    const riskScore = riskData || 0;
    console.log('Calculated risk score:', riskScore);

    // Decision thresholds
    const HIGH_RISK_THRESHOLD = 70;
    const MEDIUM_RISK_THRESHOLD = 40;

    let useFallback = false;
    let strategy = null;
    let reason = 'low_risk';

    if (riskScore >= HIGH_RISK_THRESHOLD) {
      useFallback = true;
      strategy = 'webview-safe';
      reason = 'high_risk_detected';
    } else if (riskScore >= MEDIUM_RISK_THRESHOLD && platform === 'instagram') {
      // Instagram-specific: medium risk still uses fallback
      useFallback = true;
      strategy = 'webview-recovery';
      reason = 'medium_risk_instagram';
    }

    const decision: FirewallDecision = {
      useFallback,
      strategy,
      riskScore,
      reason,
    };

    console.log('Firewall decision:', decision);

    return new Response(JSON.stringify(decision), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Firewall decision error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        useFallback: false, // Fail open - don't block on error
        strategy: null,
        riskScore: 0,
        reason: 'error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
