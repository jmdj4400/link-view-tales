import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  userId: string;
  period: 'weekly' | 'monthly';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, period } = await req.json() as ReportRequest;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User not found');
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (period === 'weekly') {
      startDate.setDate(endDate.getDate() - 7);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    // Fetch analytics data
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (eventsError) {
      throw eventsError;
    }

    // Calculate metrics
    const views = events?.filter(e => e.event_type === 'view').length || 0;
    const clicks = events?.filter(e => e.event_type === 'click').length || 0;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0';

    // Get top links
    const linkClicks = events?.filter(e => e.event_type === 'click' && e.link_id) || [];
    const linkStats = linkClicks.reduce((acc: any, event) => {
      const linkId = event.link_id!;
      acc[linkId] = (acc[linkId] || 0) + 1;
      return acc;
    }, {});

    const topLinkIds = Object.entries(linkStats)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([id]) => id);

    const { data: topLinks } = await supabase
      .from('links')
      .select('title, destination_url')
      .in('id', topLinkIds);

    const topLinksHtml = topLinks?.map((link, i) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${link.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${linkStats[topLinkIds[i]]}</td>
      </tr>
    `).join('') || '<tr><td colspan="3" style="padding: 8px; text-align: center;">No data</td></tr>';

    // Send email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #6366f1, #8b5cf6); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Your ${period === 'weekly' ? 'Weekly' : 'Monthly'} Report</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 24px;">Hi ${profile.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 24px;">Here's your LinkPeek performance summary for the past ${period === 'weekly' ? 'week' : 'month'}:</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center;">
                <div>
                  <div style="font-size: 32px; font-weight: bold; color: #6366f1;">${views}</div>
                  <div style="color: #6b7280; font-size: 14px;">Profile Views</div>
                </div>
                <div>
                  <div style="font-size: 32px; font-weight: bold; color: #8b5cf6;">${clicks}</div>
                  <div style="color: #6b7280; font-size: 14px;">Link Clicks</div>
                </div>
                <div>
                  <div style="font-size: 32px; font-weight: bold; color: #10b981;">${ctr}%</div>
                  <div style="color: #6b7280; font-size: 14px;">CTR</div>
                </div>
              </div>
            </div>
            
            <h2 style="font-size: 18px; margin-bottom: 16px; color: #111827;">Top Performing Links</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">#</th>
                  <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Link</th>
                  <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Clicks</th>
                </tr>
              </thead>
              <tbody>
                ${topLinksHtml}
              </tbody>
            </table>
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="${supabaseUrl.replace('https://ppfudytrnjfyngrebhxo.supabase.co', window.location.origin)}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                View Full Dashboard
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              You're receiving this email because you enabled ${period} analytics reports in your LinkPeek settings.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "LinkPeek <noreply@linkpeek.com>",
        to: [profile.email],
        subject: `Your ${period === 'weekly' ? 'Weekly' : 'Monthly'} LinkPeek Report`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error sending report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});