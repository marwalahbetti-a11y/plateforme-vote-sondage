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
app.get('/', (req, res) => {
  res.send('Le serveur fonctionne ✅');
});
// Routes de Marwa (authentification)
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);
// 5. Route inexistante (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// 6. Erreur interne (500)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// 7. Démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});