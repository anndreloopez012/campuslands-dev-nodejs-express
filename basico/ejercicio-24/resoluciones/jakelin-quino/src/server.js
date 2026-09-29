const http = require('node:http');
const port = Number(process.env.PORT || 3024);
const formulas = [
  { id: 1, name: 'Agua', formula: 'H2O', description: 'Dos atomos de hidrogeno y uno de oxigeno' },
  { id: 2, name: 'Dioxido de carbono', formula: 'CO2', description: 'Un atomo de carbono y dos de oxigeno' }
];
let nextId = 3;
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
const readJson = async (req) => { const chunks = []; for await (const chunk of req) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString()); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = url.pathname.match(/^\/formulas(?:\/([^/]+))?$/);
  if (!match) return send(res, 404, { ok: false, error: 'Ruta no encontrada' });
  const id = match[1];
  if (req.method === 'GET' && !id) return send(res, 200, { ok: true, data: formulas });
  if (req.method === 'GET' && id) {
    const num = Number(id);
    if (!Number.isInteger(num) || num < 1) return send(res, 400, { ok: false, error: 'El id debe ser un entero positivo' });
    const item = formulas.find((f) => f.id === num);
    if (!item) return send(res, 404, { ok: false, error: 'Formula no encontrada' });
    return send(res, 200, { ok: true, data: item });
  }
  if (req.method === 'DELETE' && id) {
    const num = Number(id);
    if (!Number.isInteger(num) || num < 1) return send(res, 400, { ok: false, error: 'El id debe ser un entero positivo' });
    const index = formulas.findIndex((f) => f.id === num);
    if (index === -1) return send(res, 404, { ok: false, error: 'Formula no encontrada' });
    const [deleted] = formulas.splice(index, 1);
    return send(res, 200, { ok: true, data: deleted });
  }
  if ((req.method === 'POST' && !id) || (req.method === 'PUT' && id)) {
    try {
      const body = await readJson(req);
      const { name, formula, description } = body || {};
      if ([name, formula, description].some((v) => typeof v !== 'string' || !v.trim())) return send(res, 400, { ok: false, error: 'El nombre, la formula y la descripcion son obligatorios' });
      if (req.method === 'POST') {
        const item = { id: nextId++, name: name.trim(), formula: formula.trim(), description: description.trim() };
        formulas.push(item);
        return send(res, 201, { ok: true, data: item });
      }
      const num = Number(id);
      const item = formulas.find((f) => f.id === num);
      if (!item) return send(res, 404, { ok: false, error: 'Formula no encontrada' });
      Object.assign(item, { name: name.trim(), formula: formula.trim(), description: description.trim() });
      return send(res, 200, { ok: true, data: item });
    } catch {
      return send(res, 400, { ok: false, error: 'El cuerpo debe contener JSON valido' });
    }
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`Chemical Formulas API activa en http://localhost:${port}`));