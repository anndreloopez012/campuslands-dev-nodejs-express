const http = require('http');
const PORT = 3003;

const peliculas = [
  { id: 1, titulo: 'Blade Runner 2049', director: 'Denis Villeneuve', anio: 2017, subgenero: 'Cyberpunk' },
  { id: 2, titulo: 'Interstellar', director: 'Christopher Nolan', anio: 2014, subgenero: 'Space Opera' },
  { id: 3, titulo: 'Matrix', director: 'Hermanas Wachowski', anio: 1999, subgenero: 'Cyberpunk' },
  { id: 4, titulo: 'Dune', director: 'Denis Villeneuve', anio: 2021, subgenero: 'Space Opera' }
];

function obtenerPeliculas() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(peliculas), 400);
  });
}

function buscarPorDirector(director) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const resultado = peliculas.filter(p => p.director.toLowerCase().includes(director.toLowerCase()));
      resultado.length > 0 ? resolve(resultado) : reject(new Error(`Sin resultados para: ${director}`));
    }, 300);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/peliculas' && req.method === 'GET') {
    obtenerPeliculas()
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); });
  } else if (req.url.startsWith('/peliculas/director/') && req.method === 'GET') {
    const director = decodeURIComponent(req.url.split('/')[3]);
    buscarPorDirector(director)
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(404); res.end(JSON.stringify({ error: err.message })); });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

server.listen(PORT, () => console.log(`Servidor ciencia ficción en http://localhost:${PORT}`));