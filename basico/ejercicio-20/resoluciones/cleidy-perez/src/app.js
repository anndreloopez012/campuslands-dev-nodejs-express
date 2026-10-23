const http = require('node:http');
const { createJsonBodyMiddleware } = require('./middleware/json-body.middleware');
const artworks = []; let nextId = 1;
function sendJson(res, status, data) { const body = JSON.stringify(data); res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body) }); res.end(body); }
function createServer() { return http.createServer((req, res) => { createJsonBodyMiddleware()(req, res, (error) => { if (error) return sendJson(res, error.statusCode || 500, { ok: false, error: error.message }); const url = new URL(req.url, 'http://localhost'); if (req.method === 'GET' && url.pathname === '/api/artworks') return sendJson(res, 200, { ok: true, data: artworks }); if (req.method === 'POST' && url.pathname === '/api/artworks') { if (!req.body.title?.trim() || !req.body.style?.trim()) return sendJson(res, 400, { ok: false, error: 'title y style son obligatorios' }); const artwork = { id: nextId++, title: req.body.title.trim(), style: req.body.style.trim() }; artworks.push(artwork); return sendJson(res, 201, { ok: true, data: artwork }); } return sendJson(res, 404, { ok: false, error: 'Ruta no encontrada' }); }); }); }
function start(port = Number(process.env.PORT || 3000)) { const server = createServer(); server.listen(port, () => console.log(`API de dibujos en http://localhost:${port}`)); return server; }
if (require.main === module) start();
module.exports = { createServer, start };
