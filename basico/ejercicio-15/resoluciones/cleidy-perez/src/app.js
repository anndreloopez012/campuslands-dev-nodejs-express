const http = require('node:http');
const menu = [{ id: 1, name: 'Taco de birria', price: 42 }, { id: 2, name: 'Elote con queso', price: 18 }, { id: 3, name: 'Agua de Jamaica', price: 15 }];
function sendJson(res, status, data) { const body = JSON.stringify(data); res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body) }); res.end(body); }
function createServer() { return http.createServer((req, res) => { const url = new URL(req.url, 'http://localhost'); if (req.method === 'GET' && url.pathname === '/health') return sendJson(res, 200, { ok: true, service: 'api-comida-urbana' }); if (req.method === 'GET' && url.pathname === '/api/menu') return sendJson(res, 200, { ok: true, data: menu }); return sendJson(res, 404, { ok: false, error: 'Ruta no encontrada' }); }); }
function start(port = Number(process.env.PORT || 3000)) { const server = createServer(); server.listen(port, () => console.log(`API nativa en http://localhost:${port}`)); return server; }
if (require.main === module) start();
module.exports = { menu, sendJson, createServer, start };
