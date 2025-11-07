/**
 * Security utility functions for the application
 */

/**
 * Hash user agent using SHA-256
 * @param userAgent - The user agent string to hash
 * @returns Promise with the hashed string (first 32 characters)
 */
export async function hashUserAgent(userAgent: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userAgent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 32);
}

/**
 * Validate profile input fields
 */
export const profileValidation = {
  name: {
    maxLength: 100,
    validate: (value: string) => {
      if (!value) return 'Name is required';
      if (value.length > 100) return 'Name must be 100 characters or less';
      return null;
    }
  },
  handle: {
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
    validate: (value: string) => {
      if (!value) return 'Handle is required';
      if (value.length > 50) return 'Handle must be 50 characters or less';
      if (!profileValidation.handle.pattern.test(value)) {
        return 'Handle can only contain letters, numbers, underscores, and hyphens';
      }
      return null;
    }
  },
  bio: {
    maxLength: 500,
    validate: (value: string) => {
      if (value && value.length > 500) return 'Bio must be 500 characters or less';
      return null;
    }
  },
  avatarUrl: {
    validate: (value: string) => {
      if (!value) return null;
      try {
        const url = new URL(value);
        // Check if it's http or https
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'Avatar URL must use HTTP or HTTPS protocol';
        }
        return null;
      } catch {
        return 'Please enter a valid URL';
      }
    }
  }
};

/**
 * Avatar URL Security Whitelist
 */
const ALLOWED_AVATAR_DOMAINS = [
  'githubusercontent.com',
  'gravatar.com',
  'googleusercontent.com',
  'cloudflare.com',
  'supabase.co',
  'imgur.com',
  'cloudinary.com'
];

export const avatarValidation = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  validateUrl: (url: string): boolean => {
    if (!url) return true; // Allow empty
    
    try {
      const parsed = new URL(url);
      
      // Must be HTTPS
      if (parsed.protocol !== 'https:') return false;
      
      // Check against whitelist
      const isAllowed = ALLOWED_AVATAR_DOMAINS.some(domain => 
        parsed.hostname.endsWith(domain)
      );
      
      return isAllowed;
    } catch {
      return false;
    }
  },
  
  sanitizeUrl: (url: string): string | null => {
    if (!url) return null;
    if (!avatarValidation.validateUrl(url)) return null;
    return url;
  }
};

/**
 * Validate link input fields
 */
export const linkValidation = {
  title: {
    maxLength: 200,
    validate: (value: string) => {
      if (!value) return 'Title is required';
      if (value.length > 200) return 'Title must be 200 characters or less';
      return null;
    }
  },
  destUrl: {
    maxLength: 2048,
    validate: (value: string) => {
      if (!value) return 'URL is required';
      if (value.length > 2048) return 'URL must be 2048 characters or less';
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'URL must use HTTP or HTTPS protocol';
        }
        return null;
      } catch {
        return 'Please enter a valid URL';
      }
    }
  },
  utmParam: {
    maxLength: 100,
    validate: (value: string) => {
      if (value && value.length > 100) return 'UTM parameter must be 100 characters or less';
      return null;
    }
  }
};
