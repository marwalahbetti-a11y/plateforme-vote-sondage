import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// <ProtectedRoute> : connexion obligatoire
// <ProtectedRoute adminOnly> : réservé aux admins
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return null; // on attend la réponse de /api/me

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}