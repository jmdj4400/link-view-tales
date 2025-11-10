import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, user has no subscription");
      return new Response(JSON.stringify({ 
        subscribed: false,
        product_id: null,
        subscription_end: null,
        status: null,
        trial_end_date: null,
        trial_days_remaining: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active or trialing subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all", // Get all statuses to check trial info
      limit: 10,
    });
    
    // Find active or trialing subscription
    const activeSubscription = subscriptions.data.find(
      (sub: Stripe.Subscription) => sub.status === "active" || sub.status === "trialing"
    );

    if (!activeSubscription) {
      logStep("No active subscription found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        product_id: null,
        subscription_end: null,
        status: null,
        trial_end_date: null,
        trial_days_remaining: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Extract subscription details
    const priceId = activeSubscription.items.data[0]?.price.id;
    const productId = activeSubscription.items.data[0]?.price.product as string;
    const subscriptionEnd = activeSubscription.current_period_end 
      ? new Date(activeSubscription.current_period_end * 1000).toISOString()
      : null;
    const status = activeSubscription.status;
    
    // Calculate trial info
    let trialEndDate: string | null = null;
    let trialDaysRemaining = 0;

    if (activeSubscription.trial_end && typeof activeSubscription.trial_end === 'number') {
      trialEndDate = new Date(activeSubscription.trial_end * 1000).toISOString();
      const now = Date.now();
      const trialEndMs = activeSubscription.trial_end * 1000;
      
      // Only calculate days remaining if trial hasn't ended
      if (trialEndMs > now) {
        const msRemaining = trialEndMs - now;
        trialDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
      }
      
      logStep("Trial info calculated", { 
        trialEndDate,
        trialDaysRemaining,
        status 
      });
    }

    logStep("Active subscription found", { 
      subscriptionId: activeSubscription.id, 
      status,
      productId,
      trialDaysRemaining,
      subscriptionEnd 
    });

    return new Response(JSON.stringify({
      subscribed: true,
      product_id: productId,
      subscription_end: subscriptionEnd,
      status,
      trial_end_date: trialEndDate,
      trial_days_remaining: trialDaysRemaining,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
