import http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/comida' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
      ok: true,
      comida: [
        {
          nombre: 'Hamburguesa',
          precio: 25
        },
        {
          nombre: 'Tacos',
          precio: 20
        }
      ]
    }));

    return;
  }

  res.writeHead(404, {
    'Content-Type': 'application/json'
  });

  res.end(JSON.stringify({
    ok: false,
    message: 'Ruta no encontrada'
  }));
});

server.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});