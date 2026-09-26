const http = require('http');
const PORT = 3006;

const productos = [
  { id: 1, nombre: 'Air Jordan 1', tipo: 'Sneakers', talla: 42, precio: 180 },
  { id: 2, nombre: 'Yeezy Boost 350', tipo: 'Sneakers', talla: 43, precio: 230 },
  { id: 3, nombre: 'Camiseta Oversize', tipo: 'Ropa', talla: 'L', precio: 35 },
  { id: 4, nombre: 'Hoodie Streetwear', tipo: 'Ropa', talla: 'M', precio: 65 }
];

function obtenerProductos() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(productos), 400);
  });
}

function buscarPorTipo(tipo) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const resultado = productos.filter(p => p.tipo.toLowerCase() === tipo.toLowerCase());
      resultado.length > 0 ? resolve(resultado) : reject(new Error(`Tipo '${tipo}' no encontrado`));
    }, 300);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/productos' && req.method === 'GET') {
    obtenerProductos()
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); });
  } else if (req.url.startsWith('/productos/tipo/') && req.method === 'GET') {
    const tipo = decodeURIComponent(req.url.split('/')[3]);
    buscarPorTipo(tipo)
      .then(data => { res.writeHead(200); res.end(JSON.stringify(data)); })
      .catch(err => { res.writeHead(404); res.end(JSON.stringify({ error: err.message })); });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

server.listen(PORT, () => console.log(`Servidor ropa y sneakers en http://localhost:${PORT}`));