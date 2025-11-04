import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to auth page
  await page.goto('/auth');
  
  // Fill in test credentials
  await page.fill('input[type="email"]', 'test@security-test.com');
  await page.fill('input[type="password"]', 'TestPassword123!');
  
  // Click sign in button
  await page.click('button:has-text("Sign In")');
  
  // Wait for redirect to dashboard or profile
  await page.waitForURL(/\/(dashboard|onboarding|settings)/);
  
  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
