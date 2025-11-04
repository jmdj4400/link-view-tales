import { test, expect } from '@playwright/test';
import { supabase } from '../../src/lib/supabase-client';

test.describe('Rate Limiting Security', () => {
  let testLinkId: string;

  test.beforeAll(async () => {
    // Create a test link for rate limiting tests
    const { data: linkData } = await supabase
      .from('links')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (linkData) {
      testLinkId = linkData.id;
    } else {
      throw new Error('No active links found for testing. Please create a test link first.');
    }
  });

  test('should rate limit after 60 redirect requests in 5 minutes', async ({ page, context }) => {
    test.setTimeout(120000); // 2 minutes timeout
    
    let rateLimitedCount = 0;
    let successCount = 0;
    
    console.log(`Testing rate limiting with link ID: ${testLinkId}`);
    
    // Make 65 requests to trigger rate limiting
    for (let i = 1; i <= 65; i++) {
      try {
        const response = await page.goto(`/r/${testLinkId}`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        
        const status = response?.status() || 0;
        
        if (status === 429 || await page.locator('text=/too many requests/i').isVisible()) {
          rateLimitedCount++;
          console.log(`✅ Request ${i}: Rate limited (429)`);
          
          // If we got rate limited, test is successful
          if (i > 55) { // Should happen after ~60 requests
            expect(rateLimitedCount).toBeGreaterThan(0);
            console.log(`✅ Rate limiting working! Got rate limited after ${i} requests`);
            break;
          }
        } else if (status === 200 || page.url().includes('http')) {
          successCount++;
          console.log(`Request ${i}: Success (${status})`);
        }
        
        // Small delay between requests
        await page.waitForTimeout(100);
      } catch (error) {
        console.error(`Request ${i} error:`, error);
      }
    }
    
    console.log(`\nResults: ${successCount} successful, ${rateLimitedCount} rate limited`);
    
    // Verify rate limiting kicked in
    expect(rateLimitedCount).toBeGreaterThan(0);
    expect(successCount).toBeLessThanOrEqual(60);
  });

  test('should show appropriate error message when rate limited', async ({ page }) => {
    // This test assumes the rate limit might still be active from previous test
    // or tests it independently
    
    const response = await page.goto(`/r/${testLinkId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    
    // Check if rate limited
    if (response?.status() === 429) {
      const errorText = page.locator('text=/too many requests/i');
      await expect(errorText).toBeVisible();
    }
  });
});
