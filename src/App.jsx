import { Routes, Route, Navigate, BrowserRouter as Router } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Public Pages
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

// Protected Pages
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import GoalsPage from "./pages/GoalsPage";
import ResourcesPage from "./pages/ResourcesPage";
import InterviewsPage from "./pages/InterviewsPage";
import InterviewSession from "./pages/InterviewSession";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from './pages/AdminPage'; // Import the new AdminPage

export default function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {user && <Navbar />} {/* Only show Navbar if user is logged in */}
        <main className="flex-grow">
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* --- Protected Routes --- */}
            {/* All routes inside this wrapper require a logged-in user */}
            <Route
              element={
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
              <Route path="/chat/:personaId" element={<ChatPage />} />
              
              {/* This is the new AdminPage route */}
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* --- 404 Not Found Route --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}