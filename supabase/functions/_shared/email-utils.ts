import { Resend } from "https://esm.sh/resend@4.0.0";

interface EmailOptions {
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
  attempt?: number;
}

/**
 * Send email with retry logic and error handling
 * Retries once on: timeout, 429 (rate limit), or temporary errors
 */
export async function sendEmailWithRetry(
  resend: Resend,
  options: EmailOptions,
  maxRetries: number = 1
): Promise<EmailResult> {
  const { from, to, subject, html, replyTo } = options;
  
  // Validate email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const email of to) {
    if (!emailRegex.test(email)) {
      console.error(`❌ Invalid email address: ${email}`);
      return { 
        success: false, 
        error: `Invalid email address: ${email}` 
      };
    }
  }

  // Validate required fields
  if (!from || to.length === 0 || !subject || !html) {
    console.error("❌ Missing required email fields");
    return { 
      success: false, 
      error: "Missing required email fields" 
    };
  }

  let lastError: any = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 [Attempt ${attempt + 1}/${maxRetries + 1}] Sending email to ${to.join(", ")}`);
      console.log(`   Subject: ${subject}`);
      
      const response = await resend.emails.send({
        from,
        to,
        subject,
        html,
        ...(replyTo && { replyTo }),
      });

      console.log(`✅ Email sent successfully to ${to.join(", ")}`);
      return { success: true, attempt: attempt + 1 };
      
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || String(error);
      console.error(`❌ [Attempt ${attempt + 1}] Email send failed: ${errorMsg}`);
      
      // Check if we should retry
      const shouldRetry = attempt < maxRetries && (
        errorMsg.includes("timeout") ||
        errorMsg.includes("429") ||
        errorMsg.includes("rate limit") ||
        errorMsg.includes("temporary") ||
        errorMsg.includes("ETIMEDOUT") ||
        errorMsg.includes("ECONNRESET")
      );
      
      if (shouldRetry) {
        const delay = (attempt + 1) * 1000; // 1s, 2s, etc.
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      break;
    }
  }
  
  // All retries failed
  const finalError = lastError?.message || "Unknown error";
  console.error(`❌ All email attempts failed: ${finalError}`);
  
  return { 
    success: false, 
    error: finalError,
    attempt: maxRetries + 1 
  };
}

/**
 * Validate and sanitize email input
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: "Email is required" };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (trimmed.length === 0) {
    return { valid: false, error: "Email cannot be empty" };
  }
  
  if (trimmed.length > 255) {
    return { valid: false, error: "Email is too long (max 255 characters)" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }
  
  return { valid: true };
}

/**
 * Get Resend API key from environment
 */
export function getResendClient(): Resend {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }
  
  return new Resend(apiKey);
}

/**
 * Log email attempt to database
 */
export async function logEmailAttempt(
  supabase: any,
  userId: string,
  emailType: string,
  success: boolean,
  errorMessage?: string
) {
  try {
    await supabase.from('email_log').insert({
      user_id: userId,
      email_type: emailType,
      success,
      error_message: errorMessage || null,
      sent_at: success ? new Date().toISOString() : null
    });
  } catch (error) {
    console.error('⚠️ Failed to log email attempt:', error);
    // Don't throw - logging failure shouldn't break the function
  }
}
