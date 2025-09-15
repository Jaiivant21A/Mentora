// src/pages/AdminAuth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabaseClient'; // Import supabase
import { useAuth } from "../Context/AuthContext"; // Import useAuth to access user
import { ShieldCheck } from "lucide-react";

const AdminAuth = () => {
  const nav = useNavigate();
  const { user, signIn } = useAuth(); // Use the signIn function from AuthContext
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = (e) => {
    e?.preventDefault();
    handleAdminLogin();
  };

  const handleAdminLogin = async () => {
    if (!email.trim() || !pwd.trim()) {
      return setErr("Email and password are required.");
    }

    setIsSubmitting(true);
    setErr("");

    try {
      // Step 1: Use Supabase to sign in the user.
      const { error: signInError } = await signIn({ email, password: pwd });
      if (signInError) throw signInError;

      // The user is authenticated. Now we check if they are an admin.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id) // Use the user's ID to fetch their profile
        .single();
      
      if (profileError) throw profileError;

      // Step 2: Check the is_admin flag.
      if (profile.is_admin) {
        // User is an admin, set their session or context state as needed.
        // The useAuth hook should handle the redirect to dashboard.
        nav("/dashboard", { replace: true });
      } else {
        // User is not an admin, sign them out and show an error.
        await supabase.auth.signOut();
        setErr("You do not have administrative privileges.");
      }

    } catch (error) {
      setErr(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Enter your admin credentials to sign in.
      </p>
      <div className="mb-3">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
        <input
          className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErr(""); }}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Password</label>
        <input
          type="password"
          className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={pwd}
          onChange={(e) => { setPwd(e.target.value); setErr(""); }}
          required
        />
      </div>
      {err && <p className="text-sm text-red-600 mb-3" role="alert">{err}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50"
      >
        {isSubmitting ? "Signing in..." : "Admin Sign In"}
      </button>
    </form>
  );
};

export default AdminAuth;