import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            const { error: signUpError } = await signUp({ email, password });
            if (signUpError) throw signUpError;
            setMessage('Success! Please check your email for a verification link.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 bg-card rounded-lg shadow-xl border border-border">
            <h2 className="text-2xl font-bold mb-6 text-center text-text-base">Sign Up</h2>
            {error && (
                <div className="bg-red-200 text-red-700 p-3 rounded-md mb-4 text-sm">
                    {error}
                </div>
            )}
            {message && (
                <div className="bg-green-200 text-green-700 p-3 rounded-md mb-4 text-sm">
                    {message}
                </div>
            )}
            <div className="mb-4">
                <label className="block text-text-secondary text-sm font-semibold mb-2">Email</label>
                <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base"
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block text-text-secondary text-sm font-semibold mb-2">Password</label>
                <input
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base"
                    required
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