import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getResendClient, sendEmailWithRetry, validateEmail } from "../_shared/email-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TEAM-INVITATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    const { workspace_id, email, role } = await req.json();
    
    logStep("Request data", { workspace_id, email, role });

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      logStep("Invalid email", emailValidation.error);
      throw new Error(emailValidation.error);
    }

    const resend = getResendClient();

    // Generate invitation token
    const token_value = crypto.randomUUID();
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7); // 7 days expiry

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('workspace_invitations')
      .insert({
        workspace_id,
        email,
        role,
        invited_by: userData.user.id,
        token: token_value,
        expires_at: expires_at.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      logStep("Failed to create invitation", { error: inviteError.message });
      throw inviteError;
    }

    // Get workspace and inviter details
    const { data: workspace } = await supabaseClient
      .from('workspaces')
      .select('name')
      .eq('id', workspace_id)
      .single();

    const { data: inviter } = await supabaseClient
      .from('profiles')
      .select('name, email')
      .eq('id', userData.user.id)
      .single();

    const inviteLink = `${Deno.env.get("APP_URL")}/team/accept-invite?token=${token_value}`;

    // Send invitation email with retry
    const emailResult = await sendEmailWithRetry(resend, {
      from: "LinkPeek <hello@link-peek.org>",
      to: [email],
      subject: `You've been invited to join ${workspace?.name || 'a team'} on LinkPeek`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4753FF 0%, #7C3AED 100%); color: white; padding: 40px 32px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Team Invitation</h1>
          </div>
          
          <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              <strong>${inviter?.name || inviter?.email}</strong> has invited you to join <strong>${workspace?.name}</strong> as a <strong>${role}</strong>.
            </p>

            <div style="background: #f8f9fa; border-left: 4px solid #4753FF; padding: 20px; margin: 24px 0; border-radius: 8px;">
              <p style="margin: 0; color: #374151;">
                Accept this invitation to collaborate on links, analytics, and more!
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteLink}" 
                 style="display: inline-block; background: #4753FF; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Accept Invitation
              </a>
            </div>

            <p style="font-size: 14px; color: #6B7280; margin-top: 32px; line-height: 1.6;">
              This invitation will expire in 7 days. If you don't want to join this team, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (!emailResult.success) {
      logStep("Failed to send invitation email", emailResult.error);
      throw new Error(emailResult.error || "Failed to send invitation email");
    }

    logStep("Invitation sent successfully", { email, workspace_id });

    return new Response(
      JSON.stringify({ success: true, invitation }),
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