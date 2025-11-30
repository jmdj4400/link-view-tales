# LinkPeek Observability Guide

## Overview

This document describes the monitoring, logging, and alerting strategy for LinkPeek in production.

## Key Metrics to Monitor

### 1. Redirect Performance

**Primary Metrics:**
- **Redirect P95 Latency**: 95th percentile response time for redirect requests
  - Target: < 100ms
  - Warning: 100-300ms
  - Critical: > 300ms

- **Redirect P99 Latency**: 99th percentile response time
  - Target: < 200ms
  - Warning: 200-500ms
  - Critical: > 500ms

- **Redirect Success Rate**: Percentage of successful redirects
  - Target: > 99%
  - Warning: 95-99%
  - Critical: < 95%

**Query Examples:**
```sql
-- P95/P99 latency (last hour)
SELECT 
  percentile_cont(0.95) WITHIN GROUP (ORDER BY load_time_ms) as p95_ms,
  percentile_cont(0.99) WITHIN GROUP (ORDER BY load_time_ms) as p99_ms
FROM redirects
WHERE ts > NOW() - INTERVAL '1 hour'
  AND load_time_ms IS NOT NULL;

-- Success rate (last hour)
SELECT 
  COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*) as success_rate
FROM redirects
WHERE ts > NOW() - INTERVAL '1 hour';
```

### 2. Rate Limiting

**Primary Metrics:**
- **429 Response Rate**: Number of rate-limited requests per minute
  - Warning: > 100/min (potential attack or misconfiguration)
  - Critical: > 1000/min (likely attack)

- **Rate Limit Hit Rate**: Percentage of requests that hit rate limits
  - Target: < 1%
  - Warning: 1-5%
  - Critical: > 5%

**Log Query:**
```json
{
  "event": "rate_limit_exceeded",
  "type": ["ip", "link"],
  "timestamp": "ISO8601"
}
```

### 3. Email Delivery

**Primary Metrics:**
- **Email Send Success Rate**: Percentage of emails successfully sent
  - Target: > 95%
  - Warning: 90-95%
  - Critical: < 90%

- **Email Retry Rate**: Percentage of sends requiring retry
  - Target: < 5%
  - Warning: 5-10%
  - Critical: > 10%

**Log Query:**
```json
{
  "event": "email_sent",
  "success": true/false,
  "emailType": "welcome|reset|invite",
  "timestamp": "ISO8601"
}
```

### 4. System Health

**Health Check Endpoint:**
```bash
curl https://your-domain.com/functions/v1/health
```

**Response Structure:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "checks": {
    "database": {
      "status": "healthy",
      "latencyMs": 45
    },
    "redirectLatency": {
      "status": "healthy",
      "p95Ms": 85,
      "p99Ms": 150
    },
    "emailProvider": {
      "status": "healthy"
    }
  }
}
```

## Structured Logging

All critical events are logged in JSON format for easy parsing and analysis.

### Event Types

**1. Redirect Events:**
```json
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "event": "redirect_success|redirect_failed",
  "linkId": "uuid",
  "totalTimeMs": 45,
  "urlCheckTimeMs": 20,
  "inAppBrowser": true,
  "platform": "instagram",
  "browser": "ios_safari",
  "canary": false,
  "hashedIp": "hash"
}
```

**2. Rate Limit Events:**
```json
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "event": "rate_limit_exceeded",
  "type": "ip|link",
  "ip": "hashed",
  "linkId": "uuid",
  "retryAfter": 60
}
```

**3. Error Events:**
```json
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "event": "redirect_error",
  "error": "error message",
  "stack": "stack trace",
  "linkId": "uuid"
}
```

## Alert Rules

### Critical Alerts (Page immediately)

**1. Redirect P95 > 300ms for 5 minutes**
```
Alert: High redirect latency
Condition: redirects.p95_latency > 300ms for 5 consecutive minutes
Action: Page on-call engineer
Runbook: Check database performance, edge function logs, rate limiting
```

**2. Redirect success rate < 95% for 5 minutes**
```
Alert: Low redirect success rate
Condition: redirects.success_rate < 0.95 for 5 consecutive minutes
Action: Page on-call engineer
Runbook: Check target URL reachability, DNS, firewall rules
```

**3. Database connection failures**
```
Alert: Database unreachable
Condition: health.checks.database.status == "unhealthy"
Action: Page on-call engineer immediately
Runbook: Check Supabase status, connection pool, credentials
```

### Warning Alerts (Notify team)

**1. Redirect P95 > 100ms for 15 minutes**
```
Alert: Elevated redirect latency
Condition: redirects.p95_latency > 100ms for 15 consecutive minutes
Action: Notify team in Slack
Runbook: Monitor, investigate slow queries, check edge function cold starts
```

**2. Rate limit hit rate > 5%**
```
Alert: High rate limiting activity
Condition: rate_limit_hits / total_requests > 0.05
Action: Notify team in Slack
Runbook: Investigate traffic patterns, check for DDoS, review rate limits
```

**3. Email failure rate > 10%**
```
Alert: Email delivery issues
Condition: email_failures / total_emails > 0.10
Action: Notify team in Slack
Runbook: Check Resend status, API key validity, DNS records
```

## Monitoring Stack Recommendations

### Option 1: Supabase Logs + External Monitoring
- **Logs**: Supabase Edge Function logs (JSON)
- **Metrics**: Custom queries on redirects/events tables
- **Alerting**: Grafana, Datadog, or New Relic
- **Cost**: Medium

### Option 2: Lightweight (Recommended for MVP)
- **Health Check**: `/health` endpoint monitored by UptimeRobot or Better Uptime
- **Logs**: Supabase logs + periodic SQL queries for metrics
- **Alerting**: Email/Slack webhooks from monitoring service
- **Cost**: Low

### Option 3: Full Observability Stack
- **Logs**: Structured logs shipped to Loki or CloudWatch
- **Metrics**: Prometheus + Grafana dashboards
- **Tracing**: OpenTelemetry (optional)
- **Alerting**: Prometheus AlertManager
- **Cost**: High

## Quick Health Check

Run this script to verify system health:

```bash
#!/bin/bash
# Quick health verification

echo "🏥 LinkPeek Health Check"
echo "========================"

# Check health endpoint
health=$(curl -s https://your-domain.com/functions/v1/health)
status=$(echo $health | jq -r '.status')

echo "Overall Status: $status"
echo ""
echo "Database: $(echo $health | jq -r '.checks.database.status')"
echo "Redirect Latency: $(echo $health | jq -r '.checks.redirectLatency.status')"
echo "Email Provider: $(echo $health | jq -r '.checks.emailProvider.status')"
echo ""

if [ "$status" == "healthy" ]; then
  echo "✅ System is healthy"
  exit 0
else
  echo "⚠️ System is $status"
  exit 1
fi
```

## Log Analysis Examples

### Find slow redirects (last hour):
```bash
# In Supabase logs
SELECT * FROM edge_function_logs 
WHERE function = 'fast-redirect'
  AND timestamp > NOW() - INTERVAL '1 hour'
  AND event_message LIKE '%totalTimeMs%'
  AND CAST(event_message::json->>'totalTimeMs' AS INTEGER) > 300
ORDER BY timestamp DESC;
```

### Rate limit analysis:
```bash
# Count rate limits by type
SELECT 
  COUNT(*) as count,
  event_message::json->>'type' as limit_type
FROM edge_function_logs
WHERE event_message LIKE '%rate_limit_exceeded%'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY limit_type;
```

## Incident Response Runbook

### High Latency
1. Check `/health` endpoint for degraded components
2. Review recent redirects for pattern (geography, link, browser)
3. Check database query performance
4. Verify edge function cold start times
5. Consider scaling/CDN cache

### Low Success Rate
1. Check target URL reachability from edge locations
2. Review recent failed redirects for error patterns
3. Verify firewall/security rules not blocking traffic
4. Check DNS resolution for target domains
5. Review rate limiting for false positives

### Email Failures
1. Check Resend dashboard for delivery status
2. Verify RESEND_API_KEY is valid
3. Check email logs for retry attempts
4. Verify sender domain DNS records (SPF, DKIM)
5. Contact Resend support if persistent

## Dashboard Recommendations

Create dashboards showing:
1. **Real-time metrics** (last 5 min): Redirect count, P95 latency, 429 count
2. **Hourly trends**: Success rate, average latency, traffic by platform
3. **Daily summaries**: Total redirects, unique links, top platforms
4. **System health**: Database latency, email success rate, error count

## Next Steps

1. Set up health check monitoring (UptimeRobot/Better Uptime)
2. Configure Slack webhook for critical alerts
3. Create basic Grafana dashboard (optional)
4. Set up weekly metric review process
5. Document on-call procedures and escalation paths
