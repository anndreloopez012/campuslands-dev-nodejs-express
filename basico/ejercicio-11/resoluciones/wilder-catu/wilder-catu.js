const http = require('http');

const PORT = 3001;

// Base de datos simulada
const canciones = [
  { id: 1, titulo: 'Bohemian Rhapsody', artista: 'Queen', genero: 'Rock', duracion: 354 },
  { id: 2, titulo: 'Billie Jean', artista: 'Michael Jackson', genero: 'Pop', duracion: 294 },
  { id: 3, titulo: 'Hotel California', artista: 'Eagles', genero: 'Rock', duracion: 391 },
  { id: 4, titulo: 'Imagine', artista: 'John Lennon', genero: 'Pop', duracion: 183 }
];

// Función que devuelve una promesa para obtener canciones
function obtenerCanciones() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (canciones.length > 0) {
        resolve(canciones);
      } else {
        reject(new Error('No hay canciones disponibles'));
      }
    }, 500);
  });
}

// Función que devuelve una promesa para buscar por ID
function buscarCancionPorId(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cancion = canciones.find(c => c.id === parseInt(id));
      if (cancion) {
        resolve(cancion);
      } else {
        reject(new Error(`Canción con ID ${id} no encontrada`));
      }
    }, 300);
  });
}

// Servidor HTTP
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/canciones' && req.method === 'GET') {
    obtenerCanciones()
      .then(data => {
        res.writeHead(200);
        res.end(JSON.stringify(data));
      })
      .catch(error => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      });
  } else if (req.url.startsWith('/canciones/') && req.method === 'GET') {
    const id = req.url.split('/')[2];
    buscarCancionPorId(id)
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
  console.log(`Servidor de música corriendo en http://localhost:${PORT}`);
});