import http from 'node:http';

const foods = [
  { id: 1, name: "Tacos de Birria", price: 35, category: "Tacos" },
  { id: 2, name: "Hot Dog Jumbo", price: 25, category: "Rápida" },
  { id: 3, name: "Arepa Reina Pepiada", price: 30, category: "Arepas" }
];

const sendJSON = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (path === '/basico/ejercicio-15' && req.method === 'GET') {
    return sendJSON(res, 200, {
      ok: true,
      message: "Ejercicio ejecutado correctamente",
      topic: "mini API HTTP nativa"
    });
  }

  if (path === '/basico/ejercicio-15/foods' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, data: foods });
  }

  if (path === '/basico/ejercicio-15/foods' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        if (!parsed.name || !parsed.price) {
          return sendJSON(res, 400, { ok: false, message: "Campos name y price son obligatorios" });
        }
        const newFood = {
          id: foods.length + 1,
          name: parsed.name,
          price: Number(parsed.price),
          category: parsed.category || "General"
        };
        foods.push(newFood);
        return sendJSON(res, 201, { ok: true, message: "Comida agregada", data: newFood });
      } catch (err) {
        return sendJSON(res, 400, { ok: false, message: "JSON inválido" });
      }
    });
    return;
  }

  sendJSON(res, 404, { ok: false, message: "Ruta de comida urbana no encontrada" });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Servidor HTTP nativo corriendo en el puerto ${PORT}`);
  });
}

export default server;
