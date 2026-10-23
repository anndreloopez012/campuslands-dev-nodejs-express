const http = require('node:http');
const handleRoutes = require('./routes/food.routes');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const handled = handleRoutes(req, res);

  if (handled) {
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');

  res.end(
    JSON.stringify({
      ok: false,
      message: 'Ruta no encontrada'
    })
  );
});

server.listen(PORT, () => {
  console.log(
    `Servidor HTTP nativo ejecutandose en http://localhost:${PORT}`
  );
});