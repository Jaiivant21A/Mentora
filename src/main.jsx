import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  // Helps find potential problems during development.
  <React.StrictMode>
    {/* Enables all routing features for your app. */}
    <BrowserRouter>
      {/* Provides auth state (user, login, etc.) to the entire app. */}
      <AuthProvider>
        {/* Your main app component where all pages are rendered. */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);