/**
 * Production-safe logger that prevents sensitive information leakage
 * In production: logs are silent or sent to monitoring service
 * In development: full console logging with context
 */

import { supabase } from '@/integrations/supabase/client';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

export type AuthEventType = 
  | 'signup' 
  | 'signin' 
  | 'signout' 
  | 'password_reset_request' 
  | 'password_reset_complete' 
  | 'email_verification' 
  | 'session_refresh' 
  | 'auth_error';

export type AuthEventStatus = 'success' | 'failure' | 'pending';

interface AuthLogData {
  eventType: AuthEventType;
  status: AuthEventStatus;
  userId?: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private sanitize(data: any): any {
    if (!data) return data;
    
    const sensitiveKeys = ['password', 'token', 'secret', 'apikey', 'api_key', 'access_token', 'refresh_token'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      Object.keys(sanitized).forEach(key => {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitize(sanitized[key]);
        }
      });
      return sanitized;
    }
    
    return data;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (this.isDevelopment) {
      const sanitizedContext = context ? this.sanitize(context) : undefined;
      const timestamp = new Date().toISOString();
      
      switch (level) {
        case 'error':
          console.error(`[${timestamp}] ERROR:`, message, sanitizedContext);
          break;
        case 'warn':
          console.warn(`[${timestamp}] WARN:`, message, sanitizedContext);
          break;
        case 'info':
          console.info(`[${timestamp}] INFO:`, message, sanitizedContext);
          break;
        case 'debug':
          console.debug(`[${timestamp}] DEBUG:`, message, sanitizedContext);
          break;
      }
    } else {
      // In production, you could send to a monitoring service like Sentry
      // For now, we'll just silently ignore logs
      // TODO: Integrate with error monitoring service
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        name: error.name,
      } : error,
    };
    this.log('error', message, errorContext);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  /**
   * Log authentication events to database for security monitoring
   * This runs asynchronously and never blocks the auth flow
   */
  async logAuthEvent(data: AuthLogData) {
    const sanitizedMetadata = this.sanitize(data.metadata || {});
    
    // Always log to console in development
    if (this.isDevelopment) {
      console.log('[AUTH EVENT]', {
        eventType: data.eventType,
        status: data.status,
        userId: data.userId || 'anonymous',
        errorCode: data.errorCode,
        timestamp: new Date().toISOString(),
      });
    }

    // Attempt to persist to database (non-blocking)
    try {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
      
      await supabase.from('auth_logs').insert({
        user_id: data.userId || null,
        event_type: data.eventType,
        status: data.status,
        error_code: data.errorCode || null,
        error_message: data.errorMessage || null,
        metadata: sanitizedMetadata,
        user_agent: userAgent,
      });
    } catch (error) {
      // Silently fail - don't let logging errors break auth flow
      if (this.isDevelopment) {
        console.warn('[AUTH LOGGING ERROR]', error);
      }
    }
  }
}

export const logger = new Logger();
