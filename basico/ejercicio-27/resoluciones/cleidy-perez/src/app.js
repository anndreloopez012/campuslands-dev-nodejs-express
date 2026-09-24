const http = require('node:http');
const matches = [{ id: 1, status: 'finalizada', winner: 'EQ' }];
function log(event, data) { process.stdout.write(JSON.stringify({ level: 'info', event, timestamp: new Date().toISOString(), ...data }) + '\n'); }
function send(res, status, data) { const body = JSON.stringify(data); res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(body); }
function createServer() { return http.createServer((req, res) => { const started = Date.now(); res.on('finish', () => log('request_completed', { method: req.method, path: req.url, statusCode: res.statusCode, durationMs: Date.now() - started })); const url = new URL(req.url, 'http://localhost'); if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true }); if (req.method === 'GET' && url.pathname === '/api/matches') return send(res, 200, { ok: true, data: matches }); return send(res, 404, { ok: false, error: 'Ruta no encontrada' }); }); }
function start(port = Number(process.env.PORT || 3000)) { const server = createServer(); server.listen(port, () => console.log('API de partidas en http://localhost:' + port)); return server; }
if (require.main === module) start();
module.exports = { createServer, start };
