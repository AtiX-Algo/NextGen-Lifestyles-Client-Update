import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleRedirectMap = {
  admin: '/admin-dashboard',
  delivery_man: '/delivery-dashboard',
  customer: '/dashboard',
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // 1️⃣ Not logged in → login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Logged in but role not allowed → redirect based on role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath = roleRedirectMap[user.role] || '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // ✅ Access allowed
  return children;
};

export default ProtectedRoute;
