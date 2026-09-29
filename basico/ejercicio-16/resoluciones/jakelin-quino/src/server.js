const http = require('node:http');
const port = Number(process.env.PORT || 3016);
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/') return send(res, 200, { ok: true, message: 'Bienvenido a Sneaker Store' });
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true, status: 'active' });
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`Sneaker Store activa en http://localhost:${port}`));