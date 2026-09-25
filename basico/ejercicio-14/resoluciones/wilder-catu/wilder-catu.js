const http = require('http');
const PORT = 3004;

const libros = [
  { id: 1, titulo: '1984', autor: 'George Orwell', paginas: 328, genero: 'Distopía' },
  { id: 2, titulo: 'Cien años de soledad', autor: 'G. García Márquez', paginas: 471, genero: 'Realismo mágico' },
  { id: 3, titulo: 'Don Quijote', autor: 'Cervantes', paginas: 863, genero: 'Clásico' },
  { id: 4, titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', paginas: 194, genero: 'Distopía' }
];

function obtenerLibros() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(libros), 400);
  });
}

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const libro = libros.find(l => l.id === parseInt(id));
      libro ? resolve(libro) : reject(new Error(`Libro con ID ${id} no encontrado`));
    }, 300);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/libros' && req.method === 'GET') {
    obtenerLibros()
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); });
  } else if (req.url.startsWith('/libros/') && req.method === 'GET') {
    const id = req.url.split('/')[2];
    buscarPorId(id)
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(404); res.end(JSON.stringify({ error: err.message })); });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

server.listen(PORT, () => console.log(`Servidor libros en http://localhost:${PORT}`));