import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRIAL-REMINDERS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting trial reminder check");

    // Verify cron secret for security
    const cronSecret = req.headers.get("authorization")?.replace("Bearer ", "");
    const expectedSecret = Deno.env.get("CRON_SECRET");
    
    if (cronSecret !== expectedSecret) {
      logStep("Unauthorized request - invalid cron secret");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calculate the date 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);
    
    const fourDaysFromNow = new Date(threeDaysFromNow);
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 1);

    logStep("Searching for trials ending in 3 days", {
      startDate: threeDaysFromNow.toISOString(),
      endDate: fourDaysFromNow.toISOString(),
    });

    // Find subscriptions with trials ending in exactly 3 days
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('subscriptions')
      .select('user_id, trial_end_date, stripe_price_id')
      .eq('status', 'trialing')
      .gte('trial_end_date', threeDaysFromNow.toISOString())
      .lt('trial_end_date', fourDaysFromNow.toISOString())
      .not('trial_end_date', 'is', null);

    if (subsError) {
      logStep("Error fetching subscriptions", { error: subsError.message });
      throw subsError;
    }

    logStep("Found subscriptions expiring soon", { count: subscriptions?.length || 0 });

    if (!subscriptions || subscriptions.length === 0) {
      logStep("No trials expiring in 3 days");
      return new Response(
        JSON.stringify({ message: "No trials expiring in 3 days", count: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let emailsSent = 0;
    let emailsFailed = 0;

    // Send reminder email to each user
    for (const subscription of subscriptions) {
      try {
        // Get user profile
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('email, name')
          .eq('id', subscription.user_id)
          .single();

        if (profileError || !profile?.email) {
          logStep("User profile not found", { userId: subscription.user_id });
          emailsFailed++;
          continue;
        }

        // Determine plan name (Pro or Business)
        const planName = subscription.stripe_price_id?.includes('business') ? 'Business' : 'Pro';
        
        const trialEndDate = new Date(subscription.trial_end_date);
        const formattedDate = trialEndDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send reminder email
        const { error: emailError } = await resend.emails.send({
          from: "LinkPeek <hello@link-peek.org>",
          replyTo: "support@link-peek.org",
          to: [profile.email],
          subject: "Your trial ends in 3 days ⏰",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #4753FF 0%, #7C3AED 100%); color: white; padding: 40px 32px; text-align: center; border-radius: 16px 16px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">⏰ Your ${planName} Trial Ends Soon</h1>
              </div>
              
              <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <p style="margin: 0 0 24px; font-size: 16px; color: #374151; line-height: 1.6;">
                  Hi ${profile.name || 'there'},
                </p>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Just a friendly reminder that your LinkPeek ${planName} trial will end on <strong>${formattedDate}</strong> (in 3 days).
                </p>
                
                <div style="background: #f8f9fa; border-left: 4px solid #4753FF; padding: 16px; margin: 24px 0; border-radius: 8px;">
                  <h3 style="margin: 0 0 8px; color: #111827;">What happens next?</h3>
                  <ul style="margin: 8px 0; padding-left: 20px; color: #6B7280;">
                    <li>Your payment method will be charged automatically</li>
                    <li>You'll continue to have full access to all ${planName} features</li>
                    <li>No action needed - everything continues seamlessly</li>
                  </ul>
                </div>

                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  If you want to make any changes to your subscription, you can do so in your billing settings.
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${Deno.env.get("APP_URL")}/billing" 
                     style="display: inline-block; background: #4753FF; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600;">
                    Manage Subscription
                  </a>
                </div>

                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Thank you for choosing LinkPeek! We're excited to continue helping you grow your audience.
                </p>
                
                <p style="font-size: 14px; color: #6B7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                  Questions? Just reply to this email - we're here to help!
                </p>
              </div>
            </div>
          `,
        });

        if (emailError) {
          logStep("Failed to send email", { 
            email: profile.email, 
            error: emailError.message 
          });
          emailsFailed++;
        } else {
          logStep("Email sent successfully", { email: profile.email });
          emailsSent++;

          // Log email send
          await supabaseClient.from('email_log').insert({
            user_id: subscription.user_id,
            email_type: 'trial_reminder',
            success: true,
          });
        }
      } catch (error) {
        logStep("Error processing subscription", { 
          userId: subscription.user_id,
          error: error instanceof Error ? error.message : String(error)
        });
        emailsFailed++;
      }
    }

    logStep("Trial reminder job completed", { 
      total: subscriptions.length,
      sent: emailsSent,
      failed: emailsFailed 
    });

    return new Response(
      JSON.stringify({
        message: "Trial reminder emails sent",
        total: subscriptions.length,
        sent: emailsSent,
        failed: emailsFailed,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});