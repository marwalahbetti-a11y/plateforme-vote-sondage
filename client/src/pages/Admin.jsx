import { useAuth } from '../context/AuthContext.jsx';

export default function Admin() {
  const { user } = useAuth();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Espace administrateur</h2>
        <p className="auth-subtitle">Bienvenue {user.username}. La gestion des sondages arrivera ici.</p>
      </div>
    </div>
  );
}