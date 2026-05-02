import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getAccessToken } from '../../services/api';

export default function PrivateRoute({ roles }) {
  const { isAuthenticated, user } = useAuthStore();

  const hasAccessToken = Boolean(getAccessToken());

  if (!isAuthenticated) {
    if (hasAccessToken) {
      return null;
    }

    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}