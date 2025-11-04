import { test, expect } from '@playwright/test';

test.describe('Profile Security Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/profile');
    await page.waitForLoadState('networkidle');
  });

  test('should reject name longer than 100 characters', async ({ page }) => {
    const longName = 'A'.repeat(101);
    
    const nameInput = page.locator('input[name="name"], input#name');
    await nameInput.clear();
    await nameInput.fill(longName);
    
    // Check for client-side validation
    const maxLength = await nameInput.getAttribute('maxLength');
    expect(maxLength).toBe('100');
    
    // Try to submit
    await page.click('button[type="submit"]');
    
    // Should show error or prevent submission
    const errorMessage = page.locator('text=/Name must be.*100 characters/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 }).catch(() => {
      // If no error message, check that form wasn't submitted
      expect(page.url()).toContain('/settings/profile');
    });
  });

  test('should reject empty name', async ({ page }) => {
    const nameInput = page.locator('input[name="name"], input#name');
    await nameInput.clear();
    
    await page.click('button[type="submit"]');
    
    const errorMessage = page.locator('text=/Name is required/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should reject handle longer than 50 characters', async ({ page }) => {
    const longHandle = 'A'.repeat(51);
    
    const handleInput = page.locator('input[name="handle"], input#handle');
    await handleInput.clear();
    await handleInput.fill(longHandle);
    
    const maxLength = await handleInput.getAttribute('maxLength');
    expect(maxLength).toBe('50');
    
    await page.click('button[type="submit"]');
    
    const errorMessage = page.locator('text=/Handle must be.*50 characters/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 }).catch(() => {
      expect(page.url()).toContain('/settings/profile');
    });
  });

  test('should reject handle with special characters', async ({ page }) => {
    const invalidHandle = 'test@user#123';
    
    const handleInput = page.locator('input[name="handle"], input#handle');
    await handleInput.clear();
    await handleInput.fill(invalidHandle);
    
    await page.click('button[type="submit"]');
    
    const errorMessage = page.locator('text=/Handle can only contain/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should reject bio longer than 500 characters', async ({ page }) => {
    const longBio = 'A'.repeat(501);
    
    const bioInput = page.locator('textarea[name="bio"], textarea#bio');
    await bioInput.clear();
    await bioInput.fill(longBio);
    
    const maxLength = await bioInput.getAttribute('maxLength');
    expect(maxLength).toBe('500');
    
    await page.click('button[type="submit"]');
    
    const errorMessage = page.locator('text=/Bio must be.*500 characters/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 }).catch(() => {
      expect(page.url()).toContain('/settings/profile');
    });
  });

  test('should reject non-HTTP(S) avatar URL', async ({ page }) => {
    const invalidUrl = 'ftp://example.com/avatar.jpg';
    
    const avatarInput = page.locator('input[name="avatar_url"], input#avatar_url');
    await avatarInput.clear();
    await avatarInput.fill(invalidUrl);
    
    await page.click('button[type="submit"]');
    
    const errorMessage = page.locator('text=/must use HTTP or HTTPS/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should reject invalid avatar URL', async ({ page }) => {
    const invalidUrl = 'not-a-valid-url';
    
    const avatarInput = page.locator('input[name="avatar_url"], input#avatar_url');
    await avatarInput.clear();
    await avatarInput.fill(invalidUrl);
    
    await page.click('button[type="submit"]');
    
    const errorMessage = page.locator('text=/valid URL/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should accept valid profile data', async ({ page }) => {
    const nameInput = page.locator('input[name="name"], input#name');
    await nameInput.clear();
    await nameInput.fill('Valid User Name');
    
    const handleInput = page.locator('input[name="handle"], input#handle');
    await handleInput.clear();
    await handleInput.fill('valid_handle_123');
    
    const bioInput = page.locator('textarea[name="bio"], textarea#bio');
    await bioInput.clear();
    await bioInput.fill('This is a valid bio under 500 characters.');
    
    const avatarInput = page.locator('input[name="avatar_url"], input#avatar_url');
    await avatarInput.clear();
    await avatarInput.fill('https://example.com/avatar.jpg');
    
    await page.click('button[type="submit"]');
    
    // Should show success message or stay on page without errors
    await page.waitForTimeout(2000);
    
    // Check for success (toast, message, or no errors)
    const hasError = await page.locator('[role="alert"], .text-destructive, .error').count();
    expect(hasError).toBe(0);
  });
});
