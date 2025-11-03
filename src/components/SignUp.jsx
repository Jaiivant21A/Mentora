import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { supabase } from '../supabaseClient';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [age, setAge] = useState('');
  const [headline, setHeadline] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [gender, setGender] = useState('');
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!email || !password) {
        setError("Email and password are required.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      const { data, error: signUpError } = await signUp({ email, password });

      // Log what is actually returned for diagnostics
      console.log("Signup raw return:", data);

      // Consistently use returned user id (for Supabase v1/v2 and your instance)
      let userId = undefined;
      if (data?.user?.id) userId = data.user.id;
      else if (data?.id) userId = data.id;
      else if (data?.session?.user?.id) userId = data.session.user.id;

      if (!userId) {
        setError(
          "User ID not found in signup response. See browser console for details: " +
            JSON.stringify(data)
        );
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          username,
          full_name: fullName,
          is_admin: false,
          avatar_url: avatarUrl,
          age: age ? parseInt(age, 10) : null,
          headline,
          experience_level: experienceLevel,
          gender,
        }
      ]);
      if (profileError) throw profileError;

      setMessage('Success! Please check your email for a verification link.');
    } catch (err) {
      setError(err.message || String(err));
      console.error('SignUp error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-card rounded-lg shadow-xl border border-border">
      <h2 className="text-2xl font-bold mb-6 text-center text-text-base">Sign Up</h2>
      {error && (
        <div className="bg-red-200 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>
      )}
      {message && (
        <div className="bg-green-200 text-green-700 p-3 rounded-md mb-4 text-sm">{message}</div>
      )}
      <div className="mb-4">
        <label className="block text-text-secondary text-sm font-semibold mb-2">Email</label>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-md"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-text-secondary text-sm font-semibold mb-2">Password</label>
        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-md"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-text-secondary text-sm font-semibold mb-2">Username</label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-text-secondary text-sm font-semibold mb-2">Full Name</label>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-text-secondary text-sm font-semibold mb-2">Avatar URL</label>
        <input
          type="text"
          placeholder="Avatar URL"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-text-secondary text-sm font-semibold mb-2">Age</label>
        <input
          type="number"
          min="0"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-text-secondary text-sm font-semibold mb-2">Headline</label>
        <input
          type="text"
          placeholder="Headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-text-secondary text-sm font-semibold mb-2">Experience Level</label>
        <input
          type="text"
          placeholder="Experience Level"
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-text-secondary text-sm font-semibold mb-2">Gender</label>
        <input
          type="text"
          placeholder="Gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-md"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignUp;
