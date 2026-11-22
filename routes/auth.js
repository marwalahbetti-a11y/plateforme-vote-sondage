// routes/auth.js : inscription, connexion, déconnexion, profil (Marwa)
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

const { estConnecte, estAdmin } = require('../middleware/auth');


// POST /register : créer un compte
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Champs obligatoires
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    // 2. Format de l'email
    const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValide) {
      return res.status(400).json({ message: "Format d'email invalide" });
    }

    // 3. Longueur du mot de passe
    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // 4. Email ou username déjà utilisé ?
    const [existants] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existants.length > 0) {
      return res.status(409).json({ message: "Cet email ou ce nom d'utilisateur est déjà utilisé" });
    }

    // 5. Hacher le mot de passe
    const motDePasseHache = await bcrypt.hash(password, 10);

    // 6. Insérer dans la base (le rôle 'user' est mis par défaut)
    const [resultat] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, motDePasseHache]
    );

    res.status(201).json({
      message: 'Inscription réussie',
      userId: resultat.insertId
    });
  } catch (erreur) {
    console.error('Erreur register :', erreur);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});
// POST /login : se connecter
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Champs obligatoires
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe obligatoires' });
    }

    // 2. Chercher l'utilisateur
    const [lignes] = await db.query(
      'SELECT id, username, email, password, role FROM users WHERE email = ?',
      [email]
    );

    // 3. Message volontairement identique si l'email ou le mot de passe est faux
    if (lignes.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const utilisateur = lignes[0];

    // 4. Comparer avec le hash bcrypt
    const motDePasseCorrect = await bcrypt.compare(password, utilisateur.password);
    if (!motDePasseCorrect) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // 5. Créer la session (on ne met JAMAIS le mot de passe dedans)
    req.session.user = {
      id: utilisateur.id,
      username: utilisateur.username,
      email: utilisateur.email,
      role: utilisateur.role
    };

    res.json({
      message: 'Connexion réussie',
      user: req.session.user
    });
  } catch (erreur) {
    console.error('Erreur login :', erreur);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// POST /logout : se déconnecter
router.post('/logout', (req, res) => {
  req.session.destroy((erreur) => {
    if (erreur) {
      console.error('Erreur logout :', erreur);
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Déconnexion réussie' });
  });
});

// GET /me : qui est connecté ? (route de test)
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Non connecté' });
  }
  res.json({ user: req.session.user });
});
// GET /me : qui est connecté ? (route de test)
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Non connecté' });
  }
  res.json({ user: req.session.user });
});

// Routes de démonstration (à supprimer plus tard)
router.get('/test-connecte', estConnecte, (req, res) => {
  res.json({ message: `Bonjour ${req.session.user.username}, tu es connectée` });
});

router.get('/test-admin', estAdmin, (req, res) => {
  res.json({ message: 'Bienvenue, administrateur' });
});

module.exports = router;