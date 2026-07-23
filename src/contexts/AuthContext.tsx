import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
  role: 'admin' | 'user';
}

export interface SignupData {
  firstName: string;
  lastName: string;
  birthday?: string;
  email: string;
  password: string;
}

interface AuthResult {
  error: string | null;
}

interface SignupResult extends AuthResult {
  needsConfirmation: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  passwordRecovery: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (data: SignupData) => Promise<SignupResult>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    let active = true;

    // Turn a Supabase session into our AuthUser by joining the profile row.
    const applySession = async (session: Session | null) => {
      if (!active) return;

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, birthday, role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!active) return;

      setUser({
        id: session.user.id,
        email: session.user.email ?? '',
        firstName: profile?.first_name ?? '',
        lastName: profile?.last_name ?? '',
        birthday: profile?.birthday ?? null,
        role: profile?.role === 'admin' ? 'admin' : 'user',
      });
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      // Defer: calling other supabase methods directly inside this callback
      // can deadlock the internal auth lock.
      setTimeout(() => applySession(session), 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signup = async ({
    firstName,
    lastName,
    birthday,
    email,
    password,
  }: SignupData): Promise<SignupResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // These become the user's metadata, which the DB trigger reads to
        // build the profiles row. Keys MUST match the trigger: first_name, last_name, birthday.
        data: { first_name: firstName, last_name: lastName, birthday: birthday ?? '' },
      },
    });
    if (error) return { error: error.message, needsConfirmation: false };
    // If "Confirm email" is ON, there is no session yet — the user must confirm first.
    return { error: null, needsConfirmation: !data.session };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPasswordRecovery(false);
  };

  const sendPasswordReset = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) setPasswordRecovery(false);
    return { error: error?.message ?? null };
  };

  const clearPasswordRecovery = () => setPasswordRecovery(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        passwordRecovery,
        login,
        signup,
        logout,
        sendPasswordReset,
        updatePassword,
        clearPasswordRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
