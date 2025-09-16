import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// import { BrowserRouter } from "react-router-dom"; // This is no longer needed
import { AuthProvider } from "./Context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  // Helps find potential problems during development.
  <React.StrictMode>
    {/* Provides auth state (user, login, etc.) to the entire app. */}
    <AuthProvider>
      {/* Your main app component where all pages are rendered. */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);