const http = require('node:http');
const port = Number(process.env.PORT || 3017);
const destinations = [
  { id: 1, name: 'Cartagena', country: 'Colombia', activity: 'Centro historico' },
  { id: 2, name: 'Santa Marta', country: 'Colombia', activity: 'Parque Tayrona' },
  { id: 3, name: 'Cusco', country: 'Peru', activity: 'Valle Sagrado' }
];
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/destinations') {
    const country = url.searchParams.get('country');
    const data = country ? destinations.filter((d) => d.country.toLowerCase() === country.toLowerCase()) : destinations;
    return send(res, 200, { ok: true, data });
  }
  const match = url.pathname.match(/^\/destinations\/([^/]+)$/);
  if (req.method === 'GET' && match) {
    const id = Number(match[1]);
    if (!Number.isInteger(id) || id < 1) return send(res, 400, { ok: false, error: 'El id debe ser un entero positivo' });
    const destination = destinations.find((item) => item.id === id);
    if (!destination) return send(res, 404, { ok: false, error: 'Destino no encontrado' });
    return send(res, 200, { ok: true, data: destination });
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`API de viajes activa en http://localhost:${port}`));