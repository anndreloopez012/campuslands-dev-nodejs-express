
const http = require('http');
const PORT = 3008;

const saltos = [
  { id: 1, zona: 'Dubai', altura: 4000, precio: 350, incluyeVideo: true },
  { id: 2, zona: 'Interlaken', altura: 4500, precio: 280, incluyeVideo: false },
  { id: 3, zona: 'Queenstown', altura: 5000, precio: 400, incluyeVideo: true },
  { id: 4, zona: 'Madrid', altura: 3000, precio: 200, incluyeVideo: false }
];

function obtenerSaltos() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(saltos), 400);
  });
}

function buscarPorAlturaMinima(min) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const resultado = saltos.filter(s => s.altura >= parseInt(min));
      resultado.length > 0 ? resolve(resultado) : reject(new Error(`Sin saltos sobre ${min}m`));
    }, 300);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/saltos' && req.method === 'GET') {
    obtenerSaltos()
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); });
  } else if (req.url.startsWith('/saltos/altura/') && req.method === 'GET') {
    const min = req.url.split('/')[3];
    buscarPorAlturaMinima(min)
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(404); res.end(JSON.stringify({ error: err.message })); });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

server.listen(PORT, () => console.log(`Servidor paracaidismo en http://localhost:${PORT}`));