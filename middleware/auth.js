// middleware/auth.js : les "gardiens" des routes (Marwa)

// Vérifie que l'utilisateur est connecté
function estConnecte(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette ressource' });
  }
  next(); // tout va bien, on passe à la route suivante
}

// Vérifie que l'utilisateur est administrateur
function estAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette ressource' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
  next();
}

module.exports = { estConnecte, estAdmin };