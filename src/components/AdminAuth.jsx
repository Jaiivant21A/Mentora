import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabaseClient';
import { useAuth } from "../Context/AuthContext";
import { ShieldCheck } from "lucide-react";

const AdminAuth = () => {
  const nav = useNavigate();
  const { user, signIn } = useAuth();
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
      const { error: signInError } = await signIn({ email, password: pwd });
      if (signInError) throw signInError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;

      if (profile.is_admin) {
        nav("/dashboard", { replace: true });
      } else {
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
      <p className="text-sm text-text-secondary mb-3">
        Enter your admin credentials to sign in.
      </p>
      <div className="mb-3">
        <label className="block text-sm text-text-secondary mb-1">Email</label>
        <input
          className="w-full border border-border rounded-md px-3 py-2 bg-background text-text-base"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErr(""); }}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-text-secondary mb-1">Password</label>
        <input
          type="password"
          className="w-full border border-border rounded-md px-3 py-2 bg-background text-text-base"
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