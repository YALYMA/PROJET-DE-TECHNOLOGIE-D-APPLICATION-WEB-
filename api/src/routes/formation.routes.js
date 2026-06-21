'use strict';
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { proxyGet, proxyPost, proxyPut, proxyDelete } = require('../utils/proxy');

router.get   ('/',        authenticate, (req, res) => proxyGet   (req, res, '/api/formations'));
router.get   ('/stats',   authenticate, (req, res) => proxyGet   (req, res, '/api/formations/stats'));
router.get   ('/:id',     authenticate, (req, res) => proxyGet   (req, res, `/api/formations/${req.params.id}`));
router.post  ('/',        authenticate, (req, res) => proxyPost  (req, res, '/api/formations'));
router.put   ('/:id',     authenticate, (req, res) => proxyPut   (req, res, `/api/formations/${req.params.id}`));
router.delete('/:id',     authenticate, (req, res) => proxyDelete(req, res, `/api/formations/${req.params.id}`));

module.exports = router;
