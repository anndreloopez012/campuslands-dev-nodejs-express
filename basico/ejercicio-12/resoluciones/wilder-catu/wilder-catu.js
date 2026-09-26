

javascript
const http = require('http');

const PORT = 3002;

const peliculas = [
  { id: 1, titulo: 'El Exorcista', anio: 1973, director: 'William Friedkin', rating: 8.0 },
  { id: 2, titulo: 'El Resplandor', anio: 1980, director: 'Stanley Kubrick', rating: 8.4 },
  { id: 3, titulo: 'Pesadilla en la calle Elm', anio: 1984, director: 'Wes Craven', rating: 7.5 },
  { id: 4, titulo: 'Viernes 13', anio: 1980, director: 'Sean S. Cunningham', rating: 6.5 }
];

function obtenerPeliculas() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(peliculas);
    }, 500);
  });
}

function buscarPorAnio(anio) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const resultado = peliculas.filter(p => p.anio === parseInt(anio));
      if (resultado.length > 0) {
        resolve(resultado);
      } else {
        reject(new Error(`No se encontraron películas del año ${anio}`));
      }
    }, 300);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/peliculas' && req.method === 'GET') {
    obtenerPeliculas()
      .then(data => {
        res.writeHead(200);
        res.end(JSON.stringify(data));
      })
      .catch(error => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      });
  } else if (req.url.startsWith('/peliculas/anio/') && req.method === 'GET') {
    const anio = req.url.split('/')[3];
    buscarPorAnio(anio)
      .then(data => {
        res.writeHead(200);
        res.end(JSON.stringify(data));
      })
      .catch(error => {
        res.writeHead(404);
        res.end(JSON.stringify({ error: error.message }));
      });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

server.listen(PORT, () => {
  console.log(`Servidor de películas de miedo corriendo en http://localhost:${PORT}`);
});