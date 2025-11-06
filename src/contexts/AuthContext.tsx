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
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
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
    
    const { error } = await supabase.auth.signUp({
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
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSubscriptionStatus(null);
    window.location.href = '/';
    toast.success('Signed out successfully');
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      return { error: { message: 'No email found' } };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      return { error };
    } catch (error) {
      logger.error('Failed to resend verification email', error);
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
