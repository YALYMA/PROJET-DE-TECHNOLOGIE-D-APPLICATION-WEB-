'use strict';
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { proxyGet, proxyPost, proxyPut, proxyDelete } = require('../utils/proxy');

// Stages
router.get   ('/stages',      authenticate, (req, res) => proxyGet   (req, res, '/api/insertion/stages'));
router.get   ('/stages/:id',  authenticate, (req, res) => proxyGet   (req, res, `/api/insertion/stages/${req.params.id}`));
router.post  ('/stages',      authenticate, (req, res) => proxyPost  (req, res, '/api/insertion/stages'));
router.put   ('/stages/:id',  authenticate, (req, res) => proxyPut   (req, res, `/api/insertion/stages/${req.params.id}`));
router.delete('/stages/:id',  authenticate, (req, res) => proxyDelete(req, res, `/api/insertion/stages/${req.params.id}`));

// Partenaires
router.get   ('/partenaires',     authenticate, (req, res) => proxyGet (req, res, '/api/insertion/partenaires'));
router.post  ('/partenaires',     authenticate, (req, res) => proxyPost(req, res, '/api/insertion/partenaires'));
router.put   ('/partenaires/:id', authenticate, (req, res) => proxyPut(req, res, `/api/insertion/partenaires/${req.params.id}`));

// Stats insertion
router.get('/stats', authenticate, (req, res) => proxyGet(req, res, '/api/insertion/stats'));

module.exports = router;
