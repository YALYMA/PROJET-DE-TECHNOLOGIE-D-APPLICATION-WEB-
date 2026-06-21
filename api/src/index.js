require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression = require('compression');
const rateLimit  = require('express-rate-limit');

const authRoutes          = require('./routes/auth.routes');
const studentRoutes       = require('./routes/student.routes');
const formationRoutes     = require('./routes/formation.routes');
const formateurRoutes     = require('./routes/formateur.routes');
const communicationRoutes = require('./routes/communication.routes');
const adminRoutes         = require('./routes/admin.routes');
const insertionRoutes     = require('./routes/insertion.routes');
const statsRoutes         = require('./routes/stats.routes');
const logger              = require('./utils/logger');

const app  = express();
const PORT = process.env.PORT || 3000;
const isDev = (process.env.NODE_ENV || 'development') === 'development';

// ============================================================
// MIDDLEWARES GLOBAUX
// ============================================================
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin:         process.env.FRONTEND_URL || 'http://localhost:4200',
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    true,
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// ============================================================
// RATE LIMITING
// En développement : limites très souples pour ne pas bloquer les tests
// En production : limites strictes anti-brute-force
// ============================================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      isDev ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { status: 429, error: 'Trop de requêtes. Réessayez dans quelques minutes.' },
  skip: () => isDev, // En dev : désactiver complètement le rate limiting
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      isDev ? 10000 : 20,   // Production : 20 tentatives de login / 15 min
  standardHeaders: true,
  legacyHeaders:   false,
  message: { status: 429, error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  skip: () => isDev, // En dev : pas de limite sur le login
});

app.use('/api',       limiter);
app.use('/api/auth',  authLimiter);

// ============================================================
// ROUTES
// ============================================================
app.use('/api/auth',          authRoutes);
app.use('/api/students',      studentRoutes);
app.use('/api/formations',    formationRoutes);
app.use('/api/formateurs',    formateurRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/insertion',     insertionRoutes);
app.use('/api/stats',         statsRoutes);

// Health check
app.get('/health', (req, res) => res.json({
  status:    'OK',
  service:   'UNCHK API',
  env:       process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString(),
  uptime:    Math.round(process.uptime()) + 's',
}));

// Documentation racine
app.get('/api', (req, res) => res.json({
  name:    'UNCHK — Université Numérique Cheikh Hamidou Kane — API',
  version: '2.0.0',
  env:     process.env.NODE_ENV || 'development',
  endpoints: [
    'POST   /api/auth/login',
    'GET    /api/auth/me',
    'GET    /api/students',
    'POST   /api/students',
    'GET    /api/formations',
    'GET    /api/formateurs',
    'GET    /api/communication',
    'GET    /api/insertion/stages',
    'GET    /api/insertion/partenaires',
    'GET    /api/admin/courriers',
    'GET    /api/admin/personnel',
    'GET    /api/admin/budget',
    'GET    /api/stats',
    'GET    /api/stats/activities',
  ],
}));

// ============================================================
// ERROR HANDLERS
// ============================================================
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(err.status || 500).json({
    status:    err.status || 500,
    error:     err.message || 'Erreur interne du serveur',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ status: 404, error: `Route introuvable : ${req.method} ${req.path}` });
});

// ============================================================
// DÉMARRAGE
// ============================================================
app.listen(PORT, () => {
  logger.info(`UNCHK API démarrée → http://localhost:${PORT}`);
  logger.info(`Mode : ${isDev ? 'DÉVELOPPEMENT (rate limiting désactivé)' : 'PRODUCTION'}`);
  logger.info(`Health : http://localhost:${PORT}/health`);
});

module.exports = app;
