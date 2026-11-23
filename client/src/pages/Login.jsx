import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const reponse = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // nécessaire pour le cookie de session
        body: JSON.stringify(form)
      });
      const data = await reponse.json();

     if (reponse.ok) {
  setUser(data.user); // la Navbar se met à jour tout de suite
  setMessage({ type: 'success', text: 'Connexion réussie, redirection...' });
  setTimeout(() => {
    navigate(data.user.role === 'admin' ? '/admin' : '/');
  }, 800);
}else {
        setMessage({ type: 'danger', text: data.message });
      }
    } catch (erreur) {
      setMessage({ type: 'danger', text: 'Impossible de contacter le serveur' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <i className="bi bi-box-arrow-in-right"></i>
        </div>
        <h2>Connexion</h2>
        <p className="auth-subtitle">Content de vous revoir sur Voty.</p>

        {message && (
          <div className={`message message-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <div className="input-group-voty">
            <i className="bi bi-envelope"></i>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="password">Mot de passe</label>
          <div className="input-group-voty">
            <i className="bi bi-lock"></i>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Votre mot de passe"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Afficher ou masquer le mot de passe"
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-footer">
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}