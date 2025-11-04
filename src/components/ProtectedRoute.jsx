import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    console.log("ProtectedRoute rendering. Status:", { isLoading: loading, hasUser: !!user });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-text-secondary">
                Loading session...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;