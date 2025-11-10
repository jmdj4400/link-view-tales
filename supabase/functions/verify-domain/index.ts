import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-DOMAIN] ${step}${detailsStr}`);
};

async function checkDNSRecords(domain: string, expectedIP: string, txtToken: string): Promise<{ verified: boolean; error?: string }> {
  try {
    // Check A record
    const aRecordResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const aRecordData = await aRecordResponse.json();
    
    const hasCorrectARecord = aRecordData.Answer?.some((record: any) => 
      record.type === 1 && record.data === expectedIP
    );

    if (!hasCorrectARecord) {
      return { verified: false, error: `A record not pointing to ${expectedIP}` };
    }

    // Check TXT record
    const txtDomain = `_lovable.${domain}`;
    const txtRecordResponse = await fetch(`https://dns.google/resolve?name=${txtDomain}&type=TXT`);
    const txtRecordData = await txtRecordResponse.json();
    
    const hasCorrectTxtRecord = txtRecordData.Answer?.some((record: any) =>
      record.type === 16 && record.data.includes(txtToken)
    );

    if (!hasCorrectTxtRecord) {
      return { verified: false, error: "TXT verification record not found" };
    }

    return { verified: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { verified: false, error: `DNS check failed: ${errorMessage}` };
  }
}

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

    const { domain_id } = await req.json();
    
    logStep("Request data", { domain_id });

    // Get domain record
    const { data: domainRecord, error: domainError } = await supabaseClient
      .from('custom_domains')
      .select('*')
      .eq('id', domain_id)
      .eq('user_id', userData.user.id)
      .single();

    if (domainError || !domainRecord) {
      throw new Error("Domain not found");
    }

    // Verify DNS records
    const verificationResult = await checkDNSRecords(
      domainRecord.domain,
      '185.158.133.1',
      domainRecord.verification_token
    );

    let updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (verificationResult.verified) {
      updateData.status = 'active';
      updateData.verified_at = new Date().toISOString();
      updateData.ssl_status = 'active';
      updateData.error_message = null;
      logStep("Domain verified successfully", { domain: domainRecord.domain });
    } else {
      updateData.status = 'failed';
      updateData.error_message = verificationResult.error;
      logStep("Domain verification failed", { domain: domainRecord.domain, error: verificationResult.error });
    }

    // Update domain status
    const { error: updateError } = await supabaseClient
      .from('custom_domains')
      .update(updateData)
      .eq('id', domain_id);

    if (updateError) {
      logStep("Failed to update domain", { error: updateError.message });
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        verified: verificationResult.verified,
        status: updateData.status,
        error: verificationResult.error
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