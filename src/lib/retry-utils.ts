import { logger } from './logger';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: number[]; // HTTP status codes that should trigger retry
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [408, 429, 500, 502, 503, 504], // Timeout, Too Many Requests, Server Errors
};

/**
 * Retry a function with exponential backoff
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result or rejects after max attempts
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };
  let lastError: Error | unknown;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if this is the last attempt
      if (attempt === config.maxAttempts) {
        logger.error(`All ${config.maxAttempts} retry attempts failed`, error);
        throw error;
      }
      
      // Check if error is retryable (for HTTP errors)
      if (error?.status && !config.retryableErrors.includes(error.status)) {
        logger.warn('Non-retryable error encountered', { status: error.status, attempt });
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );
      
      logger.info(`Retry attempt ${attempt}/${config.maxAttempts} after ${delay}ms`, {
        error: error?.message,
      });
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Wrapper for Supabase function invocations with retry logic
 */
export async function retrySupabaseFunction<T>(
  invokeFn: () => Promise<{ data: T; error: any }>,
  options: RetryOptions = {}
): Promise<{ data: T; error: any }> {
  return retryWithBackoff(async () => {
    const result = await invokeFn();
    
    // Treat Supabase errors as retryable
    if (result.error) {
      const error = new Error(result.error.message);
      (error as any).supabaseError = result.error;
      throw error;
    }
    
    return result;
  }, options);
}
