import { useAuth } from "../Context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // This log will show us what this component sees on every render
  console.log("ProtectedRoute rendering. Status:", { isLoading: loading, hasUser: !!user });

  // 1. While the session is being checked, show a loading message.
  // This is crucial to prevent redirecting before we know the user's status.
  if (loading) {
    return <div>Loading session...</div>;
  }

  // 2. If loading is finished and there is no user, redirect to the auth page.
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 3. If loading is finished and a user exists, show the protected content.
  return children;
};

export default ProtectedRoute;