const http = require('node:http');
const port = Number(process.env.PORT || 3022);
const rates = { draft: 0.000002, standard: 0.000006, high: 0.000015 };
const send = (res, code, body) => res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
const readJson = async (req) => { const chunks = []; for await (const chunk of req) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString()); };

http.createServer(async (req, res) => {
  if (req.method !== 'POST' || new URL(req.url, `http://${req.headers.host}`).pathname !== '/budgets') {
    return send(res, 404, { ok: false, error: 'Ruta no encontrada' });
  }
  try {
    const { width, height, quality } = await readJson(req);
    if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1) return send(res, 400, { ok: false, error: 'El ancho y el alto deben ser enteros positivos' });
    if (!Object.hasOwn(rates, quality)) return send(res, 400, { ok: false, error: 'La calidad debe ser draft, standard o high' });
    const pixels = width * height;
    return send(res, 200, { ok: true, data: { width, height, pixels, quality, estimatedCost: Number((pixels * rates[quality]).toFixed(2)) } });
  } catch {
    return send(res, 400, { ok: false, error: 'El cuerpo debe contener JSON valido' });
  }
}).listen(port, () => console.log(`Render Budget API activa en http://localhost:${port}`));