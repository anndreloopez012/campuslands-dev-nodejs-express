const http = require('node:http');
const port = Number(process.env.PORT || 3019);
const designs = [
  { id: 1, name: 'Rosa de los vientos', style: 'traditional', artist: 'Lucia' },
  { id: 2, name: 'Montanas', style: 'linework', artist: 'Mateo' },
  { id: 3, name: 'Golondrina', style: 'traditional', artist: 'Lucia' }
];
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/designs') {
    const style = url.searchParams.get('style');
    const artist = url.searchParams.get('artist');
    const data = designs.filter((d) => (!style || d.style.toLowerCase() === style.toLowerCase()) && (!artist || d.artist.toLowerCase() === artist.toLowerCase()));
    return send(res, 200, { ok: true, count: data.length, data });
  }
  const match = url.pathname.match(/^\/designs\/([^/]+)$/);
  if (req.method === 'GET' && match) {
    const id = Number(match[1]);
    if (!Number.isInteger(id) || id < 1) return send(res, 400, { ok: false, error: 'El id debe ser un entero positivo' });
    const design = designs.find((item) => item.id === id);
    if (!design) return send(res, 404, { ok: false, error: 'Diseno no encontrado' });
    return send(res, 200, { ok: true, data: design });
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`Estudio de tatuajes API activa en http://localhost:${port}`));