const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// INSCRIPTION
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Adresse email invalide.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hash = await bcrypt.hash(password, 10);
    // le rôle est toujours 'user' à l'inscription (jamais fourni par le client)
    await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username.trim(), email.trim().toLowerCase(), hash, 'user']
    );

    res.status(201).json({ message: 'Inscription réussie.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

// CONNEXION
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe obligatoires.' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    const user = rows[0];

    // même message dans les 2 cas pour ne pas révéler si l'email existe
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json({ message: 'Connexion réussie.', user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

// DÉCONNEXION
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Déconnexion réussie.' });
  });
});

// UTILISATEUR CONNECTÉ (pour recharger l'état après un refresh)
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Non connecté.' });
  }
  res.json({ user: req.session.user });
});

// MODIFIER LE PROFIL
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const id = req.session.user.id;

    if (!username || !email) {
      return res.status(400).json({ message: 'Nom et email obligatoires.' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Adresse email invalide.' });
    }

    const [dup] = await db.query('SELECT id FROM users WHERE email = ? AND id <> ?', [email, id]);
    if (dup.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Mot de passe trop court (6 caractères minimum).' });
      }
      const hash = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET username=?, email=?, password=? WHERE id=?',
        [username.trim(), email.trim().toLowerCase(), hash, id]);
    } else {
      await db.query('UPDATE users SET username=?, email=? WHERE id=?',
        [username.trim(), email.trim().toLowerCase(), id]);
    }

    req.session.user.username = username.trim();
    req.session.user.email = email.trim().toLowerCase();
    res.json({ message: 'Profil mis à jour.', user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;