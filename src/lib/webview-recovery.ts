import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RecoveryStrategy = 
  | 'intent_url_android' 
  | 'clipboard_copy' 
  | 'manual_instructions';

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
    // On Android, try intent URL first (this actually works!)
    if (this.device === 'Android') {
      const success = this.tryIntentURLAndroid();
      await this.logAttempt('intent_url_android', success);
      if (success) return true;
    }
    
    // Always copy to clipboard as backup
    const clipboardSuccess = await this.tryCopyToClipboard();
    await this.logAttempt('clipboard_copy', clipboardSuccess);
    
    // Return false to show manual instructions UI
    return false;
  }

  /**
   * Android Intent URL - actually opens external browser
   */
  private tryIntentURLAndroid(): boolean {
    try {
      // Parse URL to get host and path
      const url = new URL(this.destUrl);
      const host = url.host;
      const pathAndQuery = url.pathname + url.search + url.hash;
      
      // Intent URL format that opens in Chrome/default browser
      const intentUrl = `intent://${host}${pathAndQuery}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
      
      // Use location.replace to prevent back button issues
      window.location.replace(intentUrl);
      
      return true;
    } catch (error) {
      console.error('Intent URL failed:', error);
      return false;
    }
  }

  /**
   * Copy URL to clipboard
   */
  private async tryCopyToClipboard(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(this.destUrl);
      return true;
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = this.destUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      } catch (err) {
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

/**
 * Get platform-specific instructions for opening in external browser
 */
export function getOpenInBrowserInstructions(browser: string, device: string): {
  title: string;
  steps: string[];
  buttonText: string;
} {
  if (device === 'iOS') {
    if (browser === 'Instagram') {
      return {
        title: 'Open in Safari',
        steps: [
          'Tap the ••• menu in the top right',
          'Select "Open in Safari"',
        ],
        buttonText: 'Copy Link Instead',
      };
    }
    if (browser === 'TikTok') {
      return {
        title: 'Open in Safari',
        steps: [
          'Tap the ••• menu',
          'Select "Open in browser"',
        ],
        buttonText: 'Copy Link Instead',
      };
    }
    if (browser === 'Facebook') {
      return {
        title: 'Open in Safari',
        steps: [
          'Tap the ••• menu at the bottom',
          'Select "Open in Safari"',
        ],
        buttonText: 'Copy Link Instead',
      };
    }
    return {
      title: 'Open in Safari',
      steps: [
        'Look for a menu icon (•••)',
        'Select "Open in Safari" or "Open in Browser"',
      ],
      buttonText: 'Copy Link Instead',
    };
  }
  
  // Android - intent URL usually works automatically
  return {
    title: 'Opening in Browser...',
    steps: [
      'If nothing happens, tap the ⋮ menu',
      'Select "Open in Chrome" or "Open in Browser"',
    ],
    buttonText: 'Copy Link',
  };
}
