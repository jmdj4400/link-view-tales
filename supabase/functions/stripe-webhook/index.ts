import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Helper function to send emails
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { error } = await resend.emails.send({
      from: "Linkbolt <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });
    
    if (error) {
      logStep("Failed to send email", { error: error.message, to, subject });
    } else {
      logStep("Email sent successfully", { to, subject });
    }
  } catch (error) {
    logStep("Error sending email", { error: error instanceof Error ? error.message : String(error), to, subject });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received", { method: req.method });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get the raw body and signature
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const body = await req.text();
    logStep("Received webhook body", { bodyLength: body.length });

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type, eventId: event.id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${errorMessage}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different webhook events
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionCreatedOrUpdated(event, supabaseClient, stripe);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event, supabaseClient, stripe);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event, supabaseClient, stripe);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event, supabaseClient, stripe);
        break;

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(
      JSON.stringify({ received: true, eventType: event.type }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handleSubscriptionCreatedOrUpdated(
  event: Stripe.Event,
  supabaseClient: any,
  stripe: Stripe
) {
  const subscription = event.data.object as Stripe.Subscription;
  
  logStep("Processing subscription created/updated", {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
  });

  // Get customer email
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (!customer || customer.deleted) {
    throw new Error("Customer not found or deleted");
  }

  const email = (customer as Stripe.Customer).email;
  if (!email) {
    throw new Error("Customer has no email");
  }

  logStep("Found customer email", { email });

  // Find user by email
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    logStep("User not found", { email, error: profileError?.message });
    throw new Error(`User not found for email: ${email}`);
  }

  logStep("Found user profile", { userId: profile.id });

  // Determine subscription status
  let status: string;
  switch (subscription.status) {
    case "active":
      status = "active";
      break;
    case "trialing":
      status = "trialing";
      break;
    case "past_due":
      status = "past_due";
      break;
    case "canceled":
    case "incomplete_expired":
      status = "canceled";
      break;
    default:
      status = "inactive";
  }

  // Get price ID from subscription items
  const priceId = subscription.items.data[0]?.price.id;
  logStep("Subscription price ID", { priceId });

  // Determine plan based on price (Pro vs Business)
  // Note: Update these price IDs with your actual Stripe price IDs
  let plan = 'pro'; // Default to pro
  if (priceId) {
    // You can add logic here to determine if it's business plan
    // For now, default to 'pro' - user should update this mapping
    plan = 'pro';
  }

  // Calculate trial end date if in trialing status
  let trialEndDate = null;
  let trialGranted = false;
  if (status === "trialing" && subscription.trial_end) {
    trialEndDate = new Date(subscription.trial_end * 1000).toISOString();
    trialGranted = true;
    logStep("Trial detected", { trialEndDate });
  }

  // Update or insert subscription
  const { error: upsertError } = await supabaseClient
    .from('subscriptions')
    .upsert({
      user_id: profile.id,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status,
      trial_granted: trialGranted,
      trial_end_date: trialEndDate,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (upsertError) {
    logStep("Failed to update subscription", { error: upsertError.message });
    throw upsertError;
  }

  // Update profile plan based on subscription status
  if (status === "active" || status === "trialing") {
    const { error: profileUpdateError } = await supabaseClient
      .from('profiles')
      .update({ plan })
      .eq('id', profile.id);

    if (profileUpdateError) {
      logStep("Failed to update profile plan", { error: profileUpdateError.message });
    }
  }

  logStep("Subscription updated successfully", { 
    userId: profile.id, 
    status,
    plan,
    trialGranted,
    trialEndDate,
    priceId,
    subscriptionId: subscription.id 
  });
}

async function handleSubscriptionDeleted(
  event: Stripe.Event,
  supabaseClient: any,
  stripe: Stripe
) {
  const subscription = event.data.object as Stripe.Subscription;
  
  logStep("Processing subscription deleted", {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
  });

  // Get customer email
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (!customer || customer.deleted) {
    throw new Error("Customer not found or deleted");
  }

  const email = (customer as Stripe.Customer).email;
  if (!email) {
    throw new Error("Customer has no email");
  }

  // Find user by email
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    logStep("User not found", { email, error: profileError?.message });
    throw new Error(`User not found for email: ${email}`);
  }

  // Update subscription to canceled and clear trial data
  const { error: updateError } = await supabaseClient
    .from('subscriptions')
    .update({
      status: 'canceled',
      trial_granted: false,
      trial_end_date: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', profile.id);

  if (updateError) {
    logStep("Failed to update subscription", { error: updateError.message });
    throw updateError;
  }

  // Update profile plan to free
  const { error: profileUpdateError } = await supabaseClient
    .from('profiles')
    .update({ plan: 'free' })
    .eq('id', profile.id);

  if (profileUpdateError) {
    logStep("Failed to update profile plan", { error: profileUpdateError.message });
  }

  logStep("Subscription deleted successfully", { 
    userId: profile.id,
    subscriptionId: subscription.id 
  });

  // Send cancellation email
  await sendEmail(
    email,
    "Your subscription has been canceled",
    `
      <h1>Subscription Canceled</h1>
      <p>Your subscription has been canceled. You will continue to have access until the end of your billing period.</p>
      <p>If you'd like to reactivate your subscription, simply visit your billing page and subscribe again.</p>
      <p>Thank you for using Linkbolt!</p>
    `
  );
}

async function handlePaymentSucceeded(
  event: Stripe.Event,
  supabaseClient: any,
  stripe: Stripe
) {
  const invoice = event.data.object as Stripe.Invoice;
  
  logStep("Processing payment succeeded", {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
  });

  // If there's a subscription, ensure it's marked as active
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (customer && !customer.deleted) {
      const email = (customer as Stripe.Customer).email;
      if (email) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (profile) {
          // Get price ID to determine plan
          const priceId = subscription.items.data[0]?.price.id;
          let plan = 'pro'; // Default to pro
          
          // Check if trial just ended (status changed from trialing to active)
          const isTrialEnding = subscription.status === 'active' && subscription.trial_end && 
                               (subscription.trial_end * 1000) < Date.now();

          await supabaseClient
            .from('subscriptions')
            .update({
              status: 'active',
              stripe_price_id: priceId,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              // Keep trial_granted true if it was set, but clear trial_end_date since trial is over
              trial_end_date: isTrialEnding ? null : undefined,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', profile.id);

          await supabaseClient
            .from('profiles')
            .update({ plan })
            .eq('id', profile.id);

          logStep("Payment succeeded - subscription activated", { 
            userId: profile.id, 
            priceId,
            isTrialEnding 
          });

          // Send trial ending email if trial just ended
          if (isTrialEnding && email) {
            await sendEmail(
              email,
              "Your trial has ended - Welcome to paid subscription!",
              `
                <h1>Welcome to Your Paid Subscription!</h1>
                <p>Your trial period has ended and your subscription is now active.</p>
                <p>Your payment method has been charged and you now have full access to all features.</p>
                <p>Thank you for choosing Linkbolt!</p>
              `
            );
          }
        }
      }
    }
  }
}

async function handlePaymentFailed(
  event: Stripe.Event,
  supabaseClient: any,
  stripe: Stripe
) {
  const invoice = event.data.object as Stripe.Invoice;
  
  logStep("Processing payment failed", {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
  });

  // If there's a subscription, mark it as past_due
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (customer && !customer.deleted) {
      const email = (customer as Stripe.Customer).email;
      if (email) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (profile) {
          await supabaseClient
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', profile.id);

          logStep("Payment failed - subscription marked past_due", { userId: profile.id });

          // Send payment failed email
          await sendEmail(
            email,
            "Payment Failed - Action Required",
            `
              <h1>Payment Failed</h1>
              <p>We were unable to process your payment for your Linkbolt subscription.</p>
              <p>Please update your payment method to avoid service interruption.</p>
              <p>You can manage your subscription and payment methods in your billing settings.</p>
              <p>If you need assistance, please contact our support team.</p>
            `
          );
        }
      }
    }
  }
}
