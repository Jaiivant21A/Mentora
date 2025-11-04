import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        if (confirm("Are you sure you want to sign out?")) {
            await signOut();
            navigate('/auth', { replace: true });
        }
    };

    return (
        <div className="p-6 bg-background text-text-base min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <section className="mb-8 max-w-lg mx-auto p-6 bg-card rounded-lg shadow-md border border-border">
                <h2 className="text-xl font-semibold text-text-base mb-2">Appearance</h2>
                <div className="flex items-center justify-between">
                    <p className="text-text-secondary">Toggle Dark Mode</p>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-md bg-button-secondary text-text-base transition-colors duration-200"
                        aria-label="Toggle dark mode"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </section>

            <hr className="border-border my-8 max-w-lg mx-auto" />

            <section className="mb-8 max-w-lg mx-auto p-6 bg-card rounded-lg shadow-md border border-border">
                <h2 className="text-xl font-semibold text-text-base mb-2">About Us</h2>
                <p className="text-text-secondary mb-2">
                    Mentora is a smart mentor application designed to help you prepare for technical interviews.
                    It offers a variety of AI personas, allowing you to simulate conversations and practice your
                    skills in a supportive, interactive environment.
                </p>
                <p className="text-text-secondary">
                    Our goal is to make interview preparation accessible and effective for everyone, providing
                    you with the confidence to succeed.
                </p>
            </section>

            <hr className="border-border my-8 max-w-lg mx-auto" />

            <section className="max-w-lg mx-auto p-6 bg-card rounded-lg shadow-md border border-border">
                <h2 className="text-xl font-semibold text-text-base mb-2">Account</h2>
                <button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                    Sign Out
                </button>
                <p className="text-text-secondary text-sm mt-2">
                    This will end your current session and return you to the login page.
                </p>
            </section>
        </div>
    );
}