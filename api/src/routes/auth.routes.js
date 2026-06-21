'use strict';
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { proxyGet, proxyPost } = require('../utils/proxy');

// POST /api/auth/login — public, pas de authenticate ici
router.post('/login', (req, res) => proxyPost(req, res, '/api/auth/login'));

// POST /api/auth/refresh
router.post('/refresh', (req, res) => proxyPost(req, res, '/api/auth/refresh'));

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => proxyPost(req, res, '/api/auth/logout'));

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => proxyGet(req, res, '/api/auth/me'));

// GET /api/auth/users
router.get('/users', authenticate, (req, res) => proxyGet(req, res, '/api/auth/users'));

module.exports = router;
