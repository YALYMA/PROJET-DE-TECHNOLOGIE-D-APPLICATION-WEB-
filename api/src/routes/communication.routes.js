'use strict';
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { proxyGet, proxyPost, proxyPut, proxyPatch, proxyDelete } = require('../utils/proxy');

router.get   ('/',         authenticate, (req, res) => proxyGet   (req, res, '/api/communication'));
router.get   ('/:id',      authenticate, (req, res) => proxyGet   (req, res, `/api/communication/${req.params.id}`));
router.post  ('/',         authenticate, (req, res) => proxyPost  (req, res, '/api/communication'));
router.put   ('/:id',      authenticate, (req, res) => proxyPut   (req, res, `/api/communication/${req.params.id}`));
router.patch ('/:id/lu',   authenticate, (req, res) => proxyPatch (req, res, `/api/communication/${req.params.id}/lu`));
router.delete('/:id',      authenticate, (req, res) => proxyDelete(req, res, `/api/communication/${req.params.id}`));

module.exports = router;
