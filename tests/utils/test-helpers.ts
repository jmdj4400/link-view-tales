import { Page, expect } from '@playwright/test';

/**
 * Helper functions for E2E testing
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Complete user signup flow
   */
  async signup(email: string, password: string) {
    await this.page.goto('/auth');
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).first().fill(password);
    await this.page.getByRole('button', { name: /sign up/i }).click();
    
    // Wait for redirect
    await this.page.waitForURL(/onboarding|dashboard/, { timeout: 10000 });
  }

  /**
   * Complete user login flow
   */
  async login(email: string, password: string) {
    await this.page.goto('/auth');
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole('button', { name: /sign in|log in/i }).click();
    
    // Wait for redirect to dashboard
    await this.page.waitForURL(/dashboard/, { timeout: 10000 });
  }

  /**
   * Complete onboarding process
   */
  async completeOnboarding(bio: string, linkTitle: string, linkUrl: string) {
    // Profile step
    await this.page.getByLabel(/bio|about/i).fill(bio);
    await this.page.getByRole('button', { name: /next|continue/i }).click();
    
    // Link step
    await this.page.getByLabel(/title|name/i).fill(linkTitle);
    await this.page.getByLabel(/url|destination/i).fill(linkUrl);
    await this.page.getByRole('button', { name: /next|continue/i }).click();
    
    // Skip Instagram setup
    await this.page.getByRole('button', { name: /skip|later/i }).click();
    
    // Should reach dashboard
    await expect(this.page).toHaveURL(/dashboard/);
  }

  /**
   * Navigate to billing and select a plan
   */
  async selectPlan(planName: 'free' | 'pro' | 'business') {
    await this.page.goto('/billing');
    
    const planCard = this.page.locator(`[data-plan="${planName}"]`);
    await expect(planCard).toBeVisible();
    
    const upgradeBtn = planCard.getByRole('button', { name: /upgrade|start.*trial|select/i }).first();
    
    if (await upgradeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await upgradeBtn.click();
    }
  }

  /**
   * Check if trial banner is visible
   */
  async isTrialBannerVisible(): Promise<boolean> {
    const banner = this.page.locator('[data-testid="trial-banner"], text=/trial.*days|days.*left/i').first();
    return await banner.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Get trial days remaining from UI
   */
  async getTrialDaysRemaining(): Promise<number | null> {
    const countdown = this.page.locator('text=/\\d+\\s*days?.*left/i').first();
    
    if (await countdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await countdown.textContent();
      const match = text?.match(/(\d+)\s*days?/i);
      return match ? parseInt(match[1]) : null;
    }
    
    return null;
  }

  /**
   * Verify current subscription plan
   */
  async getCurrentPlan(): Promise<string | null> {
    await this.page.goto('/billing');
    await this.page.waitForLoadState('networkidle');
    
    // Look for active plan indicator
    const activePlan = this.page.locator('[data-current="true"], [data-active="true"]').first();
    
    if (await activePlan.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = await activePlan.textContent();
      
      if (text?.toLowerCase().includes('free')) return 'free';
      if (text?.toLowerCase().includes('pro')) return 'pro';
      if (text?.toLowerCase().includes('business')) return 'business';
    }
    
    return null;
  }

  /**
   * Check if feature is locked (requires upgrade)
   */
  async isFeatureLocked(featureName: string): Promise<boolean> {
    const upgradePrompt = this.page.locator(`text=/upgrade.*${featureName}|${featureName}.*requires.*upgrade/i`);
    return await upgradePrompt.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Refresh subscription status
   */
  async refreshSubscriptionStatus() {
    const refreshBtn = this.page.getByRole('button', { name: /refresh|check.*status/i });
    
    if (await refreshBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await refreshBtn.click();
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Navigate to customer portal
   */
  async openCustomerPortal() {
    await this.page.goto('/billing');
    
    const portalBtn = this.page.getByRole('button', { name: /manage.*subscription|customer portal/i });
    
    if (await portalBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await portalBtn.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Verify checkout initiated (new tab or redirect)
   */
  async verifyCheckoutInitiated(): Promise<boolean> {
    await this.page.waitForTimeout(2000);
    
    const url = this.page.url();
    const isCheckout = url.includes('checkout.stripe.com') || 
                       url.includes('checkout') ||
                       await this.page.locator('text=/processing|loading|redirecting/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    return isCheckout;
  }

  /**
   * Generate unique test email
   */
  static generateTestEmail(prefix: string = 'test'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  }

  /**
   * Wait for element with custom timeout
   */
  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.waitForSelector(selector, { timeout, state: 'visible' });
  }

  /**
   * Take screenshot for debugging
   */
  async captureScreenshot(name: string) {
    await this.page.screenshot({ path: `tests/screenshots/${name}-${Date.now()}.png`, fullPage: true });
  }
}

/**
 * Mock Stripe checkout success
 */
export async function mockStripeSuccess(page: Page) {
  // Intercept Stripe API calls and return success
  await page.route('**/create-checkout', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: '/checkout/success?session_id=mock_session_123' })
    });
  });
}

/**
 * Mock subscription check response
 */
export async function mockSubscriptionCheck(page: Page, status: 'free' | 'pro' | 'business') {
  await page.route('**/check-subscription', route => {
    const responses = {
      free: { subscribed: false },
      pro: { subscribed: true, product_id: 'prod_pro_123', subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
      business: { subscribed: true, product_id: 'prod_business_123', subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
    };
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responses[status])
    });
  });
}