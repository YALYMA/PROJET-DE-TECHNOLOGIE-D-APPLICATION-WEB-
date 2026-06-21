'use strict';
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { proxyGet, proxyPost, proxyPut, proxyDelete } = require('../utils/proxy');

router.get ('/',               authenticate, (req, res) => proxyGet   (req, res, '/api/students'));
router.get ('/export/pdf',     authenticate, (req, res) => proxyGet   (req, res, '/api/students/export/pdf'));
router.get ('/export/excel',   authenticate, (req, res) => proxyGet   (req, res, '/api/students/export/excel'));
router.get ('/:id',            authenticate, (req, res) => proxyGet   (req, res, `/api/students/${req.params.id}`));
router.post('/',               authenticate, (req, res) => proxyPost  (req, res, '/api/students'));
router.put ('/:id',            authenticate, (req, res) => proxyPut   (req, res, `/api/students/${req.params.id}`));
router.delete('/:id',          authenticate, (req, res) => proxyDelete(req, res, `/api/students/${req.params.id}`));

module.exports = router;
