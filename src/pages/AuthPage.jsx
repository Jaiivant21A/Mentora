import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BotMessageSquare, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

const HEADLINE_OPTIONS = [
  "Aspiring Developer", "Student", "Working Professional", "Job Seeker", "Graduate"
];
const EXPERIENCE_OPTIONS = [
  "Beginner", "Intermediate", "Advanced", "Expert"
];
const GENDER_OPTIONS = [
  "Prefer not to say", "Male", "Female", "Other"
];

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
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

const AuthForm = () => {
  const { signUp, signIn, signInWithGitHub } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [headline, setHeadline] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [gender, setGender] = useState("");
  const [err, setErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
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
      const { user, error: signUpError } = await signUp({ email, password: pwd });
      if (signUpError) throw signUpError;

      const { error: profileError } = await supabase.from('profiles').insert([{
        id: user.id,
        full_name: fullName,
        is_admin: false,
        age: age ? parseInt(age, 10) : null,
        headline,
        experience_level: experienceLevel,
        gender
      }]);

      if (profileError) throw profileError;

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

  const handleGithubLogin = async () => {
    setErr('');
    const { error } = await signInWithGitHub();
    if (error) setErr(error.message);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm text-text-secondary mb-1">Email</label>
        <input
          className="w-full border border-border rounded-md px-3 py-2 bg-card text-text-base"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErr(''); }}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-text-secondary mb-1">Password</label>
        <input
          type="password"
          className="w-full border border-border rounded-md px-3 py-2 bg-card text-text-base"
          value={pwd}
          onChange={(e) => { setPwd(e.target.value); setErr(''); }}
          required
        />
      </div>

      {mode === "signup" && (
        <>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border border-border rounded-md px-3 py-2 bg-card text-text-base"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Age</label>
            <input
              type="number"
              min="0"
              className="w-full border border-border rounded-md px-3 py-2 bg-card text-text-base"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Headline</label>
            <select
              className="w-full border border-border rounded-md px-3 py-2 bg-card text-text-base"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
            >
              <option value="">Select...</option>
              {HEADLINE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Experience Level</label>
            <select
              className="w-full border border-border rounded-md px-3 py-2 bg-card text-text-base"
              value={experienceLevel}
              onChange={e => setExperienceLevel(e.target.value)}
            >
              <option value="">Select...</option>
              {EXPERIENCE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Gender</label>
            <select
              className="w-full border border-border rounded-md px-3 py-2 bg-card text-text-base"
              value={gender}
              onChange={e => setGender(e.target.value)}
            >
              <option value="">Select...</option>
              {GENDER_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50"
      >
        {mode === "signin" ? "Sign In" : "Sign Up"}
      </button>

      <button
        type="button"
        onClick={handleGithubLogin}
        className="w-full mt-3 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
      >
        Continue with GitHub
      </button>

      {mode === "signin" ? (
        <p className="text-sm text-text-secondary mt-3 text-center">
          New here?{" "}
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErr("");
            }}
            className="text-primary font-semibold underline"
          >
            Create an account
          </button>
        </p>
      ) : (
        <p className="text-sm text-text-secondary mt-3 text-center">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErr("");
            }}
            className="text-primary font-semibold underline"
          >
            Sign in
          </button>
        </p>
      )}

      <p className="text-sm text-text-secondary mt-4 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1 hover:text-primary transition-colors"
        >
          <Home size={14} />
          <span>Go back to Home</span>
        </Link>
      </p>
    </form>
  );
};

export default AuthPage;
