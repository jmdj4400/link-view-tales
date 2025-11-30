#!/bin/bash
# LinkPeek Rate Limit Test Script
# Tests that rate limiting triggers 429 responses

set -e

ENDPOINT="${1:-http://localhost:54321/functions/v1/fast-redirect}"
LINK_ID="${2:-test-link-id}"

echo "🧪 LinkPeek Rate Limit Test"
echo "=========================================="
echo "Endpoint: $ENDPOINT"
echo "Link ID: $LINK_ID"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success_count=0
rate_limited_count=0
total_requests=150

echo "🚀 Sending $total_requests rapid requests..."
echo ""

for i in $(seq 1 $total_requests); do
  response=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{\"linkId\":\"$LINK_ID\",\"userAgent\":\"test-agent\",\"country\":\"US\"}")
  
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)
  
  if [ "$http_code" == "429" ]; then
    rate_limited_count=$((rate_limited_count + 1))
    
    if [ $rate_limited_count -eq 1 ]; then
      echo -e "${YELLOW}⚠️  Request #$i: Rate limited (429)${NC}"
      echo "   Response body: $body"
      
      # Check for Retry-After header
      retry_after=$(curl -s -I -X POST "$ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"linkId\":\"$LINK_ID\"}" | grep -i "retry-after" || echo "")
      
      if [ -n "$retry_after" ]; then
        echo -e "   ${GREEN}✓ Retry-After header present: $retry_after${NC}"
      else
        echo -e "   ${RED}✗ Retry-After header missing${NC}"
      fi
    fi
  elif [ "$http_code" == "200" ]; then
    success_count=$((success_count + 1))
  else
    echo -e "${RED}✗ Request #$i: Unexpected status $http_code${NC}"
  fi
  
  # Progress indicator every 25 requests
  if [ $((i % 25)) -eq 0 ]; then
    echo "   Progress: $i/$total_requests (Success: $success_count, Rate limited: $rate_limited_count)"
  fi
done

echo ""
echo "=========================================="
echo "📊 Test Results:"
echo "   Total requests: $total_requests"
echo "   Successful: $success_count"
echo "   Rate limited (429): $rate_limited_count"
echo ""

if [ $rate_limited_count -gt 0 ]; then
  echo -e "${GREEN}✅ PASS: Rate limiting is working${NC}"
  echo "   Rate limiting triggered after ~$success_count requests"
  exit 0
else
  echo -e "${RED}❌ FAIL: No rate limiting detected${NC}"
  echo "   Expected 429 responses after burst threshold (~100 requests)"
  exit 1
fi
