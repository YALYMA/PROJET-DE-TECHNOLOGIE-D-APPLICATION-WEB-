'use strict';

const http  = require('http');
const https = require('https');
const { URL } = require('url');

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8080';

/**
 * Proxy générique vers Spring Boot.
 * Transmet la requête et renvoie la réponse intacte au client Angular.
 */
function proxyRequest(req, res, backendPath, method, body) {
  const target  = new URL(BACKEND + backendPath + buildQuery(req.query));
  const useHttps = target.protocol === 'https:';
  const lib      = useHttps ? https : http;

  const payload = body !== undefined ? body : req.body;
  const bodyStr = (payload != null && Object.keys(payload).length > 0)
    ? JSON.stringify(payload)
    : null;

  const headers = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  };
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }
  if (bodyStr) {
    headers['Content-Length'] = Buffer.byteLength(bodyStr, 'utf8');
  }

  const options = {
    hostname: target.hostname,
    port:     target.port || (useHttps ? 443 : 80),
    path:     target.pathname + target.search,
    method:   method || req.method,
    headers,
  };

  const proxyReq = lib.request(options, proxyRes => {
    // Accumuler les chunks en Buffer pour éviter la corruption UTF-8
    const chunks = [];
    proxyRes.on('data', chunk => chunks.push(chunk));
    proxyRes.on('end', () => {
      const buf = Buffer.concat(chunks);
      const ct  = proxyRes.headers['content-type'] || '';

      res.status(proxyRes.statusCode);

      // Fichier binaire (PDF, Excel)
      if (ct.includes('application/pdf') ||
          ct.includes('spreadsheet')     ||
          ct.includes('octet-stream')) {
        res.set('Content-Type',        ct);
        res.set('Content-Disposition', proxyRes.headers['content-disposition'] || '');
        return res.end(buf);
      }

      // JSON / texte
      const text = buf.toString('utf8');
      try {
        res.json(JSON.parse(text));
      } catch {
        res.send(text);
      }
    });
  });

  proxyReq.on('error', err => {
    console.error('[PROXY ERROR]', err.message);
    res.status(503).json({
      status: 503,
      error:  'Service indisponible. Vérifiez que Spring Boot est démarré sur le port 8080.',
    });
  });

  if (bodyStr) proxyReq.write(bodyStr, 'utf8');
  proxyReq.end();
}

function buildQuery(queryObj) {
  if (!queryObj || !Object.keys(queryObj).length) return '';
  return '?' + new URLSearchParams(queryObj).toString();
}

const proxyGet    = (req, res, path)       => proxyRequest(req, res, path, 'GET');
const proxyPost   = (req, res, path, body) => proxyRequest(req, res, path, 'POST', body);
const proxyPut    = (req, res, path, body) => proxyRequest(req, res, path, 'PUT', body);
const proxyPatch  = (req, res, path, body) => proxyRequest(req, res, path, 'PATCH', body);
const proxyDelete = (req, res, path)       => proxyRequest(req, res, path, 'DELETE');

module.exports = { proxyGet, proxyPost, proxyPut, proxyPatch, proxyDelete };
