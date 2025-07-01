import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginDemo: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for demo user in localStorage
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      const demoData = JSON.parse(demoUser);
      // Create a proper User object for demo mode
      const demoUserObj = {
        id: 'demo-user-id',
        email: 'demo@example.com',
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: { name: demoData.name },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: '',
        phone: '',
        confirmed_at: new Date().toISOString()
      } as User;
      
      setUser(demoUserObj);
      setIsDemoUser(true);
      setIsLoading(false);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsDemoUser(false);
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
  };

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw error;
    }

    toast({
      title: "Registration successful",
      description: "Please check your email to verify your account.",
    });
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const loginDemo = async (name: string) => {
    const demoUserData = {
      id: 'demo-user-id',
      name: name
    };

    localStorage.setItem('demoUser', JSON.stringify(demoUserData));
    
    const demoUserObj = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: { name },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      role: '',
      phone: '',
      confirmed_at: new Date().toISOString()
    } as User;
    
    setUser(demoUserObj);
    setIsDemoUser(true);

    // Remove dummy data - let users start fresh
    localStorage.removeItem('demoTasks');

    toast({
      title: "Demo mode activated",
      description: `Welcome ${name}! You're now in demo mode. Start by adding your first task!`,
    });
  };

  const logout = async () => {
    if (isDemoUser) {
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoTasks');
      setUser(null);
      setIsDemoUser(false);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    isDemoUser,
    login,
    register,
    loginWithGoogle,
    loginDemo,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
