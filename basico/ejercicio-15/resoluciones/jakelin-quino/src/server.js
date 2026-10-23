const http = require('node:http');
const { URL } = require('node:url');

const foods = [
  { id: 1, name: 'Hamburguesa urbana', price: 18000 },
  { id: 2, name: 'Perro callejero', price: 12000 },
  { id: 3, name: 'Taco nocturno', price: 9000 }
];

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { ok: true, message: 'API activa' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/foods') {
    sendJson(response, 200, foods);
    return;
  }

  const foodMatch = url.pathname.match(/^\/foods\/(\d+)$/);
  if (request.method === 'GET' && foodMatch) {
    const food = foods.find((item) => item.id === Number(foodMatch[1]));
    if (!food) {
      sendJson(response, 404, { ok: false, error: 'Comida no encontrada' });
      return;
    }
    sendJson(response, 200, food);
    return;
  }

  sendJson(response, 404, { ok: false, error: 'Ruta no encontrada' });
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`API de comida urbana escuchando en http://localhost:${port}`);
});