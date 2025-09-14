// src/pages/SettingsPage.jsx
import { useEffect, useState } from "react";

const THEME_KEY = "mentora-theme";
const CLEAR_KEYS = [
  "mentora-session",
  "mentora-users",
  "mentora-goals",
  "mentora-interviews",
  "mentora-goals-prefs",
];

export default function SettingsPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const clearAll = () => {
    if (!confirm("Clear all local demo data and sign out?")) return;
    CLEAR_KEYS.forEach((k) => localStorage.removeItem(k));
    location.href = "/";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Theme</h2>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-md border ${theme === "light" ? "bg-gray-100" : ""}`}
            onClick={() => setTheme("light")}
            aria-pressed={theme === "light"}
          >
            Light
          </button>
          <button
            className={`px-4 py-2 rounded-md border ${theme === "dark" ? "bg-gray-800 text-white" : ""}`}
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
          >
            Dark
          </button>
          <button
            className="px-4 py-2 rounded-md border"
            onClick={() => setTheme("light")}
          >
            Reset
          </button>
        </div>
        <p className="text-gray-600 text-sm mt-2">
          Theme is saved locally and applied to the root element.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Data</h2>
        <button
          onClick={clearAll}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Clear demo data
        </button>
        <p className="text-gray-600 text-sm mt-2">
          Removes local users, session, goals, interviews and preferences.
        </p>
      </section>
    </div>
  );
}
