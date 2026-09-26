const http = require('http');
const PORT = 3005;

const platos = [
  { id: 1, nombre: 'Hamburguesa Smash', tipo: 'Hamburguesa', precio: 8.50, picante: false },
  { id: 2, nombre: 'Tacos al Pastor', tipo: 'Mexicana', precio: 6.00, picante: true },
  { id: 3, nombre: 'Pizza Pepperoni', tipo: 'Italiana', precio: 12.00, picante: false },
  { id: 4, nombre: 'Hot Dog NY', tipo: 'Street Food', precio: 5.50, picante: false }
];

function obtenerPlatos() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(platos), 400);
  });
}

function filtrarPicantes() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(platos.filter(p => p.picante)), 300);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/platos' && req.method === 'GET') {
    obtenerPlatos()
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); });
  } else if (req.url === '/platos/picantes' && req.method === 'GET') {
    filtrarPicantes()
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

server.listen(PORT, () => console.log(`Servidor comida urbana en http://localhost:${PORT}`));