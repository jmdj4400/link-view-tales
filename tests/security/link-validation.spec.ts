import { test, expect } from '@playwright/test';

test.describe('Link Security Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/links');
    await page.waitForLoadState('networkidle');
    
    // Click "Add New Link" or similar button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New Link"), button:has-text("Create")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should reject title longer than 200 characters', async ({ page }) => {
    const longTitle = 'A'.repeat(201);
    
    const titleInput = page.locator('input[name="title"], input#title, input[placeholder*="title" i]').first();
    await titleInput.fill(longTitle);
    
    const maxLength = await titleInput.getAttribute('maxLength');
    expect(maxLength).toBe('200');
  });

  test('should reject empty title', async ({ page }) => {
    const titleInput = page.locator('input[name="title"], input#title, input[placeholder*="title" i]').first();
    await titleInput.clear();
    
    const urlInput = page.locator('input[name="dest_url"], input[name="url"], input[type="url"]').first();
    await urlInput.fill('https://example.com');
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
    await submitButton.click();
    
    const errorMessage = page.locator('text=/Title is required/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should reject URL longer than 2048 characters', async ({ page }) => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2030);
    
    const urlInput = page.locator('input[name="dest_url"], input[name="url"], input[type="url"]').first();
    await urlInput.fill(longUrl);
    
    const maxLength = await urlInput.getAttribute('maxLength');
    expect(maxLength).toBe('2048');
  });

  test('should reject empty URL', async ({ page }) => {
    const titleInput = page.locator('input[name="title"], input#title, input[placeholder*="title" i]').first();
    await titleInput.fill('Test Link');
    
    const urlInput = page.locator('input[name="dest_url"], input[name="url"], input[type="url"]').first();
    await urlInput.clear();
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
    await submitButton.click();
    
    const errorMessage = page.locator('text=/URL is required/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should reject invalid URL format', async ({ page }) => {
    const titleInput = page.locator('input[name="title"], input#title, input[placeholder*="title" i]').first();
    await titleInput.fill('Test Link');
    
    const urlInput = page.locator('input[name="dest_url"], input[name="url"], input[type="url"]').first();
    await urlInput.fill('not-a-valid-url');
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
    await submitButton.click();
    
    const errorMessage = page.locator('text=/valid URL/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should reject non-HTTP(S) URL', async ({ page }) => {
    const titleInput = page.locator('input[name="title"], input#title, input[placeholder*="title" i]').first();
    await titleInput.fill('Test Link');
    
    const urlInput = page.locator('input[name="dest_url"], input[name="url"], input[type="url"]').first();
    await urlInput.fill('ftp://example.com');
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
    await submitButton.click();
    
    const errorMessage = page.locator('text=/must use HTTP or HTTPS/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should reject UTM parameters longer than 100 characters', async ({ page }) => {
    // Open UTM builder if it exists
    const utmButton = page.locator('button:has-text("UTM"), button:has-text("Advanced")');
    if (await utmButton.isVisible()) {
      await utmButton.click();
      await page.waitForTimeout(500);
    }
    
    const longUtm = 'A'.repeat(101);
    
    const utmSourceInput = page.locator('input[name="utm_source"], input#utm_source');
    if (await utmSourceInput.isVisible()) {
      await utmSourceInput.fill(longUtm);
      
      const maxLength = await utmSourceInput.getAttribute('maxLength');
      expect(maxLength).toBe('100');
    }
  });

  test('should accept valid link data', async ({ page }) => {
    const titleInput = page.locator('input[name="title"], input#title, input[placeholder*="title" i]').first();
    await titleInput.fill('Valid Test Link');
    
    const urlInput = page.locator('input[name="dest_url"], input[name="url"], input[type="url"]').first();
    await urlInput.fill('https://example.com/test');
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
    await submitButton.click();
    
    // Wait for success
    await page.waitForTimeout(2000);
    
    // Check for success (no errors)
    const hasError = await page.locator('[role="alert"]:has-text("error"), .text-destructive').count();
    expect(hasError).toBe(0);
  });
});
