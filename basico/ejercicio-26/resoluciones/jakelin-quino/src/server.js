const http = require('node:http');
const port = Number(process.env.PORT || 3026);
const matches = [
  { id: 1, map: 'Haven', players: 10, status: 'finished' },
  { id: 2, map: 'Lotus', players: 10, status: 'live' }
];
let nextId = 3;
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
const readJson = async (req) => { const chunks = []; for await (const chunk of req) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString()); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const matchPath = url.pathname.match(/^\/matches\/([^/]+)$/);
  if (req.method === 'GET' && matchPath) {
    const id = Number(matchPath[1]);
    if (!Number.isInteger(id) || id < 1) return send(res, 400, { ok: false, error: 'El id debe ser un entero positivo' });
    const match = matches.find((item) => item.id === id);
    if (!match) return send(res, 404, { ok: false, error: 'Partida no encontrada' });
    return send(res, 200, { ok: true, data: match });
  }
  if (req.method === 'POST' && url.pathname === '/matches') {
    try {
      const { map, players } = await readJson(req);
      if (typeof map !== 'string' || !map.trim() || !Number.isInteger(players) || players < 2 || players > 10) return send(res, 400, { ok: false, error: 'Indica un mapa y entre 2 y 10 jugadores' });
      const newMatch = { id: nextId++, map: map.trim(), players, status: 'scheduled' };
      matches.push(newMatch);
      return send(res, 201, { ok: true, data: newMatch });
    } catch {
      return send(res, 400, { ok: false, error: 'El cuerpo debe contener JSON valido' });
    }
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`Competitive Matches API activa en http://localhost:${port}`));