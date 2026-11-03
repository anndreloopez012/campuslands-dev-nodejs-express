const http = require('node:http');
const port = Number(process.env.PORT || 3025);
const heroes = [
  { id: 1, name: 'Eldrin', class: 'mage', level: 12 },
  { id: 2, name: 'Bruna', class: 'warrior', level: 8 }
];
let nextId = 3;
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
const readJson = async (req) => { const chunks = []; for await (const chunk of req) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString()); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = url.pathname.match(/^\/heroes\/([^/]+)$/);
  if (req.method === 'GET' && match) {
    const id = Number(match[1]);
    if (!Number.isInteger(id) || id < 1) return send(res, 400, { ok: false, error: 'El id debe ser un entero positivo' });
    const hero = heroes.find((item) => item.id === id);
    if (!hero) return send(res, 404, { ok: false, error: 'Heroe no encontrado' });
    return send(res, 200, { ok: true, data: hero });
  }
  if (req.method === 'POST' && url.pathname === '/heroes') {
    try {
      const { name, class: heroClass, level } = await readJson(req);
      if (typeof name !== 'string' || name.trim().length < 2 || typeof heroClass !== 'string' || !heroClass.trim()) return send(res, 400, { ok: false, error: 'El nombre y la clase son obligatorios' });
      if (!Number.isInteger(level) || level < 1 || level > 100) return send(res, 400, { ok: false, error: 'El nivel debe ser un entero entre 1 y 100' });
      const hero = { id: nextId++, name: name.trim(), class: heroClass.trim(), level };
      heroes.push(hero);
      return send(res, 201, { ok: true, data: hero });
    } catch {
      return send(res, 400, { ok: false, error: 'El cuerpo debe contener JSON valido' });
    }
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`RPG Heroes API activa en http://localhost:${port}`));