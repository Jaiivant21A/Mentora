import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BotMessageSquare, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
        // Corrected div to be a single, centered container
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6 justify-center">
                    <BotMessageSquare className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold text-text-base">Mentora</h1>
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
        } catch (error) {
            setErr(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="mb-3">
                <label className="block text-sm text-text-secondary mb-1">Email</label>
                <input
                    className="w-full border border-border rounded-md px-3 py-2 bg-card text-text-base"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-1">Password</label>
                <input
                    type="password"
                    className="w-full border border-border rounded-md px-3 py-2 bg-card text-text-base"
                    value={pwd}
                    onChange={(e) => { setPwd(e.target.value); setErr(""); }}
                    required
                />
            </div>
            {err && <p className="text-sm text-red-600 mb-3" role="alert">{err}</p>}
            {mode === "signin" ? (
                <>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50">Sign In</button>
                    <p className="text-sm text-text-secondary mt-3 text-center">New here?{" "}
                        <button type="button" onClick={() => { setMode("signup"); setErr(""); }} className="text-primary font-semibold underline">Create an account</button>
                    </p>
                </>
            ) : (
                <>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50">Sign Up</button>
                    <p className="text-sm text-text-secondary mt-3 text-center">Already have an account?{" "}
                        <button type="button" onClick={() => { setMode("signin"); setErr(""); }} className="text-primary font-semibold underline">Sign in</button>
                    </p>
                </>
            )}
            <p className="text-sm text-text-secondary mt-4 text-center">
                <Link to="/" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                    <Home size={14} />
                    <span>Go back to Home</span>
                </Link>
            </p>
        </form>
    );
};

export default AuthPage;