
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authSchema } from '@/lib/validations';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: { shop_name?: string; shop_address?: string; shop_phone?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Validate input
      authSchema.parse({ email, password });
    } catch (validationError: any) {
      return { error: { message: validationError.issues?.[0]?.message || 'Invalid input' } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle email not confirmed error
    if (error && error.message.includes('Email not confirmed')) {
      return { 
        error: { 
          message: 'Please check your email and click the confirmation link before signing in.' 
        } 
      };
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Validate input
      authSchema.parse({ email, password });
    } catch (validationError: any) {
      return { error: { message: validationError.issues?.[0]?.message || 'Invalid input' } };
    }

    // Simple signup without email confirmation
    // The limitation will be enforced at the Supabase project level
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error && error.message.includes('Signups not allowed')) {
      return { 
        error: { 
          message: 'Registration is closed. Maximum number of users has been reached.' 
        } 
      };
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
