import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BotMessageSquare, User as UserIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { supabase } from '../lib/supabaseClient';

// Main AuthPage Component
const AuthPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Redirects a logged-in user to the dashboard
    useEffect(() => {
        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, navigate]);

    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6 justify-center">
                    <BotMessageSquare className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Mentora</h1>
                </div>
                <AuthForm />
            </div>
        </div>
    );
};

// Unified Auth Form
const AuthForm = () => {
    const [mode, setMode] = useState("signin");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [err, setErr] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signUp, signIn } = useAuth();
    const navigate = useNavigate();

    const submit = (e) => {
        e?.preventDefault();
        mode === "signin" ? handleSignin() : handleSignup();
    };

    const handleSignup = async () => {
        if (!email.trim() || !pwd.trim()) {
            setErr("Email and password are required.");
            return;
        }
        setIsSubmitting(true);
        setErr("");
        try {
            const { error } = await signUp({ email, password: pwd });
            if (error) throw error;
            alert("Success! Please check your email for a verification link.");
            setMode("signin");
        } catch (error) {
            setErr(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignin = async () => {
        if (!email.trim() || !pwd.trim()) {
            setErr("Email and password are required.");
            return;
        }
        setIsSubmitting(true);
        setErr("");
        try {
            const { error } = await signIn({ email, password: pwd });
            if (error) throw error;
            // The useEffect in AuthPage will handle the redirect on successful sign-in.
        } catch (error) {
            setErr(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="mb-3">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
                <input
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
            {mode === "signin" ? (
                <>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50">Sign In</button>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 text-center">New here?{" "}
                        <button type="button" onClick={() => { setMode("signup"); setErr(""); }} className="text-primary font-semibold underline">Create an account</button>
                    </p>
                </>
            ) : (
                <>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50">Sign Up</button>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 text-center">Already have an account?{" "}
                        <button type="button" onClick={() => { setMode("signin"); setErr(""); }} className="text-primary font-semibold underline">Sign in</button>
                    </p>
                </>
            )}
        </form>
    );
};

export default AuthPage;