# Security Test Suite

Automated security testing using Playwright to verify all validation and security controls.

## Test Coverage

### 1. Profile Validation Tests (`security/profile-validation.spec.ts`)
- ✅ Name length validation (max 100 chars)
- ✅ Name required validation
- ✅ Handle length validation (max 50 chars)
- ✅ Handle format validation (alphanumeric, underscore, hyphen only)
- ✅ Bio length validation (max 500 chars)
- ✅ Avatar URL protocol validation (HTTP/HTTPS only)
- ✅ Avatar URL format validation

### 2. Link Validation Tests (`security/link-validation.spec.ts`)
- ✅ Title length validation (max 200 chars)
- ✅ Title required validation
- ✅ URL length validation (max 2048 chars)
- ✅ URL required validation
- ✅ URL format validation
- ✅ URL protocol validation (HTTP/HTTPS only)
- ✅ UTM parameter length validation (max 100 chars each)

### 3. Rate Limiting Tests (`security/rate-limiting.spec.ts`)
- ✅ Redirect rate limiting (60 requests per 5 minutes)
- ✅ Rate limit error messaging
- ✅ Rate limit enforcement

### 4. Database Constraint Tests (`security/database-constraints.spec.ts`)
- ✅ Server-side profile validation
- ✅ Server-side link validation
- ✅ Server-side UTM parameter validation

## Running Tests

### Install Dependencies
```bash
npm install
npx playwright install
```

### Run All Security Tests
```bash
npm run test:security
```

### Run Specific Test File
```bash
npx playwright test tests/security/profile-validation.spec.ts
```

### Run in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run with Debug Mode
```bash
npx playwright test --debug
```

### View Test Report
```bash
npx playwright show-report
```

## Test Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:8080`
- Browser: Chromium (Desktop Chrome)
- Workers: 1 (sequential execution for rate limiting tests)
- Retries: 2 in CI, 0 locally
- Screenshots: On failure only
- Trace: On first retry

## CI/CD Integration

Tests run automatically:
- On push to `main` or `develop` branches
- On pull requests to `main`
- Daily at 2 AM UTC (scheduled)

GitHub Actions workflow: `.github/workflows/security-tests.yml`

## Prerequisites

Before running tests:
1. Ensure dev server is running (`npm run dev`)
2. Have test user credentials ready
3. Ensure Supabase is properly configured

## Writing New Tests

Follow this structure:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
  });

  test('should validate something', async ({ page }) => {
    // Your test code
    expect(something).toBe(expected);
  });
});
```

## Troubleshooting

### Tests Fail to Start
- Check if dev server is running
- Verify Supabase environment variables are set

### Authentication Issues
- Check `tests/setup/auth.setup.ts` credentials
- Verify auth redirect URLs in Supabase

### Rate Limiting Tests Fail
- Ensure no other tests are running simultaneously
- Clear rate limits: `DELETE FROM rate_limits;`

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after tests
3. **Timeouts**: Set appropriate timeouts for async operations
4. **Assertions**: Use specific, meaningful assertions
5. **Selectors**: Use stable selectors (test IDs preferred)

## Security Test Checklist

- [ ] All input validation tests pass
- [ ] Database constraints are enforced
- [ ] Rate limiting works correctly
- [ ] Error messages don't leak sensitive information
- [ ] Authentication is required where needed
- [ ] RLS policies are effective
