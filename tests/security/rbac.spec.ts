import { test, expect } from '@playwright/test';
import { testUser } from '../setup/auth.setup';

test.describe('RBAC System Security', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    
    // Sign in with test user
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should prevent non-admin access to admin dashboard', async ({ page }) => {
    // Attempt to navigate to admin dashboard
    await page.goto('/admin');
    
    // Should redirect back to dashboard
    await page.waitForURL('/dashboard');
    
    // Verify user is on dashboard, not admin page
    const url = page.url();
    expect(url).not.toContain('/admin');
  });

  test('should prevent direct API access without proper role', async ({ page }) => {
    // Try to query user_roles table directly
    const response = await page.evaluate(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      );
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .neq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      return { data, error: error?.message };
    });
    
    // Should either return empty data or error
    expect(!response.data || response.data.length === 0 || response.error).toBeTruthy();
  });

  test('should only show own user roles', async ({ page }) => {
    const userRoles = await page.evaluate(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      );
      
      const { data } = await supabase
        .from('user_roles')
        .select('role, user_id');
      
      return data;
    });
    
    // All returned roles should be for the current user
    const currentUserId = await page.evaluate(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      );
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    });
    
    if (userRoles && userRoles.length > 0) {
      userRoles.forEach(role => {
        expect(role.user_id).toBe(currentUserId);
      });
    }
  });

  test('should prevent role escalation attempts', async ({ page }) => {
    // Attempt to insert admin role for self
    const insertResult = await page.evaluate(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user?.id, role: 'admin' });
      
      return { error: error?.message };
    });
    
    // Should fail due to RLS policy
    expect(insertResult.error).toBeTruthy();
  });

  test('should validate has_role function works correctly', async ({ page }) => {
    const roleCheck = await page.evaluate(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check for admin role using RPC
      const { data: isAdmin } = await supabase
        .rpc('has_role', { _user_id: user?.id, _role: 'admin' });
      
      // Check for user role
      const { data: isUser } = await supabase
        .rpc('has_role', { _user_id: user?.id, _role: 'user' });
      
      return { isAdmin, isUser };
    });
    
    // Regular test user should have 'user' role but not 'admin'
    expect(roleCheck.isUser).toBe(true);
    expect(roleCheck.isAdmin).toBe(false);
  });

  test('should prevent viewing other users audit logs', async ({ page }) => {
    const auditLogs = await page.evaluate(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('audit_logs')
        .select('user_id');
      
      return { data, userId: user?.id };
    });
    
    // All audit logs should be for current user only
    if (auditLogs.data && auditLogs.data.length > 0) {
      auditLogs.data.forEach(log => {
        expect(log.user_id).toBe(auditLogs.userId);
      });
    }
  });
});
