const http = require('node:http');
const port = Number(process.env.PORT || 3030);
const motorcycles = [
  { id: 1, brand: 'Honda', model: 'CB 190R', year: 2023 },
  { id: 2, brand: 'Suzuki', model: 'GN 125', year: 2022 }
];
const workOrders = [];
let nextMotorcycleId = 3;
let nextWorkOrderId = 1;
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
const readJson = async (req) => { const chunks = []; for await (const chunk of req) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString()); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/motorcycles') return send(res, 200, { ok: true, data: motorcycles });
  if (req.method === 'GET' && /^\/motorcycles\/[^/]+$/.test(url.pathname)) {
    const id = Number(url.pathname.split('/')[2]);
    if (!Number.isInteger(id) || id < 1) return send(res, 400, { ok: false, error: 'El id debe ser un entero positivo' });
    const item = motorcycles.find((m) => m.id === id);
    if (!item) return send(res, 404, { ok: false, error: 'Motocicleta no encontrada' });
    return send(res, 200, { ok: true, data: item });
  }
  if (req.method === 'GET' && url.pathname === '/work-orders') return send(res, 200, { ok: true, data: workOrders });
  if (req.method === 'POST' && url.pathname === '/motorcycles') {
    try {
      const { brand, model, year } = await readJson(req);
      if (typeof brand !== 'string' || !brand.trim() || typeof model !== 'string' || !model.trim()) return send(res, 400, { ok: false, error: 'La marca y el modelo son obligatorios' });
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1950 || year > currentYear + 1) return send(res, 400, { ok: false, error: `El anio debe estar entre 1950 y ${currentYear + 1}` });
      const motorcycle = { id: nextMotorcycleId++, brand: brand.trim(), model: model.trim(), year };
      motorcycles.push(motorcycle);
      return send(res, 201, { ok: true, data: motorcycle });
    } catch {
      return send(res, 400, { ok: false, error: 'El cuerpo debe contener JSON valido' });
    }
  }
  if (req.method === 'POST' && url.pathname === '/work-orders') {
    try {
      const { motorcycleId, issue } = await readJson(req);
      const id = Number(motorcycleId);
      if (!Number.isInteger(id) || id < 1) return send(res, 400, { ok: false, error: 'motorcycleId debe ser un entero positivo' });
      if (typeof issue !== 'string' || !issue.trim()) return send(res, 400, { ok: false, error: 'La descripcion de la falla es obligatoria' });
      const motorcycle = motorcycles.find((m) => m.id === id);
      if (!motorcycle) return send(res, 404, { ok: false, error: 'Motocicleta no encontrada' });
      const workOrder = { id: nextWorkOrderId++, motorcycleId: id, issue: issue.trim(), status: 'received' };
      workOrders.push(workOrder);
      return send(res, 201, { ok: true, data: workOrder });
    } catch {
      return send(res, 400, { ok: false, error: 'El cuerpo debe contener JSON valido' });
    }
  }
  send(res, 404, { ok: false, error: 'Ruta no encontrada' });
}).listen(port, () => console.log(`Taller Moto API activa en http://localhost:${port}`));