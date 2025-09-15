import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import GoalsPage from "./pages/GoalsPage";
import ResourcesPage from "./pages/ResourcesPage";
import InterviewsPage from "./pages/InterviewsPage";
import InterviewSession from "./pages/InterviewSession";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      {/* Accessible to everyone, even if not logged in. */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* --- Protected Routes --- */}
      {/* All routes inside here require the user to be logged in. */}
      <Route
        element={
          // This is the layout route that wraps all protected pages.
          <ProtectedRoute>
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/interview/:sessionId" element={<InterviewSession />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* Dynamic route that accepts a personaId parameter. */}
        <Route path="/chat/:personaId" element={<ChatPage />} />
      </Route>

      {/* --- 404 Not Found Route --- */}
      {/* Catches any URL that doesn't match the routes above. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}