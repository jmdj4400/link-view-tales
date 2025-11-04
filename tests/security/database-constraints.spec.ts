import { test, expect } from '@playwright/test';
import { supabase } from '../../src/lib/supabase-client';

test.describe('Database Constraint Security', () => {
  
  test('should enforce profile name length constraint at database level', async () => {
    const longName = 'A'.repeat(101);
    
    const { error } = await supabase
      .from('profiles')
      .update({ name: longName })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);
    
    expect(error).toBeTruthy();
    expect(error?.message).toMatch(/violates check constraint|value too long/i);
  });

  test('should enforce handle format constraint at database level', async () => {
    const invalidHandle = 'test@user#123';
    
    const { error } = await supabase
      .from('profiles')
      .update({ handle: invalidHandle })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);
    
    expect(error).toBeTruthy();
    expect(error?.message).toMatch(/violates check constraint|does not match/i);
  });

  test('should enforce bio length constraint at database level', async () => {
    const longBio = 'A'.repeat(501);
    
    const { error } = await supabase
      .from('profiles')
      .update({ bio: longBio })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);
    
    expect(error).toBeTruthy();
    expect(error?.message).toMatch(/violates check constraint|value too long/i);
  });

  test('should enforce link title length constraint at database level', async () => {
    const longTitle = 'A'.repeat(201);
    
    const { error } = await supabase
      .from('links')
      .insert({
        title: longTitle,
        dest_url: 'https://example.com',
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
    
    expect(error).toBeTruthy();
    expect(error?.message).toMatch(/violates check constraint|value too long/i);
  });

  test('should enforce link URL length constraint at database level', async () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2030);
    
    const { error } = await supabase
      .from('links')
      .insert({
        title: 'Test Link',
        dest_url: longUrl,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
    
    expect(error).toBeTruthy();
    expect(error?.message).toMatch(/violates check constraint|value too long/i);
  });

  test('should enforce UTM parameter length constraints at database level', async () => {
    const longUtm = 'A'.repeat(101);
    
    const { error } = await supabase
      .from('links')
      .insert({
        title: 'Test Link',
        dest_url: 'https://example.com',
        utm_source: longUtm,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
    
    expect(error).toBeTruthy();
    expect(error?.message).toMatch(/violates check constraint|value too long/i);
  });
});
