import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: WaitlistEmailRequest = await req.json();

    console.log("Sending waitlist confirmation to:", email);

    const emailResponse = await resend.emails.send({
      from: "LinkPeek <hello@link-peek.org>",
      replyTo: "support@link-peek.org",
      to: [email],
      subject: "You're on the list! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #38bdf8 0%, #a855f7 100%);
                padding: 40px 20px;
                text-align: center;
                border-radius: 12px 12px 0 0;
              }
              .header h1 {
                color: white;
                margin: 0;
                font-size: 32px;
                font-weight: bold;
              }
              .content {
                background: #ffffff;
                padding: 40px;
                border-radius: 0 0 12px 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .highlight {
                background: linear-gradient(135deg, #38bdf8 0%, #a855f7 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 600;
              }
              .feature {
                margin: 20px 0;
                padding: 15px;
                background: #f8fafc;
                border-left: 4px solid #38bdf8;
                border-radius: 4px;
              }
              .cta {
                text-align: center;
                margin: 30px 0;
              }
              .cta a {
                display: inline-block;
                background: linear-gradient(135deg, #38bdf8 0%, #a855f7 100%);
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 Welcome to LinkPeek!</h1>
            </div>
            <div class="content">
              <p>Hey there!</p>
              
              <p>We're thrilled to have you on our exclusive waitlist. You're officially part of something special – <span class="highlight">the future of link management</span> is coming, and you'll be among the first to experience it.</p>
              
              <h2 style="color: #1e293b; margin-top: 30px;">What's Coming?</h2>
              
              <div class="feature">
                <strong>⚡ Smart Links</strong><br>
                Intelligent routing and tracking that adapts to your audience
              </div>
              
              <div class="feature">
                <strong>📊 Real-time Analytics</strong><br>
                Instant insights into your link performance and audience behavior
              </div>
              
              <div class="feature">
                <strong>✨ Beautiful Design</strong><br>
                Stunning, customizable profiles that make your links stand out
              </div>
              
              <p style="margin-top: 30px;">We'll notify you the moment we launch. In the meantime, follow our journey on social media to get sneak peeks and exclusive updates!</p>
              
              <div class="cta">
                <a href="https://link-peek.org" target="_blank">Visit Our Website</a>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                Questions? Just reply to this email – we'd love to hear from you!
              </p>
            </div>
            
            <div class="footer">
              <p>© 2025 LinkPeek. Something amazing is on the way.</p>
              <p>You received this email because you signed up for early access at link-peek.org</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Waitlist confirmation sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending waitlist confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
