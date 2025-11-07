import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingEmailRequest {
  userId: string;
  emailType: 'welcome' | 'day7';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { userId, emailType }: OnboardingEmailRequest = await req.json();

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, name, handle')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.email) {
      throw new Error('User not found or no email');
    }

    let subject = '';
    let html = '';

    if (emailType === 'welcome') {
      subject = "🎉 Welcome to LinkPeek!";
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif; background-color: #fafafa; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
              .header { background: linear-gradient(135deg, #4753FF 0%, #7C3AED 100%); color: white; padding: 40px 32px; text-align: center; }
              .content { padding: 32px; }
              .cta-button { display: inline-block; background: #4753FF; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 24px; }
              .tip-box { background: #f8f9fa; border-left: 4px solid #4753FF; padding: 16px; margin: 24px 0; border-radius: 8px; }
              .footer { text-align: center; padding: 24px; color: #9CA3AF; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to LinkPeek!</h1>
                <p style="margin: 8px 0 0; opacity: 0.9;">You're all set up and ready to go</p>
              </div>
              
              <div class="content">
                <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">
                  Hey ${profile.name || 'there'} 👋
                </p>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Thanks for joining LinkPeek! We're excited to help you track and grow your audience.
                </p>

                <div class="tip-box">
                  <h3 style="margin: 0 0 8px; color: #111827; font-size: 16px;">💡 Quick Tips to Get Started:</h3>
                  <ul style="margin: 8px 0; padding-left: 20px; color: #6B7280;">
                    <li style="margin: 8px 0;">Add 3+ links to get the most out of analytics</li>
                    <li style="margin: 8px 0;">Share your profile link: linkpeek.app/${profile.handle}</li>
                    <li style="margin: 8px 0;">Check your dashboard daily to track growth</li>
                  </ul>
                </div>

                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Your unique profile: <strong>linkpeek.app/${profile.handle}</strong>
                </p>

                <div style="text-align: center;">
                  <a href="https://${supabaseUrl.replace('https://', '')}/dashboard" class="cta-button">
                    Go to Dashboard →
                  </a>
                </div>

                <p style="font-size: 14px; color: #6B7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                  Questions? Just reply to this email—we're here to help! 🚀
                </p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} LinkPeek. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else if (emailType === 'day7') {
      // Fetch user's stats
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: events } = await supabase
        .from('events')
        .select('event_type')
        .eq('user_id', userId)
        .eq('is_bot', false)
        .gte('created_at', sevenDaysAgo.toISOString());

      const views = events?.filter(e => e.event_type === 'view').length || 0;
      const clicks = events?.filter(e => e.event_type === 'click').length || 0;

      subject = "📊 How's your traffic looking?";
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif; background-color: #fafafa; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
              .header { background: linear-gradient(135deg, #4753FF 0%, #7C3AED 100%); color: white; padding: 40px 32px; text-align: center; }
              .content { padding: 32px; }
              .stat-box { background: #f8f9fa; border-radius: 12px; padding: 24px; text-align: center; margin: 16px 0; }
              .stat-value { font-size: 36px; font-weight: 700; color: #4753FF; }
              .cta-button { display: inline-block; background: #4753FF; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 24px; }
              .footer { text-align: center; padding: 24px; color: #9CA3AF; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Your Week So Far</h1>
                <p style="margin: 8px 0 0; opacity: 0.9;">Here's how your links are doing</p>
              </div>
              
              <div class="content">
                <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">
                  Hey ${profile.name || 'there'} 👋
                </p>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  It's been a week since you joined LinkPeek! Here's a quick snapshot of your activity:
                </p>

                <div class="stat-box">
                  <div class="stat-value">${views}</div>
                  <div style="font-size: 14px; color: #6B7280; margin-top: 4px;">Page Views</div>
                </div>

                <div class="stat-box">
                  <div class="stat-value">${clicks}</div>
                  <div style="font-size: 14px; color: #6B7280; margin-top: 4px;">Link Clicks</div>
                </div>

                ${views === 0 ? `
                  <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0; font-size: 14px; color: #92400E;">
                      💡 <strong>Tip:</strong> Share your LinkPeek profile on your social media to start tracking clicks!
                    </p>
                  </div>
                ` : `
                  <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                    Nice work! Keep sharing your profile to grow these numbers. 🚀
                  </p>
                `}

                <div style="text-align: center;">
                  <a href="https://${supabaseUrl.replace('https://', '')}/dashboard" class="cta-button">
                    View Full Dashboard →
                  </a>
                </div>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} LinkPeek. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    // Send email
    const { error: sendError } = await resend.emails.send({
      from: 'LinkPeek <hello@link-peek.org>',
      replyTo: 'support@link-peek.org',
      to: [profile.email],
      subject,
      html,
    });

    if (sendError) {
      // Log failed email attempt
      await supabase.from('email_log').insert({
        user_id: userId,
        email_type: emailType,
        success: false,
        error_message: sendError.message || 'Unknown error'
      });
      
      throw sendError;
    }

    // Log successful email send
    const { error: logError } = await supabase.from('email_log').insert({
      user_id: userId,
      email_type: emailType,
      success: true
    });

    if (logError) {
      console.error('Failed to log email send:', logError);
    }

    console.log(`✅ ${emailType} email sent successfully to ${profile.email}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error: any) {
    console.error('❌ Email send failed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
