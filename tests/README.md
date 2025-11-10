# LinkPeek Test Suite

Comprehensive security and end-to-end tests for the LinkPeek application.

## Test Coverage

### 1. E2E Subscription Flow (`e2e/subscription-flow.spec.ts`)
- Complete signup to checkout flow
- Trial countdown banner display
- Upgrade flows (Free → Pro, Free → Business)
- Checkout success page verification
- Trial expiration scenarios
- Subscription status verification
- Feature access based on subscription tier
- Customer portal integration

### 2. E2E Trial Lifecycle (`e2e/trial-lifecycle.spec.ts`)
- Trial activation on signup
- Countdown display and accuracy
- Trial expiration triggers
- 60-second onboarding challenge
- Trial reminder notifications
- Trial to paid conversion flows

### 3. E2E Plan Upgrades (`e2e/plan-upgrades.spec.ts`)
- Free to Pro upgrade
- Free to Business upgrade
- Pro to Business upgrade
- Downgrade protection
- Feature unlocking after upgrade
- Pricing display accuracy
- Billing page functionality

### 4. Security Tests (`security/`)
- Profile validation (`profile-validation.spec.ts`)
- Link validation (`link-validation.spec.ts`)
- Rate limiting (`rate-limiting.spec.ts`)
- Database constraints (`database-constraints.spec.ts`)
- RBAC (`rbac.spec.ts`)

## Running Tests

### Install Dependencies
```bash
npm install
npx playwright install
```

### Run all tests
```bash
npm run test
```

### Run E2E tests only
```bash
npm run test:e2e
```

### Run security tests only
```bash
npm run test:security
```

### Run specific test file
```bash
npx playwright test tests/e2e/subscription-flow.spec.ts
npx playwright test tests/security/profile-validation.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Run tests in UI mode (interactive)
```bash
npx playwright test --ui
```

### View test report
```bash
npx playwright show-report
```

## Test Helpers

The `tests/utils/test-helpers.ts` file provides utility functions:

**Authentication:**
- `signup(email, password)` - Complete signup flow
- `login(email, password)` - Complete login flow

**Onboarding:**
- `completeOnboarding(bio, linkTitle, linkUrl)` - Fill onboarding forms

**Subscription:**
- `selectPlan(planName)` - Choose subscription plan
- `isTrialBannerVisible()` - Check trial banner
- `getTrialDaysRemaining()` - Get trial countdown
- `getCurrentPlan()` - Get active subscription plan
- `isFeatureLocked(feature)` - Check if feature requires upgrade
- `refreshSubscriptionStatus()` - Trigger status refresh
- `openCustomerPortal()` - Navigate to Stripe portal

**Utilities:**
- `generateTestEmail(prefix)` - Create unique test email
- `waitForElement(selector, timeout)` - Wait for element
- `captureScreenshot(name)` - Take screenshot for debugging

**Mocking:**
- `mockStripeSuccess(page)` - Mock Stripe responses
- `mockSubscriptionCheck(page, status)` - Mock subscription API

## Test Data

### Test Users
Tests generate unique email addresses using timestamps:
```typescript
import { TestHelpers } from './utils/test-helpers';

const email = TestHelpers.generateTestEmail('test');
// Generates: test-1234567890-abc123@example.com
```

### Example Usage
```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test('User can complete signup', async ({ page }) => {
  const helper = new TestHelpers(page);
  const email = TestHelpers.generateTestEmail('signup');
  
  await helper.signup(email, 'TestPassword123!');
  await expect(page).toHaveURL(/onboarding|dashboard/);
});
```

## Test Configuration

Configuration in `playwright.config.ts`:
- Base URL: `http://localhost:8080`
- Browser: Chromium (Desktop Chrome)
- Workers: 1 (sequential execution for rate limiting)
- Retries: 2 in CI, 0 locally
- Screenshots: On failure only
- Trace: On first retry
- Timeout: 30s per test

## CI/CD Integration

Tests run automatically via GitHub Actions:
- On push to `main` or `develop` branches
- On pull requests to `main`
- Daily at 2 AM UTC (scheduled)

Workflow: `.github/workflows/security-tests.yml`

## Best Practices

1. **Isolation**: Each test should be independent and not rely on others
2. **Cleanup**: Clean up test data after tests complete
3. **Assertions**: Use explicit assertions with appropriate timeouts
4. **Selectors**: Prefer role-based selectors over CSS classes
5. **Waits**: Use `waitForSelector` instead of fixed timeouts when possible
6. **Unique Data**: Generate unique test data to avoid conflicts
7. **Screenshots**: Capture screenshots on failures for debugging
8. **Mocking**: Mock external APIs (Stripe) to avoid real charges

## Prerequisites

Before running tests:
1. Ensure dev server is running (`npm run dev`)
2. Verify Supabase is configured with correct environment variables
3. Check that all required secrets are set (STRIPE_SECRET_KEY, etc.)
4. Ensure database migrations are applied

## Writing New Tests

Follow this structure:
```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Feature Name Tests', () => {
  let helper: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helper = new TestHelpers(page);
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const testData = 'something';
    
    // Act
    await page.fill('input', testData);
    await page.click('button');
    
    // Assert
    await expect(page.locator('result')).toContainText(testData);
  });
});
```

## Debugging

### Failed Tests
1. Check `test-results/` directory for screenshots
2. View full trace with `npx playwright show-trace trace.zip`
3. Run single test in debug mode: `npx playwright test --debug test-file.spec.ts`

### Timeout Issues
- Increase timeout: `test.setTimeout(60000)`
- Check network requests in trace viewer
- Verify element selectors are correct

### Authentication Issues
- Verify `tests/setup/auth.setup.ts` credentials
- Check Supabase auth redirect URLs
- Ensure email confirmation is disabled for testing

### Rate Limiting Tests
- Run rate limit tests sequentially (workers: 1)
- Clear rate limits between runs: `DELETE FROM rate_limits;`
- Don't run other tests simultaneously

## Coverage Summary

✅ **E2E Tests:**
- User authentication flow
- Onboarding process (60-second challenge)
- Subscription management
- Trial lifecycle (activation, countdown, expiration)
- Plan upgrades (Free → Pro → Business)
- Feature gating based on plan
- Checkout integration
- Customer portal

✅ **Security Tests:**
- Input validation (profiles, links, UTM parameters)
- Database constraints enforcement
- Rate limiting (60 req/5min)
- RBAC (role-based access control)
- URL validation and sanitization

## Future Improvements

- [ ] Add performance tests (load times, response times)
- [ ] Test email verification flow
- [ ] Test password reset flow
- [ ] Add API endpoint integration tests
- [ ] Test webhook handling (Stripe events)
- [ ] Add load testing for high traffic scenarios
- [ ] Test mobile responsiveness
- [ ] Add accessibility tests (WCAG compliance)
- [ ] Test PWA functionality
- [ ] Add visual regression tests

## Troubleshooting

### Tests Won't Start
- Check dev server: `curl http://localhost:8080`
- Verify environment variables in `.env`
- Install Playwright browsers: `npx playwright install`

### All Tests Failing
- Check Supabase connection
- Verify database migrations applied
- Check for breaking UI changes

### Flaky Tests
- Add explicit waits for dynamic content
- Use `waitForLoadState('networkidle')`
- Increase timeouts for slow operations

### Need Help?
- View Playwright docs: https://playwright.dev
- Check test examples in `tests/` directory
- Review test helpers in `tests/utils/test-helpers.ts`