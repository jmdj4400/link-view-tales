import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  article_id: string;
  article_title: string;
  article_slug: string;
  author_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { article_id, article_title, article_slug, author_name }: NotificationRequest = await req.json();

    console.log("Sending notifications for article:", article_title);

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all registered users with emails
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .not("email", "is", null);

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      console.log("No users to notify");
      return new Response(
        JSON.stringify({ message: "No users to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const articleUrl = `https://link-peek.org/blog/${article_slug}`;

    // Send emails to all users
    const emailPromises = profiles.map(async (profile) => {
      try {
        await resend.emails.send({
          from: "LinkPeek <onboarding@resend.dev>",
          to: [profile.email],
          subject: `📝 New Article Published: ${article_title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #00d4ff 0%, #ff00ea 100%);
                  padding: 40px 20px;
                  text-align: center;
                  border-radius: 12px 12px 0 0;
                }
                .header h1 {
                  color: white;
                  margin: 0;
                  font-size: 28px;
                  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                }
                .content {
                  background: #ffffff;
                  padding: 40px 30px;
                  border: 1px solid #e5e5e5;
                }
                .article-title {
                  font-size: 24px;
                  font-weight: bold;
                  color: #1a1a1a;
                  margin: 20px 0 10px 0;
                }
                .author {
                  color: #666;
                  font-size: 14px;
                  margin-bottom: 20px;
                }
                .cta-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #00d4ff 0%, #ff00ea 100%);
                  color: white;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  margin: 20px 0;
                  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
                }
                .footer {
                  text-align: center;
                  padding: 20px;
                  color: #999;
                  font-size: 12px;
                  border-top: 1px solid #e5e5e5;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🚀 New Article Published!</h1>
              </div>
              <div class="content">
                <p>Hey there!</p>
                <p>We just published a new article that you might find interesting:</p>
                <div class="article-title">${article_title}</div>
                <div class="author">By ${author_name}</div>
                <a href="${articleUrl}" class="cta-button">Read Article →</a>
                <p>Check it out and let us know what you think!</p>
              </div>
              <div class="footer">
                <p>© 2024 LinkPeek - Your data-driven link management platform</p>
                <p><a href="https://link-peek.org" style="color: #00d4ff;">Visit LinkPeek</a></p>
              </div>
            </body>
            </html>
          `,
        });
        console.log(`Email sent to ${profile.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${profile.email}:`, error);
      }
    });

    await Promise.all(emailPromises);

    console.log(`Sent ${profiles.length} email notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${profiles.length} users` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error in notify-article-published:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
