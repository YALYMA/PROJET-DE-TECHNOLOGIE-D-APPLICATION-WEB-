'use strict';

const jwt = require('jsonwebtoken');

// Même valeur que uck.jwt.secret dans application.properties
const JWT_SECRET = process.env.JWT_SECRET || 'unchk-secret-key-tres-longue-et-securisee-2026-changez-en-prod';

/**
 * Vérifie le JWT généré par Spring Boot (signé en HS256).
 * Spring Boot stocke l'email dans "sub" (subject) et le rôle dans "role".
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, error: 'Token d\'authentification manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Forcer HS256 — doit correspondre à l'algorithme utilisé par Spring Boot
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

    req.user = {
      email:  decoded.sub    || decoded.email  || '',
      role:   decoded.role   || '',
      nom:    decoded.nom    || '',
      prenom: decoded.prenom || '',
    };
    next();
  } catch (err) {
    console.error('[AUTH]', err.name, ':', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 401, error: 'Session expirée. Veuillez vous reconnecter.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: 401, error: 'Token invalide. Vérifiez que JWT_SECRET est identique dans .env et application.properties.' });
    }
    return res.status(401).json({ status: 401, error: 'Authentification échouée.' });
  }
};

/**
 * Vérifie les rôles. Usage : authorize('ADMIN', 'ADMINISTRATIF')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ status: 401, error: 'Non authentifié' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      status: 403,
      error: `Accès refusé. Rôle requis : ${roles.join(' ou ')}. Votre rôle : ${req.user.role}`,
    });
  }
  next();
};

module.exports = { authenticate, authorize };
