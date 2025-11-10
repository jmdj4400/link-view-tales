# Checkout Flow Test Checklist

## ✅ Configuration Verified
- ✅ Pro Plan: 39 DKK/month (price_1SOuubFmM9HF7Fk31nMk3kIe)
- ✅ Business Plan: 99 DKK/month (price_1SOuvFFmM9HF7Fk3KZ2I0CHV)
- ✅ Both configured as monthly recurring subscriptions
- ✅ 14-day trial configured in checkout session

---

## 🧪 Test Flow Steps

### 1. Sign Up & Access Billing Page
- [ ] Sign up with a new test account
- [ ] Navigate to `/billing` page
- [ ] Verify you see both Pro ($9) and Business ($29) plan cards

### 2. Test Checkout Session Creation
- [ ] Click "Upgrade to Pro" button
- [ ] Verify:
  - Button shows loading spinner
  - New tab opens with Stripe Checkout
  - Checkout URL starts with `checkout.stripe.com`
- [ ] Check edge function logs for:
  ```
  [CREATE-CHECKOUT] Function started
  [CREATE-CHECKOUT] User authenticated
  [CREATE-CHECKOUT] Checkout session created
  ```

### 3. Complete Test Payment
Use Stripe test cards:
- **Successful payment**: `4242 4242 4242 4242`
- **3D Secure**: `4000 0027 6000 3184`
- **Decline**: `4000 0000 0000 0002`

- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., 12/25)
- [ ] CVC: Any 3 digits (e.g., 123)
- [ ] Complete checkout
- [ ] Verify redirect to success page with `?success=true&trial=true`

### 4. Verify Webhook Processing
After completing checkout, check:
- [ ] Wait 5-10 seconds for webhook processing
- [ ] Check Stripe webhook logs in dashboard
- [ ] Verify webhook received these events:
  - `customer.subscription.created`
  - `customer.subscription.updated`

### 5. Check Subscription Status
- [ ] Click "Refresh Subscription" button on billing page
- [ ] Verify subscription status shows:
  - ✅ Subscribed: true
  - ✅ Product ID: prod_TLc8xSNHXDJoLm (for Pro)
  - ✅ Subscription end date (14 days from now)
- [ ] Check edge function logs:
  ```
  [CHECK-SUBSCRIPTION] Active subscription found
  [CHECK-SUBSCRIPTION] Determined subscription tier
  ```

### 6. Test Customer Portal
- [ ] Click "Manage Subscription" button
- [ ] Verify:
  - New tab opens with Stripe Customer Portal
  - Can see subscription details
  - Can update payment method
  - Can cancel subscription (don't actually cancel)

### 7. Test Plan Display
- [ ] Refresh billing page
- [ ] Verify:
  - Current plan card has green border
  - "Current Plan" badge displays at top
  - Button shows "Current Plan" (disabled)
  - Renewal date shows correctly

---

## 🐛 Common Issues & Solutions

### Issue: "No Stripe customer found"
**Solution**: User needs to complete at least one checkout first

### Issue: Webhook not received
**Solutions**:
1. Check webhook URL is correct in Stripe Dashboard
2. Verify webhook secret is correct
3. Check webhook is listening to correct events
4. Review Stripe webhook logs

### Issue: Subscription not showing after payment
**Solutions**:
1. Wait 10 seconds for webhook processing
2. Click "Refresh Subscription" button
3. Check webhook processed successfully
4. Check edge function logs

### Issue: "Checkout session creation failed"
**Solutions**:
1. Check STRIPE_SECRET_KEY is set
2. Verify price IDs match Stripe dashboard
3. Review create-checkout edge function logs

---

## 📊 Expected Edge Function Logs

### create-checkout success:
```
[CREATE-CHECKOUT] Function started
[CREATE-CHECKOUT] User authenticated - {"userId":"...","email":"..."}
[CREATE-CHECKOUT] Price ID received - {"priceId":"price_...","planName":"Pro"}
[CREATE-CHECKOUT] Stripe initialized
[CREATE-CHECKOUT] No existing customer, will create during checkout
[CREATE-CHECKOUT] Creating checkout session - {"priceId":"...","trialDays":14,"customerId":"new"}
[CREATE-CHECKOUT] Checkout session created - {"sessionId":"...","url":"..."}
```

### check-subscription success (after payment):
```
[CHECK-SUBSCRIPTION] Function started
[CHECK-SUBSCRIPTION] Stripe key verified
[CHECK-SUBSCRIPTION] User authenticated - {"userId":"...","email":"..."}
[CHECK-SUBSCRIPTION] Found Stripe customer - {"customerId":"..."}
[CHECK-SUBSCRIPTION] Active subscription found - {"subscriptionId":"...","endDate":"..."}
[CHECK-SUBSCRIPTION] Determined subscription tier - {"productId":"..."}
```

---

## 🎯 Success Criteria
- [ ] Checkout session opens in new tab
- [ ] Test payment completes successfully
- [ ] Redirects to success page with trial parameter
- [ ] Webhook processes subscription creation
- [ ] Subscription status updates correctly
- [ ] Current plan displays with visual indicators
- [ ] Customer portal accessible
- [ ] Edge function logs show no errors

---

## 🚀 Next Steps After Testing
Once all tests pass:
1. Test Business plan checkout
2. Test subscription cancellation flow
3. Test subscription upgrade/downgrade
4. Monitor webhook delivery for 24 hours
5. Set up trial expiration reminder emails (optional)
6. Go live! 🎉
