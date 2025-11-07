import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEEKLY-REPORT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate CRON_SECRET for security
    const authHeader = req.headers.get('authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      logStep("Unauthorized access attempt");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    logStep("Function started");

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all Pro+ users (subscribed or trial)
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('subscriptions')
      .select('user_id')
      .or('status.eq.active,status.eq.trialing');

    if (subsError) {
      throw new Error(`Failed to fetch subscriptions: ${subsError.message}`);
    }

    logStep("Found Pro+ users", { count: subscriptions?.length || 0 });

    let sentCount = 0;
    let errorCount = 0;

    for (const subscription of subscriptions || []) {
      try {
        // Get user profile
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('email, name')
          .eq('id', subscription.user_id)
          .single();

        if (profileError || !profile?.email) {
          logStep("No email for user", { userId: subscription.user_id });
          errorCount++;
          continue;
        }

        // Get last 7 days of events
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: events, error: eventsError } = await supabaseClient
          .from('events')
          .select('event_type, link_id')
          .eq('user_id', subscription.user_id)
          .eq('is_bot', false)
          .gte('created_at', sevenDaysAgo.toISOString());

        if (eventsError) {
          logStep("Error fetching events", { userId: subscription.user_id, error: eventsError.message });
          errorCount++;
          continue;
        }

        const viewCount = events?.filter(e => e.event_type === 'view').length || 0;
        const clickCount = events?.filter(e => e.event_type === 'click').length || 0;
        const ctr = viewCount > 0 ? ((clickCount / viewCount) * 100).toFixed(1) : '0.0';

        // Get top 3 links
        const linkClickMap = new Map<string, number>();
        events?.filter(e => e.event_type === 'click' && e.link_id).forEach(e => {
          linkClickMap.set(e.link_id, (linkClickMap.get(e.link_id) || 0) + 1);
        });

        const topLinkIds = Array.from(linkClickMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([linkId]) => linkId);

        let topLinksHtml = '';
        if (topLinkIds.length > 0) {
          const { data: links } = await supabaseClient
            .from('links')
            .select('title, dest_url')
            .in('id', topLinkIds);

          if (links) {
            topLinksHtml = links.map((link, idx) => {
              const clicks = linkClickMap.get(topLinkIds[idx]) || 0;
              return `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${idx + 1}. ${link.title}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${clicks} clicks</td>
                </tr>
              `;
            }).join('');
          }
        } else {
          topLinksHtml = '<tr><td colspan="2" style="padding: 12px; text-align: center; color: #6b7280;">No link clicks this week</td></tr>';
        }

        // Send email
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">📊 Your Weekly LinkPeek Report</h1>
              </div>
              
              <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px; margin-bottom: 24px;">Hi ${profile.name || 'there'}! 👋</p>
                
                <p style="font-size: 16px; margin-bottom: 32px;">Here's how your links performed over the last 7 days:</p>
                
                <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                    <div>
                      <div style="font-size: 32px; font-weight: bold; color: #667eea;">${clickCount}</div>
                      <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">Total Clicks</div>
                    </div>
                    <div>
                      <div style="font-size: 32px; font-weight: bold; color: #667eea;">${viewCount}</div>
                      <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">Page Views</div>
                    </div>
                    <div>
                      <div style="font-size: 32px; font-weight: bold; color: #667eea;">${ctr}%</div>
                      <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">CTR</div>
                    </div>
                  </div>
                </div>
                
                <h2 style="font-size: 20px; margin-bottom: 16px; color: #1f2937;">🏆 Top Performing Links</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                  <thead>
                    <tr style="background: #f9fafb;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Link</th>
                      <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topLinksHtml}
                  </tbody>
                </table>
                
                <div style="text-align: center; margin-top: 32px;">
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('//', '//app.')}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">View Full Dashboard</a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                  Keep up the great work! 🚀<br>
                  – The LinkPeek Team
                </p>
              </div>
            </body>
          </html>
        `;

        const { error: sendError } = await resend.emails.send({
          from: 'LinkPeek <weekly@link-peek.org>',
          replyTo: 'support@link-peek.org',
          to: [profile.email],
          subject: `📊 Your LinkPeek Weekly Report - ${clickCount} clicks this week!`,
          html: emailHtml,
        });

        if (sendError) {
          logStep("Error sending email", { userId: subscription.user_id, error: sendError });
          errorCount++;
        } else {
          sentCount++;
          logStep("Email sent successfully", { userId: subscription.user_id, email: profile.email });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logStep("Error processing user", { userId: subscription.user_id, error: errorMessage });
        errorCount++;
      }
    }

    logStep("Weekly reports complete", { sent: sentCount, errors: errorCount });

    return new Response(JSON.stringify({ 
      success: true,
      sent: sentCount,
      errors: errorCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
