// app.js : serveur principal (Express + sessions)
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// 1. Lire les données JSON et les formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Sessions : se souvenir de l'utilisateur connecté
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2 // 2 heures
  }
}));

// 3. Fichiers statiques (CSS, JS client)
app.use(express.static(path.join(__dirname, 'public')));

// 4. Route de test
// Pages HTML
app.get('/', (req, res) => {
  res.redirect('/login');
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/profile-page', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});
// Routes de Marwa (authentification)
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);
// 5. Route inexistante (404)
app.use((req, res) => {
  if (req.accepts('html') && !req.path.startsWith('/api')) {
    return res.status(404).send('<h2>Page introuvable (404)</h2><a href="/login">Retour à la connexion</a>');
  }
  res.status(404).json({ message: 'Route introuvable' });
});

// 6. Erreur interne (500)
app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({ message: 'Base de données indisponible, réessayez plus tard' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Cette valeur existe déjà' });
  }
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// 7. Démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});