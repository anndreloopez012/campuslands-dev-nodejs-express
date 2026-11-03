const http = require('node:http');
const port = Number(process.env.PORT || 3021);
const scenes = [
  { id: 1, title: 'Bosque de cristal', software: 'Blender', status: 'rendering' },
  { id: 2, title: 'Ciudad orbital', software: 'Maya', status: 'storyboard' }
];
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/scenes') return send(res, 200, { ok: true, data: scenes });
  const match = url.pathname.match(/^\/scenes\/([^/]+)$/);
  if (req.method === 'GET' && match) {
    const id = Number(match[1]);
    if (!Number.isInteger(id) || id < 1) return send(res, 400, { ok: false, error: 'El id debe ser un entero positivo' });
    const scene = scenes.find((item) => item.id === id);
    if (!scene) return send(res, 404, { ok: false, error: 'Escena no encontrada' });
    return send(res, 200, { ok: true, data: scene });
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`Animacion 3D API activa en http://localhost:${port}`));