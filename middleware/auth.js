function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Vous devez être connecté.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Vous devez être connecté.' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };