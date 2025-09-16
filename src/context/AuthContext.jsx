// src/Context/AuthContext.js

import { useState, createContext, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      // First, get the current session immediately
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        setLoading(false);
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          // Fetch the user's admin status
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', currentUser.id)
            .single();

          if (profileError) {
            console.error('Error fetching admin status:', profileError);
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

    fetchSession();

    // Set up the listener for future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        // Re-fetch admin status on sign-in or sign-out
        if (currentUser) {
          supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', currentUser.id)
            .single()
            .then(({ data: profile, error }) => {
              if (error) {
                console.error('Error fetching admin status on auth change:', error);
                setIsAdmin(false);
              } else {
                setIsAdmin(profile?.is_admin || false);
              }
            });
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // The empty dependency array is correct here

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