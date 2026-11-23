import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const [loading, setLoading] = useState(false);

  // Met à jour le champ modifié
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const reponse = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await reponse.json();

      if (reponse.ok) {
        setMessage({ type: 'success', text: 'Inscription réussie, redirection...' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
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
          <i className="bi bi-person-plus-fill"></i>
        </div>
        <h2>Créer un compte</h2>
        <p className="auth-subtitle">Rejoignez Voty et donnez votre avis en direct.</p>

        {message && (
          <div className={`message message-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Nom d'utilisateur</label>
          <div className="input-group-voty">
            <i className="bi bi-person"></i>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="marwa"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="6 caractères minimum"
              value={form.password}
              onChange={handleChange}
              minLength={6}
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
            {loading ? 'Création en cours...' : "S'inscrire"}
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}