import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TIER_MAP = {
  'prod_TLc8xSNHXDJoLm': 'pro',
  'prod_TLc9WRMahXD66M': 'business',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const navigate = useNavigate();

  const checkSubscription = async (currentSession: Session | null, force: boolean = false) => {
    if (!currentSession) {
      setSubscriptionStatus(null);
      return;
    }

    // Rate limiting: Don't check more than once every 30 seconds unless forced
    const now = Date.now();
    if (!force && now - lastCheckTime < 30000) {
      return;
    }

    try {
      setLastCheckTime(now);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Only set default status on first check, not on rate limit errors
      if (!subscriptionStatus) {
        setSubscriptionStatus({ subscribed: false, product_id: null, subscription_end: null });
      }
    }
  };

  const refreshSubscription = async () => {
    await checkSubscription(session, true);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession) {
        setTimeout(() => {
          checkSubscription(currentSession);
        }, 0);
      } else {
        setSubscriptionStatus(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      
      if (currentSession) {
        setTimeout(() => {
          checkSubscription(currentSession);
        }, 0);
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
    navigate('/');
    toast.success('Signed out successfully');
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
