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
        trial_active: false,
        trial_days_remaining: 0,
        subscription_end: null,
        price_id: null 
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
        trial_active: false,
        trial_days_remaining: 0,
        subscription_end: null,
        price_id: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Extract subscription details
    const priceId = activeSubscription.items.data[0]?.price.id;
    const subscriptionEnd = new Date(activeSubscription.current_period_end * 1000).toISOString();
    const isTrialing = activeSubscription.status === "trialing";
    
    // Calculate trial info
    let trialActive = false;
    let trialDaysRemaining = 0;
    let trialEndDate = null;

    if (isTrialing && activeSubscription.trial_end) {
      trialActive = true;
      trialEndDate = new Date(activeSubscription.trial_end * 1000).toISOString();
      const now = Date.now();
      const trialEndMs = activeSubscription.trial_end * 1000;
      const msRemaining = Math.max(0, trialEndMs - now);
      trialDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
      
      logStep("Trial subscription found", { 
        trialEndDate,
        trialDaysRemaining 
      });
    } else if (activeSubscription.status === "active") {
      // Check if user ever had a trial (trial_end exists but trial is over)
      if (activeSubscription.trial_end && activeSubscription.trial_end * 1000 < Date.now()) {
        trialActive = false;
        trialDaysRemaining = 0;
        logStep("Trial ended, now on paid subscription", {
          trialEndedAt: new Date(activeSubscription.trial_end * 1000).toISOString()
        });
      }
    }

    logStep("Active subscription found", { 
      subscriptionId: activeSubscription.id, 
      status: activeSubscription.status,
      priceId,
      trialActive,
      trialDaysRemaining,
      subscriptionEnd 
    });

    return new Response(JSON.stringify({
      subscribed: true,
      price_id: priceId,
      subscription_status: activeSubscription.status,
      subscription_end: subscriptionEnd,
      trial_active: trialActive,
      trial_days_remaining: trialDaysRemaining,
      trial_end_date: trialEndDate,
      cancel_at_period_end: activeSubscription.cancel_at_period_end,
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
