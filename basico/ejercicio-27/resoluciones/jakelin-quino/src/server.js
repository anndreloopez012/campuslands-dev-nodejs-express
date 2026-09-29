const http = require('node:http');
const port = Number(process.env.PORT || 3027);
const matches = [
  { id: 1, game: 'Final regional', teams: ['Jaguar', 'Condor'], result: '2-1' },
  { id: 2, game: 'Copa abierta', teams: ['Orchid', 'Comet'], result: '1-1' }
];
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));

http.createServer((req, res) => {
  const startedAt = Date.now();
  res.on('finish', () => console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - startedAt}ms`));
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/matches') return send(res, 200, { ok: true, data: matches });
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`MOBA Match API activa en http://localhost:${port}`));