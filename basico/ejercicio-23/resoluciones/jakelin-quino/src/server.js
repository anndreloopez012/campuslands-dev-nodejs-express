const http = require('node:http');
const port = Number(process.env.PORT || 3023);
const welds = [];
let nextId = 1;
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
const readJson = async (req) => { const chunks = []; for await (const chunk of req) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString()); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/welds') return send(res, 200, { ok: true, count: welds.length, data: welds });
  if (req.method === 'POST' && url.pathname === '/welds') {
    try {
      const { operator, material, minutes } = await readJson(req);
      if (typeof operator !== 'string' || !operator.trim() || typeof material !== 'string' || !material.trim()) return send(res, 400, { ok: false, error: 'El operador y el material son obligatorios' });
      if (!Number.isInteger(minutes) || minutes < 1) return send(res, 400, { ok: false, error: 'El tiempo debe ser un entero positivo en minutos' });
      const weld = { id: nextId++, operator: operator.trim(), material: material.trim(), minutes };
      welds.push(weld);
      return send(res, 201, { ok: true, data: weld });
    } catch {
      return send(res, 400, { ok: false, error: 'El cuerpo debe contener JSON valido' });
    }
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`Weld Log API activa en http://localhost:${port}`));