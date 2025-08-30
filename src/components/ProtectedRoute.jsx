import { Navigate, useLocation } from 'react-router-dom';
import { isAuthed } from '../services/session';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return children;
};

export default ProtectedRoute;
