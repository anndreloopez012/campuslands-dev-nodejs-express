const http = require('node:http');
const port = Number(process.env.PORT || 3018);
const jumps = [];
let nextId = 1;
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
const readJson = async (req) => { const chunks = []; for await (const chunk of req) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString()); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/jumps') return send(res, 200, { ok: true, data: jumps });
  if (req.method === 'POST' && url.pathname === '/jumps') {
    try {
      const { jumper, altitude } = await readJson(req);
      if (typeof jumper !== 'string' || jumper.trim().length < 2) return send(res, 400, { ok: false, error: 'El nombre debe tener al menos 2 caracteres' });
      if (!Number.isInteger(altitude) || altitude < 500 || altitude > 6000) return send(res, 400, { ok: false, error: 'La altura debe ser un entero entre 500 y 6000 metros' });
      const jump = { id: nextId++, jumper: jumper.trim(), altitude, status: 'scheduled' };
      jumps.push(jump);
      return send(res, 201, { ok: true, data: jump });
    } catch {
      return send(res, 400, { ok: false, error: 'El cuerpo debe contener JSON valido' });
    }
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`Paracaidismo API activa en http://localhost:${port}`));