import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    password: ''
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const reponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = await reponse.json();
      if (reponse.ok) {
        setUser(data.user);
        setForm({ ...form, password: '' });
        setMessage({ type: 'success', text: 'Profil mis à jour.' });
      } else {
        setMessage({ type: 'danger', text: data.message });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Impossible de contacter le serveur' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon"><i className="bi bi-person-gear"></i></div>
        <h2>Mon profil</h2>
        <p className="auth-subtitle">
          Rôle : {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
        </p>

        {message && <div className={`message message-${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Nom d'utilisateur</label>
          <div className="input-group-voty">
            <i className="bi bi-person"></i>
            <input id="username" name="username" type="text"
              value={form.username} onChange={handleChange} required />
          </div>

          <label htmlFor="email">Email</label>
          <div className="input-group-voty">
            <i className="bi bi-envelope"></i>
            <input id="email" name="email" type="email"
              value={form.email} onChange={handleChange} required />
          </div>

          <label htmlFor="password">Nouveau mot de passe (optionnel)</label>
          <div className="input-group-voty">
            <i className="bi bi-lock"></i>
            <input id="password" name="password" type="password"
              placeholder="Laisser vide pour ne pas changer"
              value={form.password} onChange={handleChange} minLength={6} />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}