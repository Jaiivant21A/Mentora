// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './Context/AuthContext';
import { ThemeProvider } from './context/ThemeContext.jsx'; // Import the ThemeProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Provides theme state and functionality to the entire app */}
    <ThemeProvider> 
      {/* Provides auth state (user, login, etc.) to the entire app. */}
      <AuthProvider>
        {/* Your main app component where all pages are rendered. */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);