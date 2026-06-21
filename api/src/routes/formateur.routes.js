'use strict';
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { proxyGet, proxyPost, proxyPut, proxyDelete } = require('../utils/proxy');

router.get   ('/',    authenticate, (req, res) => proxyGet   (req, res, '/api/formateurs'));
router.get   ('/:id', authenticate, (req, res) => proxyGet   (req, res, `/api/formateurs/${req.params.id}`));
router.post  ('/',    authenticate, (req, res) => proxyPost  (req, res, '/api/formateurs'));
router.put   ('/:id', authenticate, (req, res) => proxyPut   (req, res, `/api/formateurs/${req.params.id}`));
router.delete('/:id', authenticate, (req, res) => proxyDelete(req, res, `/api/formateurs/${req.params.id}`));

module.exports = router;
