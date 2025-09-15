import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext'; // To handle signing out

// Key for storing the theme choice in local storage.
const THEME_KEY = "mentora-theme";

export default function SettingsPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const { signOut } = useAuth(); // Get the signOut function from our context
  const navigate = useNavigate();

  // Effect to apply the theme to the app.
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Securely sign the user out and redirect them.
  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut();
      navigate('/auth', { replace: true }); // Redirect to login page
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>

      {/* --- About Us Section --- */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">About Us</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Mentora is a smart mentor application designed to help you prepare for technical interviews.
          It offers a variety of AI personas, allowing you to simulate conversations and practice your
          skills in a supportive, interactive environment.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Our goal is to make interview preparation accessible and effective for everyone, providing
          you with the confidence to succeed.
        </p>
      </section>

      {/* Horizontal Separator */}
      <hr className="border-gray-200 dark:border-gray-700 my-8" />

      {/* --- Account Section --- */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Account</h2>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Sign Out
        </button>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          This will end your current session and return you to the login page.
        </p>
      </section>
    </div>
  );
}