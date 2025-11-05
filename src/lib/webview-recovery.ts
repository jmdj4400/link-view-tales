import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RecoveryStrategy = 
  | 'deep_link_ios' 
  | 'deep_link_android' 
  | 'intent_url' 
  | 'clipboard_copy' 
  | 'manual_open'
  | 'direct_redirect';

export interface RecoveryAttempt {
  linkId: string;
  userId: string;
  strategy: RecoveryStrategy;
  success: boolean;
  platform: string;
  device: string;
  browser: string;
}

/**
 * Attempts to recover from WebView restrictions using multiple strategies
 */
export class WebViewRecovery {
  private linkId: string;
  private userId: string;
  private destUrl: string;
  private browser: string;
  private device: string;
  
  constructor(
    linkId: string, 
    userId: string, 
    destUrl: string, 
    browser: string, 
    device: string
  ) {
    this.linkId = linkId;
    this.userId = userId;
    this.destUrl = destUrl;
    this.browser = browser;
    this.device = device;
  }

  /**
   * Main recovery method - tries strategies in order
   */
  async attemptRecovery(): Promise<boolean> {
    const strategies: RecoveryStrategy[] = this.getStrategiesForPlatform();
    
    for (const strategy of strategies) {
      const success = await this.tryStrategy(strategy);
      await this.logAttempt(strategy, success);
      
      if (success) {
        return true;
      }
    }
    
    // If all strategies fail, use manual fallback
    await this.logAttempt('manual_open', false);
    return false;
  }

  /**
   * Get recovery strategies based on platform and device
   */
  private getStrategiesForPlatform(): RecoveryStrategy[] {
    if (this.device === 'iOS') {
      if (this.browser === 'Instagram') {
        return ['deep_link_ios', 'clipboard_copy'];
      }
      return ['deep_link_ios', 'clipboard_copy'];
    }
    
    if (this.device === 'Android') {
      if (this.browser === 'Instagram' || this.browser === 'TikTok') {
        return ['intent_url', 'deep_link_android', 'clipboard_copy'];
      }
      return ['intent_url', 'clipboard_copy'];
    }
    
    return ['clipboard_copy'];
  }

  /**
   * Try a specific recovery strategy
   */
  private async tryStrategy(strategy: RecoveryStrategy): Promise<boolean> {
    try {
      switch (strategy) {
        case 'deep_link_ios':
          return this.tryDeepLinkiOS();
        
        case 'deep_link_android':
          return this.tryDeepLinkAndroid();
        
        case 'intent_url':
          return this.tryIntentURL();
        
        case 'clipboard_copy':
          return await this.tryCopyToClipboard();
        
        default:
          return false;
      }
    } catch (error) {
      console.error(`Recovery strategy ${strategy} failed:`, error);
      return false;
    }
  }

  /**
   * iOS deep link (works for Instagram, Safari)
   */
  private tryDeepLinkiOS(): boolean {
    if (this.browser === 'Instagram') {
      // Instagram-specific deep link
      const deepLink = `instagram://browser/open?url=${encodeURIComponent(this.destUrl)}`;
      window.location.href = deepLink;
      
      // Fallback to Safari if Instagram doesn't respond
      setTimeout(() => {
        window.location.href = `x-safari-${this.destUrl}`;
      }, 500);
      
      return true;
    }
    
    // Generic Safari deep link
    window.location.href = `x-safari-${this.destUrl}`;
    return true;
  }

  /**
   * Android deep link
   */
  private tryDeepLinkAndroid(): boolean {
    // Try to open in Chrome
    const chromeIntent = `googlechrome://navigate?url=${encodeURIComponent(this.destUrl)}`;
    window.location.href = chromeIntent;
    
    return true;
  }

  /**
   * Android intent URL (most reliable for Android WebViews)
   */
  private tryIntentURL(): boolean {
    const intentUrl = `intent://${this.destUrl.replace(/https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
    window.location.href = intentUrl;
    
    return true;
  }

  /**
   * Copy URL to clipboard as fallback
   */
  private async tryCopyToClipboard(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(this.destUrl);
      toast.success('Link copied!', {
        description: 'Open your browser and paste the link to continue',
      });
      return true;
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = this.destUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copied!', {
          description: 'Open your browser and paste the link to continue',
        });
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }

  /**
   * Log recovery attempt to database
   */
  private async logAttempt(strategy: RecoveryStrategy, success: boolean): Promise<void> {
    try {
      await supabase.from('recovery_attempts').insert({
        link_id: this.linkId,
        user_id: this.userId,
        strategy_used: strategy,
        success,
        platform: this.getPlatform(),
        device: this.device,
        browser: this.browser,
      });
    } catch (error) {
      console.error('Failed to log recovery attempt:', error);
    }
  }

  /**
   * Get platform from browser detection
   */
  private getPlatform(): string {
    const platformMap: Record<string, string> = {
      'Instagram': 'instagram',
      'TikTok': 'tiktok',
      'Facebook': 'facebook',
      'LinkedIn': 'linkedin',
      'Twitter/X': 'twitter',
      'Snapchat': 'snapchat',
    };
    
    return platformMap[this.browser] || 'other';
  }
}
