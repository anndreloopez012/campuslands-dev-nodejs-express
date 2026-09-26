

const http = require('http');
const PORT = 3007;

const destinos = [
  { id: 1, ciudad: 'París', pais: 'Francia', precio: 1200, duracion: 7 },
  { id: 2, ciudad: 'Tokio', pais: 'Japón', precio: 1800, duracion: 10 },
  { id: 3, ciudad: 'Nueva York', pais: 'EE.UU.', precio: 1500, duracion: 5 },
  { id: 4, ciudad: 'Cancún', pais: 'México', precio: 900, duracion: 7 }
];

function obtenerDestinos() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(destinos), 400);
  });
}

function buscarPorPrecioMaximo(max) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const resultado = destinos.filter(d => d.precio <= parseInt(max));
      resultado.length > 0 ? resolve(resultado) : reject(new Error(`Sin destinos bajo $${max}`));
    }, 300);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/destinos' && req.method === 'GET') {
    obtenerDestinos()
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); });
  } else if (req.url.startsWith('/destinos/precio/') && req.method === 'GET') {
    const max = req.url.split('/')[3];
    buscarPorPrecioMaximo(max)
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(404); res.end(JSON.stringify({ error: err.message })); });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

server.listen(PORT, () => console.log(`Servidor viajes en http://localhost:${PORT}`));