import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-API-KEY] ${step}${detailsStr}`);
};

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

    // Check if user has business plan
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('plan')
      .eq('id', userData.user.id)
      .single();

    if (profile?.plan !== 'business') {
      throw new Error("API access is only available on the Business plan");
    }

    const { name, rate_limit } = await req.json();
    
    logStep("Request data", { name, rate_limit });

    // Generate API key
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const randomArray = Array.from(randomBytes);
    const apiKey = `lbk_${base64Encode(new Uint8Array(randomArray).buffer).replace(/[+/=]/g, '').slice(0, 40)}`;
    const keyHash = await hashKey(apiKey);
    const keyPrefix = apiKey.slice(0, 12);

    // Store API key
    const { data: apiKeyRecord, error: insertError } = await supabaseClient
      .from('api_keys')
      .insert({
        user_id: userData.user.id,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        rate_limit: rate_limit || 1000,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      logStep("Failed to create API key", { error: insertError.message });
      throw insertError;
    }

    logStep("API key generated successfully", { key_prefix: keyPrefix });

    return new Response(
      JSON.stringify({ 
        success: true,
        api_key: apiKey,
        key_prefix: keyPrefix,
        key_id: apiKeyRecord.id,
        message: "Save this API key now. You won't be able to see it again."
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