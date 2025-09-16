import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error: signInError } = await signIn({ email, password });
            if (signInError) throw signInError;
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 bg-card rounded-lg shadow-xl border border-border">
            <h2 className="text-2xl font-bold mb-6 text-center text-text-base">Login</h2>
            {error && (
                <div className="bg-red-200 text-red-700 p-3 rounded-md mb-4 text-sm">
                    {error}
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
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default Login;