import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="navbar-voty">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <i className="bi bi-bar-chart-fill"></i> Voty
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className="nav-link-voty">
            <i className="bi bi-house"></i> Accueil
          </NavLink>
          <NavLink to="/vote" className="nav-link-voty">
            <i className="bi bi-check2-square"></i> Vote
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link-voty">
              <i className="bi bi-shield-lock"></i> Admin
            </NavLink>
          )}
        </nav>

        {user ? (
          <div className="user-menu">
            <Link to="/profile" className="btn-account">
              <i className="bi bi-person-circle"></i> {user.username}
            </Link>
            <button type="button" className="btn-logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Déconnexion
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-account">
            <i className="bi bi-person-circle"></i> Account
          </Link>
        )}
      </div>
    </header>
  );
}