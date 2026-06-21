'use strict';
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { proxyGet, proxyPost, proxyPut, proxyDelete } = require('../utils/proxy');

// Courriers
router.get   ('/courriers',      authenticate, (req, res) => proxyGet   (req, res, '/api/admin/courriers'));
router.post  ('/courriers',      authenticate, (req, res) => proxyPost  (req, res, '/api/admin/courriers'));
router.put   ('/courriers/:id',  authenticate, (req, res) => proxyPut   (req, res, `/api/admin/courriers/${req.params.id}`));
router.delete('/courriers/:id',  authenticate, (req, res) => proxyDelete(req, res, `/api/admin/courriers/${req.params.id}`));

// Personnel
router.get ('/personnel',     authenticate, (req, res) => proxyGet (req, res, '/api/admin/personnel'));
router.post('/personnel',     authenticate, (req, res) => proxyPost(req, res, '/api/admin/personnel'));
router.put ('/personnel/:id', authenticate, (req, res) => proxyPut (req, res, `/api/admin/personnel/${req.params.id}`));

// Budget
router.get('/budget', authenticate, (req, res) => proxyGet(req, res, '/api/admin/budget'));

module.exports = router;
