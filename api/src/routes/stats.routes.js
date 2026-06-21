const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { proxyGet } = require('../utils/proxy');

// GET /api/stats          → Spring Boot GET /api/stats
router.get('/', authenticate, (req, res) => proxyGet(req, res, '/api/stats'));

// GET /api/stats/activities → Spring Boot GET /api/stats/activities
router.get('/activities', authenticate, (req, res) => proxyGet(req, res, '/api/stats/activities'));

// GET /api/stats/insertion  → Spring Boot GET /api/stats/insertion
router.get('/insertion', authenticate, (req, res) => proxyGet(req, res, '/api/stats/insertion'));

module.exports = router;
