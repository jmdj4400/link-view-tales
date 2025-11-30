#!/bin/bash
# LinkPeek Email Reliability Test
# Tests email sending with success and failure cases

set -e

FUNCTION_URL="${1:-http://localhost:54321/functions/v1/send-contact-email}"

echo "📧 LinkPeek Email Reliability Test"
echo "=========================================="
echo "Function URL: $FUNCTION_URL"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Valid email send
echo "Test 1: Valid email send"
echo "-------------------------"

response=$(curl -s -w "\n%{http_code}" -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test email from the reliability test script."
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" == "200" ]; then
  echo -e "${GREEN}✓ Valid email test passed${NC}"
  echo "  Response: $body"
else
  echo -e "${RED}✗ Valid email test failed (HTTP $http_code)${NC}"
  echo "  Response: $body"
fi

echo ""

# Test 2: Invalid email address
echo "Test 2: Invalid email handling"
echo "-------------------------------"

response=$(curl -s -w "\n%{http_code}" -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "message": "This should fail validation."
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" == "400" ] || [ "$http_code" == "422" ]; then
  echo -e "${GREEN}✓ Invalid email properly rejected${NC}"
  echo "  Response: $body"
else
  echo -e "${YELLOW}⚠ Invalid email not rejected (HTTP $http_code)${NC}"
  echo "  Response: $body"
fi

echo ""

# Test 3: Missing required fields
echo "Test 3: Missing required fields"
echo "--------------------------------"

response=$(curl -s -w "\n%{http_code}" -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" == "400" ] || [ "$http_code" == "422" ]; then
  echo -e "${GREEN}✓ Missing fields properly rejected${NC}"
  echo "  Response: $body"
else
  echo -e "${RED}✗ Missing fields not rejected (HTTP $http_code)${NC}"
  echo "  Response: $body"
fi

echo ""
echo "=========================================="
echo "📊 Email Test Summary"
echo ""
echo "✅ Test suite completed"
echo ""
echo "Manual verification required:"
echo "  1. Check that test email was received"
echo "  2. Verify email retry logic in logs"
echo "  3. Confirm RESEND_API_KEY is configured"
echo ""
echo "To verify email provider status:"
echo "  curl http://localhost:54321/functions/v1/health | jq '.checks.emailProvider'"
