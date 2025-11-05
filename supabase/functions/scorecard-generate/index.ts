import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScorecardData {
  period: string;
  stats: {
    totalClicks: number;
    totalPageViews: number;
    conversionRate: number;
    flowIntegrity: number;
    redirectSuccess: number;
    avgSessionDuration: number;
    avgCTR: number;
  };
  topChannels?: Array<{ referrer: string; clicks: number }>;
  generated: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request parameters or default to current month
    const { userId, periodStart, periodEnd } = await req.json().catch(() => ({}));

    // If no user specified, generate for all active users
    const usersToProcess = userId 
      ? [userId]
      : await getAllActiveUsers(supabase);

    console.log(`Generating scorecards for ${usersToProcess.length} users`);

    const results = [];

    for (const uid of usersToProcess) {
      try {
        const scorecard = await generateScorecardForUser(
          supabase,
          uid,
          periodStart,
          periodEnd
        );
        results.push({ userId: uid, success: true });
      } catch (error) {
        console.error(`Failed to generate scorecard for user ${uid}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ userId: uid, success: false, error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Scorecard generation complete',
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scorecard generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function getAllActiveUsers(supabase: any): Promise<string[]> {
  // Get users who have had activity in the last 30 days
  const { data, error } = await supabase
    .from('metrics_daily')
    .select('user_id')
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .not('user_id', 'is', null);

  if (error) throw error;

  // Return unique user IDs
  const userIds = [...new Set(data.map((d: any) => d.user_id as string))];
  return userIds.filter((id): id is string => typeof id === 'string');
}

async function generateScorecardForUser(
  supabase: any,
  userId: string,
  customPeriodStart?: string,
  customPeriodEnd?: string
): Promise<void> {
  // Default to last complete month
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodStart = customPeriodStart || lastMonth.toISOString().split('T')[0];
  const periodEnd = customPeriodEnd || new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  console.log(`Generating scorecard for user ${userId} (${periodStart} to ${periodEnd})`);

  // Use database function to get scorecard data
  const { data: scorecardData, error: dataError } = await supabase.rpc('get_user_scorecard_data', {
    p_user_id: userId,
    p_period_start: periodStart,
    p_period_end: periodEnd,
  });

  if (dataError) throw dataError;

  // Add generation timestamp
  const fullData: ScorecardData = {
    ...scorecardData,
    generated: new Date().toISOString(),
  };

  // Generate signature (HMAC-SHA256)
  const signature = await generateSignature(fullData);

  // Upsert scorecard
  const { error: upsertError } = await supabase
    .from('scorecards')
    .upsert({
      user_id: userId,
      period_start: periodStart,
      period_end: periodEnd,
      data: fullData,
      signature,
    }, {
      onConflict: 'user_id,period_start,period_end',
    });

  if (upsertError) throw upsertError;

  console.log(`Scorecard generated successfully for user ${userId}`);
}

async function generateSignature(data: ScorecardData): Promise<string> {
  const message = JSON.stringify(data);
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
