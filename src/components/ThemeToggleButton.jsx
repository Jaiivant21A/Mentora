// src/components/ThemeToggleButton.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react'; // Assuming you have lucide-react installed

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggleButton;