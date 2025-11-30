#!/bin/bash
# LinkPeek Redirect Canary Test
# Tests redirect endpoint with canary header and validates response time

set -e

ENDPOINT="${1:-http://localhost:54321/functions/v1/fast-redirect}"
LINK_ID="${2:-test-link-id}"
THRESHOLD_MS="${3:-100}"

echo "🕊️ LinkPeek Redirect Canary Test"
echo "=========================================="
echo "Endpoint: $ENDPOINT"
echo "Link ID: $LINK_ID"
echo "Threshold: ${THRESHOLD_MS}ms"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Run 10 test requests
total_time=0
success_count=0
failed_count=0

echo "🚀 Running 10 canary requests..."
echo ""

for i in $(seq 1 10); do
  start_time=$(date +%s%3N)
  
  response=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "x-linkpeek-redirect: canary" \
    -d "{\"linkId\":\"$LINK_ID\",\"userAgent\":\"canary-agent\",\"country\":\"US\"}")
  
  end_time=$(date +%s%3N)
  duration=$((end_time - start_time))
  total_time=$((total_time + duration))
  
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)
  
  if [ "$http_code" == "200" ]; then
    success_count=$((success_count + 1))
    
    if [ $duration -lt $THRESHOLD_MS ]; then
      echo -e "${GREEN}✓${NC} Request #$i: ${duration}ms (under threshold)"
    else
      echo -e "${YELLOW}⚠${NC} Request #$i: ${duration}ms (over threshold)"
    fi
  else
    failed_count=$((failed_count + 1))
    echo -e "${RED}✗${NC} Request #$i: HTTP $http_code (${duration}ms)"
    echo "   Response: $body"
  fi
done

avg_time=$((total_time / 10))

echo ""
echo "=========================================="
echo "📊 Canary Test Results:"
echo "   Successful requests: $success_count/10"
echo "   Failed requests: $failed_count/10"
echo "   Average response time: ${avg_time}ms"
echo "   Threshold: ${THRESHOLD_MS}ms"
echo ""

if [ $success_count -eq 10 ] && [ $avg_time -lt $THRESHOLD_MS ]; then
  echo -e "${GREEN}✅ PASS: All canary requests succeeded under threshold${NC}"
  exit 0
elif [ $success_count -eq 10 ]; then
  echo -e "${YELLOW}⚠️  PASS with warning: All succeeded but average time ${avg_time}ms exceeds threshold${NC}"
  exit 0
else
  echo -e "${RED}❌ FAIL: $failed_count requests failed${NC}"
  exit 1
fi
