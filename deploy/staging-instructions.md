# LinkPeek Staging Deployment Instructions

## Pre-Deployment Checklist

- [ ] All tests pass locally (`npm test`)
- [ ] Edge functions build successfully
- [ ] Rate limit tests pass (`./tests/rate-limit-test.sh`)
- [ ] Redirect canary tests pass (`./tests/redirect-canary.sh`)
- [ ] Email tests pass (`./tests/email-tests.sh`)
- [ ] Health check endpoint responds (`curl /functions/v1/health`)
- [ ] Backup current production data (if applicable)

## Deployment Steps

### 1. Deploy Edge Functions

```bash
# Deploy all edge functions to staging
supabase functions deploy fast-redirect --project-ref <staging-project-id>
supabase functions deploy health --project-ref <staging-project-id>

# Verify deployment
curl https://<staging-project-id>.supabase.co/functions/v1/health
```

### 2. Deploy Static Error Page

```bash
# Upload link-error.html to storage bucket or hosting
# Ensure it's accessible at /link-error.html
# Verify with: curl https://your-staging-domain.com/link-error.html
```

### 3. Update Environment Variables

Verify these are set in Supabase dashboard:

```
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
RESEND_API_KEY=<resend-key>
```

### 4. Run Canary Tests

```bash
# Test with canary header (non-production traffic)
export STAGING_URL="https://<project-id>.supabase.co/functions/v1/fast-redirect"
export TEST_LINK_ID="<existing-staging-link-id>"

# Run canary test
./tests/redirect-canary.sh $STAGING_URL $TEST_LINK_ID 100

# Should see:
# ✅ PASS: All canary requests succeeded under threshold
```

### 5. Test Rate Limiting

```bash
# Test rate limiting
./tests/rate-limit-test.sh $STAGING_URL $TEST_LINK_ID

# Should see:
# ✅ PASS: Rate limiting is working
# Rate limiting triggered after ~100 requests
```

### 6. Test Email Reliability

```bash
# Test email sending (use staging email address)
export EMAIL_FUNCTION="https://<project-id>.supabase.co/functions/v1/send-contact-email"
./tests/email-tests.sh $EMAIL_FUNCTION

# Verify test email is received
```

### 7. Smoke Test Critical Flows

```bash
# Test redirect flow
curl -X POST $STAGING_URL \
  -H "Content-Type: application/json" \
  -H "x-linkpeek-redirect: canary" \
  -d '{"linkId":"'$TEST_LINK_ID'","userAgent":"test","country":"US"}'

# Should return: {"url":"https://destination-url.com"}
```

### 8. Monitor Logs

```bash
# Watch edge function logs in real-time
supabase functions logs fast-redirect --project-ref <staging-project-id>

# Look for structured JSON logs:
# - redirect_success events
# - totalTimeMs < 100ms
# - No errors or rate_limit_exceeded (unless testing)
```

### 9. Health Check Verification

```bash
# Check system health
curl https://<project-id>.supabase.co/functions/v1/health | jq '.'

# Should return:
# {
#   "status": "healthy",
#   "checks": {
#     "database": { "status": "healthy", "latencyMs": < 100 },
#     "redirectLatency": { "status": "healthy", "p95Ms": < 300 },
#     "emailProvider": { "status": "healthy" }
#   }
# }
```

## Production Deployment

**⚠️ IMPORTANT: Only deploy to production after staging validation**

### Production Deployment Steps

1. **Schedule maintenance window** (if needed for database changes)
2. **Deploy edge functions:**
   ```bash
   supabase functions deploy fast-redirect --project-ref <prod-project-id>
   supabase functions deploy health --project-ref <prod-project-id>
   ```
3. **Deploy static assets** (link-error.html)
4. **Verify health check:** `curl https://your-domain.com/functions/v1/health`
5. **Run canary tests** with production endpoint
6. **Monitor logs** for first 15 minutes
7. **Check metrics** in observability dashboard

### Gradual Rollout (Recommended)

Use canary header to test production with small traffic:

```bash
# Send 1% of traffic with canary header
# Monitor for errors before full rollout
# Gradually increase to 10%, 50%, 100%
```

## Rollback Procedures

### If issues are detected:

**Immediate Rollback (< 5 minutes):**

```bash
# Revert to previous edge function version
supabase functions deploy fast-redirect --version <previous-version> --project-ref <project-id>

# Verify health
curl https://<project-id>.supabase.co/functions/v1/health
```

**Disable New Features (< 2 minutes):**

```bash
# Temporarily disable rate limiting by setting high limits
# Edit fast-redirect function, increase RATE_LIMITS values
# Redeploy immediately
```

**Database Rollback (if migrations were run):**

```sql
-- Revert recent migrations if needed
-- (Backup should be taken before deployment)
```

### Rollback Triggers

Roll back immediately if:
- Health check returns `unhealthy` status
- Redirect success rate drops below 95%
- P95 latency exceeds 300ms for > 5 minutes
- Critical errors in logs (> 1% error rate)
- Rate limiting false positives (> 5% of traffic)

## Post-Deployment Verification

**Check these metrics for 1 hour after deployment:**

- [ ] Redirect success rate > 99%
- [ ] P95 latency < 100ms
- [ ] No increase in error logs
- [ ] Rate limiting functioning correctly
- [ ] Email delivery > 95% success
- [ ] Health check returns "healthy"
- [ ] No customer complaints

## Monitoring Setup

**Set up these monitors before deploying to production:**

1. **UptimeRobot** or **Better Uptime**:
   - Monitor `/health` endpoint every 5 minutes
   - Alert if status != "healthy" for > 2 checks

2. **Slack webhook** for critical alerts:
   - Redirect P95 > 300ms
   - Success rate < 95%
   - Database unhealthy

3. **Weekly metrics review**:
   - Review redirect performance
   - Check rate limit patterns
   - Analyze email delivery stats

## Troubleshooting

### High Latency After Deployment

```bash
# Check database query performance
curl https://<project-id>.supabase.co/functions/v1/health | jq '.checks.database.latencyMs'

# If > 100ms, investigate slow queries
# Check edge function cold start times in logs
```

### Rate Limiting Too Aggressive

```bash
# Increase rate limits temporarily
# Edit fast-redirect/index.ts:
RATE_LIMITS.PER_IP_BURST = 200  # Double the limit
RATE_LIMITS.PER_LINK_MINUTE = 100

# Redeploy
supabase functions deploy fast-redirect
```

### Email Failures

```bash
# Check Resend status
curl https://api.resend.com/status

# Verify API key
echo $RESEND_API_KEY | wc -c  # Should be > 30 characters

# Check email logs
supabase functions logs send-contact-email --project-ref <project-id>
```

## Security Notes

- **Never commit secrets** to version control
- **Use environment variables** for all API keys
- **Rotate credentials** quarterly
- **Monitor for abuse** via rate limit logs
- **Review security logs** weekly

## Support Contacts

- **On-call engineer**: [contact info]
- **Supabase support**: support@supabase.io
- **Resend support**: support@resend.com
- **Escalation**: [escalation contact]

## Useful Commands

```bash
# View recent edge function logs
supabase functions logs fast-redirect --tail

# Check function deployment status
supabase functions list --project-ref <project-id>

# Test health check locally
curl http://localhost:54321/functions/v1/health

# Generate test load
for i in {1..100}; do
  curl -X POST http://localhost:54321/functions/v1/fast-redirect \
    -H "Content-Type: application/json" \
    -d '{"linkId":"test"}' &
done
wait
```

## Next Steps After Deployment

1. Set up monitoring dashboard (Grafana/Datadog)
2. Configure alerting rules
3. Document incident response procedures
4. Schedule weekly performance reviews
5. Plan next iteration improvements
