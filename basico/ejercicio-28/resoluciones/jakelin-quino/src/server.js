const http = require('node:http');
const config = require('./config');
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true, status: 'active' });
  if (req.method === 'GET' && url.pathname === '/lobby') return send(res, 200, { ok: true, name: config.lobbyName, region: config.region });
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(config.port, () => console.log(`${config.lobbyName} activa en http://localhost:${config.port}`));