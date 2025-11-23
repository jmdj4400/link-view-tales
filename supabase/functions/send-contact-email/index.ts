import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getResendClient, sendEmailWithRetry, validateEmail } from "../_shared/email-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 Contact email request received");
    const { name, email, category, subject, message }: ContactEmailRequest = await req.json();

    // Validate input
    if (!name || !email || !category || !subject || !message) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      console.error(`❌ Invalid email: ${emailValidation.error}`);
      return new Response(
        JSON.stringify({ error: emailValidation.error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = getResendClient();

    // Send confirmation email to user
    const confirmationResult = await sendEmailWithRetry(resend, {
      from: "LinkPeek Support <noreply@link-peek.org>",
      to: [email],
      subject: "We received your message - LinkPeek Support",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
              .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Thank You for Contacting Us!</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>We have received your message and our support team will get back to you as soon as possible.</p>
                
                <div class="message-box">
                  <p><strong>Your Message Details:</strong></p>
                  <p><strong>Category:</strong> ${category}</p>
                  <p><strong>Subject:</strong> ${subject}</p>
                  <p><strong>Message:</strong></p>
                  <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                  <li>Our team will review your message within 24 hours</li>
                  <li>You'll receive a response at ${email}</li>
                  <li>For urgent issues, we typically respond within 2-4 hours</li>
                </ul>
                
                <p>In the meantime, you might find helpful resources in our Help Center:</p>
                <a href="https://link-peek.org/help" class="button">Visit Help Center</a>
                
                <p>Best regards,<br><strong>The LinkPeek Support Team</strong></p>
                
                <div class="footer">
                  <p>This email was sent because you contacted LinkPeek support.</p>
                  <p>&copy; ${new Date().getFullYear()} LinkPeek. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (!confirmationResult.success) {
      console.error("❌ Failed to send confirmation email:", confirmationResult.error);
      return new Response(
        JSON.stringify({ error: "Failed to send confirmation email. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send notification email to support team
    const supportResult = await sendEmailWithRetry(resend, {
      from: "LinkPeek Contact Form <noreply@link-peek.org>",
      to: ["support@link-peek.org"],
      replyTo: email,
      subject: `[${category.toUpperCase()}] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .info-box { background: #f0f0f0; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .message-box { background: white; padding: 20px; border: 1px solid #ddd; margin: 20px 0; border-radius: 4px; }
              .label { font-weight: bold; color: #667eea; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>New Contact Form Submission</h2>
              
              <div class="info-box">
                <p><span class="label">From:</span> ${name} (${email})</p>
                <p><span class="label">Category:</span> ${category}</p>
                <p><span class="label">Subject:</span> ${subject}</p>
                <p><span class="label">Received:</span> ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="message-box">
                <h3>Message:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p><em>Reply directly to this email to respond to ${name}.</em></p>
            </div>
          </body>
        </html>
      `,
    });

    if (!supportResult.success) {
      console.warn("⚠️ Failed to send support notification, but user confirmation was sent");
    }

    console.log(`✅ Contact form processed successfully for ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Message sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
