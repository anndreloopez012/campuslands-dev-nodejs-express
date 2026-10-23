const http = require('node:http');
const port = Number(process.env.PORT || 3029);
const teams = [
  { id: 1, name: 'Deportivo Central', sport: 'soccer', city: 'Bogota' },
  { id: 2, name: 'Estrellas del Sur', sport: 'futsal', city: 'Cali' },
  { id: 3, name: 'Union del Norte', sport: 'soccer', city: 'Barranquilla' }
];
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/teams') {
    const sport = url.searchParams.get('sport');
    const data = sport ? teams.filter((team) => team.sport === sport.toLowerCase()) : teams;
    return send(res, 200, { ok: true, count: data.length, data });
  }
  const match = url.pathname.match(/^\/teams\/([^/]+)$/);
  if (req.method === 'GET' && match) {
    const id = Number(match[1]);
    if (!Number.isInteger(id) || id < 1) return send(res, 400, { ok: false, error: 'El id debe ser un entero positivo' });
    const team = teams.find((item) => item.id === id);
    if (!team) return send(res, 404, { ok: false, error: 'Equipo no encontrado' });
    return send(res, 200, { ok: true, data: team });
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`Football Teams API activa en http://localhost:${port}`));