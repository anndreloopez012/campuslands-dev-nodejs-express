const http = require('node:http');
const port = Number(process.env.PORT || 3020);
const brushes = [];
let nextId = 1;
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
const readJson = async (req) => { const chunks = []; for await (const chunk of req) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString()); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/brushes') return send(res, 200, { ok: true, data: brushes });
  if (req.method === 'POST' && url.pathname === '/brushes') {
    try {
      const { name, type } = await readJson(req);
      if (typeof name !== 'string' || !name.trim() || typeof type !== 'string' || !type.trim()) return send(res, 400, { ok: false, error: 'El nombre y el tipo son obligatorios' });
      const brush = { id: nextId++, name: name.trim(), type: type.trim() };
      brushes.push(brush);
      return send(res, 201, { ok: true, data: brush });
    } catch {
      return send(res, 400, { ok: false, error: 'El cuerpo debe contener JSON valido' });
    }
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`Brush Studio API activa en http://localhost:${port}`));