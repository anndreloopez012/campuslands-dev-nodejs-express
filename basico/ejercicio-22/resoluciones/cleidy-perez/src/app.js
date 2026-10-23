const http = require('node:http');
const controller = require('./controllers/quote.controller');
function createServer() { return http.createServer((req, res) => { res.setHeader('content-type', 'application/json; charset=utf-8'); const url = new URL(req.url, 'http://localhost'); if (req.method === 'GET' && url.pathname === '/api/quote') return controller.quote(url, res); res.statusCode = 404; res.end(JSON.stringify({ ok: false, error: 'Ruta no encontrada' })); }); }
function start(port = Number(process.env.PORT || 3000)) { const server = createServer(); server.listen(port, () => console.log(`API de arquitectura en http://localhost:${port}`)); return server; }
if (require.main === module) start();
module.exports = { createServer, start };
