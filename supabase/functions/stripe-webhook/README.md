# Stripe Webhook Setup Guide

## Overview
This webhook endpoint handles real-time Stripe subscription events and automatically updates your database. No more polling delays!

## Webhook Endpoint URL
```
https://ppfudytrnjfyngrebhxo.supabase.co/functions/v1/stripe-webhook
```

## Handled Events
The webhook processes these Stripe events:

1. **customer.subscription.created** - New subscription created
2. **customer.subscription.updated** - Subscription modified (plan change, status change)
3. **customer.subscription.deleted** - Subscription canceled
4. **invoice.payment_succeeded** - Payment successful (activates subscription)
5. **invoice.payment_failed** - Payment failed (marks subscription as past_due)

## Setup Instructions

### 1. Get Your Webhook Signing Secret

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter the endpoint URL:
   ```
   https://ppfudytrnjfyngrebhxo.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Click **"Add endpoint"**
6. Click **"Reveal"** next to "Signing secret" 
7. Copy the secret (starts with `whsec_...`)

### 2. Add Webhook Secret to Lovable

The webhook secret has already been added to your environment variables as `STRIPE_WEBHOOK_SECRET`.

### 3. Test the Webhook

#### Option A: Use Stripe CLI (Recommended for Development)
```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local development
stripe listen --forward-to https://ppfudytrnjfyngrebhxo.supabase.co/functions/v1/stripe-webhook

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

#### Option B: Use Stripe Dashboard
1. Go to your webhook endpoint in Stripe Dashboard
2. Click **"Send test webhook"**
3. Select an event type
4. Click **"Send test webhook"**

## What Gets Updated

### Subscriptions Table
- `stripe_customer_id` - Stripe customer ID
- `stripe_subscription_id` - Stripe subscription ID
- `status` - One of: `active`, `trialing`, `past_due`, `canceled`, `inactive`
- `current_period_end` - Subscription end date
- `updated_at` - Timestamp of last update

### Profiles Table
- `plan` - Updated to `pro` when subscription is active/trialing
- `plan` - Updated to `free` when subscription is canceled

## Status Mapping

| Stripe Status | Database Status | Plan |
|--------------|-----------------|------|
| `active` | `active` | `pro` |
| `trialing` | `trialing` | `pro` |
| `past_due` | `past_due` | `pro` |
| `canceled` | `canceled` | `free` |
| `incomplete_expired` | `canceled` | `free` |
| Other | `inactive` | `free` |

## Troubleshooting

### Check Webhook Logs
1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. View the "Events & logs" tab
4. Check for failed deliveries (red X)

### Check Edge Function Logs
View logs in your Lovable Cloud dashboard to see detailed webhook processing logs.

### Common Issues

#### 1. Signature Verification Failed
- **Cause**: Incorrect webhook secret
- **Fix**: Double-check `STRIPE_WEBHOOK_SECRET` matches the secret in Stripe Dashboard

#### 2. User Not Found
- **Cause**: Customer email doesn't match any user in your database
- **Fix**: Ensure users sign up with the same email they use in Stripe

#### 3. No Events Received
- **Cause**: Webhook URL incorrect or not saved
- **Fix**: Verify webhook endpoint URL in Stripe Dashboard

## Security Features

✅ **Signature Verification** - Every webhook is verified using Stripe's signature  
✅ **No JWT Required** - Webhook is public but secured by signature  
✅ **Detailed Logging** - All webhook events are logged for debugging  
✅ **Error Handling** - Failed webhooks return proper error codes to Stripe for retry  

## Testing Checklist

- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] All 5 events selected
- [ ] Webhook secret added to environment variables
- [ ] Test `customer.subscription.created` event
- [ ] Test `customer.subscription.updated` event
- [ ] Test `customer.subscription.deleted` event
- [ ] Test `invoice.payment_succeeded` event
- [ ] Test `invoice.payment_failed` event
- [ ] Verify database updates correctly
- [ ] Check user plan changes from `free` to `pro` and back

## Benefits Over Polling

| Polling (check-subscription) | Webhooks |
|------------------------------|----------|
| ⏱️ 5-minute delay | ⚡ Instant updates |
| 🔄 Runs every 5 minutes | 🎯 Runs only when needed |
| 💰 API calls every 5 min | 💰 Only when events occur |
| 📊 More Stripe API usage | 📊 Minimal API usage |

## Next Steps

1. ✅ Webhook endpoint created
2. ✅ Webhook secret configured
3. 🔜 Set up webhook in Stripe Dashboard
4. 🔜 Test with live events
5. 🔜 Monitor webhook logs
6. 🔜 Consider removing frequent `check-subscription` polling (optional)

---

**Note**: Keep `check-subscription` edge function as a backup for manual refresh, but with webhooks, automatic updates happen instantly!
