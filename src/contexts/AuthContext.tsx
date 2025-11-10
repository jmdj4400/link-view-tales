import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { retrySupabaseFunction } from "@/lib/retry-utils";

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  signUp: (email: string, password: string, handle: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  resendVerificationEmail: () => Promise<{ error: any }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TIER_MAP = {
  'prod_TLc8xSNHXDJoLm': 'pro',
  'prod_TLc9WRMahXD66M': 'business',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Verify React hooks are available
  React.useEffect(() => {
    console.log('[AuthProvider] Mounted - React version:', React.version);
  }, []);

  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<SubscriptionStatus | null>(null);
  const [lastCheckTime, setLastCheckTime] = React.useState<number>(0);
  const [isChecking, setIsChecking] = React.useState(false);

  const checkSubscription = async (currentSession: Session | null, force: boolean = false) => {
    if (!currentSession) {
      setSubscriptionStatus(null);
      return;
    }

    // Prevent concurrent calls
    if (isChecking) {
      return;
    }

    // Rate limiting: Don't check more than once every 30 seconds unless forced
    const now = Date.now();
    if (!force && now - lastCheckTime < 30000) {
      return;
    }

    try {
      setIsChecking(true);
      setLastCheckTime(now);
      
      // Use retry logic for subscription check
      const result = await retrySupabaseFunction(
        () => supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
          },
        }),
        { maxAttempts: 2, initialDelay: 1000 }
      );

      if (result.error) throw result.error;
      setSubscriptionStatus(result.data);
    } catch (error) {
      logger.error('Error checking subscription', error);
      // Only set default status on first check, not on rate limit errors
      if (!subscriptionStatus) {
        setSubscriptionStatus({ subscribed: false, product_id: null, subscription_end: null });
      }
    } finally {
      setIsChecking(false);
    }
  };

  const refreshSubscription = async () => {
    await checkSubscription(session, true);
  };

  React.useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;
      
      logger.debug('Auth state change', { event, userId: currentSession?.user?.id });
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Log session events
      if (event === 'SIGNED_IN' && currentSession) {
        logger.logAuthEvent({
          eventType: 'session_refresh',
          status: 'success',
          userId: currentSession.user.id,
          metadata: { event },
        });
      } else if (event === 'TOKEN_REFRESHED') {
        logger.logAuthEvent({
          eventType: 'session_refresh',
          status: 'success',
          userId: currentSession?.user?.id,
          metadata: { event: 'token_refreshed' },
        });
      }
      
      if (currentSession) {
        checkSubscription(currentSession);
      } else {
        setSubscriptionStatus(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      
      if (currentSession) {
        checkSubscription(currentSession);
      }
    });

    // Check subscription every 5 minutes
    const subscriptionInterval = setInterval(() => {
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (currentSession) {
          checkSubscription(currentSession);
        }
      });
    }, 300000); // 5 minutes

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(subscriptionInterval);
    };
  }, []);

  const signUp = async (email: string, password: string, handle: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    logger.info('Sign up attempt', { email, handle });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          handle,
          name,
        },
      },
    });
    
    if (error) {
      logger.error('Sign up failed', error, { email, handle });
      logger.logAuthEvent({
        eventType: 'signup',
        status: 'failure',
        errorCode: error.name,
        errorMessage: error.message,
        metadata: { email, handle },
      });
    } else {
      logger.info('Sign up successful', { email, userId: data.user?.id });
      logger.logAuthEvent({
        eventType: 'signup',
        status: 'success',
        userId: data.user?.id,
        metadata: { email, handle },
      });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    logger.info('Sign in attempt', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      logger.error('Sign in failed', error, { email });
      logger.logAuthEvent({
        eventType: 'signin',
        status: 'failure',
        errorCode: error.name,
        errorMessage: error.message,
        metadata: { email, reason: error.message },
      });
    } else {
      logger.info('Sign in successful', { email, userId: data.user?.id });
      logger.logAuthEvent({
        eventType: 'signin',
        status: 'success',
        userId: data.user?.id,
        metadata: { email },
      });
    }
    
    return { error };
  };

  const signOut = async () => {
    const userId = user?.id;
    logger.info('Sign out attempt', { userId });
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error('Sign out failed', error, { userId });
      logger.logAuthEvent({
        eventType: 'signout',
        status: 'failure',
        userId,
        errorCode: error.name,
        errorMessage: error.message,
      });
    } else {
      logger.info('Sign out successful', { userId });
      logger.logAuthEvent({
        eventType: 'signout',
        status: 'success',
        userId,
      });
    }
    
    setSubscriptionStatus(null);
    window.location.href = '/';
    toast.success('Signed out successfully');
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      const error = { message: 'No email found' };
      logger.warn('Resend verification failed: no email', { userId: user?.id });
      return { error };
    }

    logger.info('Resend verification email attempt', { email: user.email, userId: user.id });

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) {
        logger.error('Resend verification failed', error, { email: user.email });
        logger.logAuthEvent({
          eventType: 'email_verification',
          status: 'failure',
          userId: user.id,
          errorCode: error.name,
          errorMessage: error.message,
          metadata: { email: user.email },
        });
      } else {
        logger.info('Resend verification successful', { email: user.email });
        logger.logAuthEvent({
          eventType: 'email_verification',
          status: 'success',
          userId: user.id,
          metadata: { email: user.email },
        });
      }
      
      return { error };
    } catch (error) {
      logger.error('Failed to resend verification email', error);
      logger.logAuthEvent({
        eventType: 'email_verification',
        status: 'failure',
        userId: user.id,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      return { error };
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    logger.info('Password reset request', { email });
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        logger.error('Password reset request failed', error, { email });
        logger.logAuthEvent({
          eventType: 'password_reset_request',
          status: 'failure',
          errorCode: error.name,
          errorMessage: error.message,
          metadata: { email },
        });
      } else {
        logger.info('Password reset email sent', { email });
        logger.logAuthEvent({
          eventType: 'password_reset_request',
          status: 'success',
          metadata: { email },
        });
      }
      
      return { error };
    } catch (error) {
      logger.error('Failed to send reset password email', error);
      logger.logAuthEvent({
        eventType: 'password_reset_request',
        status: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: { email },
      });
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    const userId = user?.id;
    logger.info('Password update attempt', { userId });
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        logger.error('Password update failed', error, { userId });
        logger.logAuthEvent({
          eventType: 'password_reset_complete',
          status: 'failure',
          userId,
          errorCode: error.name,
          errorMessage: error.message,
        });
      } else {
        logger.info('Password updated successfully', { userId });
        logger.logAuthEvent({
          eventType: 'password_reset_complete',
          status: 'success',
          userId,
        });
      }
      
      return { error };
    } catch (error) {
      logger.error('Failed to update password', error);
      logger.logAuthEvent({
        eventType: 'password_reset_complete',
        status: 'failure',
        userId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        subscriptionStatus,
        signUp,
        signIn,
        signOut,
        refreshSubscription,
        resendVerificationEmail,
        resetPasswordForEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
