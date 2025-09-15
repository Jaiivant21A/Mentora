// src/Context/AuthContext.js

import { useState, createContext, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // This function handles the logic for a user session
    const handleSession = async (session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', currentUser.id)
            .single();

          if (error) {
            console.error('Error fetching admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(profile?.is_admin || false);
          }
        } catch (error) {
          console.error('Error fetching admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    // First, check for an existing session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Then, listen for future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  const signIn = async (credentials) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    return { data, error };
  };

  const signUp = async (credentials) => {
    const { data, error } = await supabase.auth.signUp(credentials);
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}