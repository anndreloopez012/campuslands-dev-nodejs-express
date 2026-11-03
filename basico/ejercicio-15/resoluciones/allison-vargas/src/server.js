import http from 'node:http';
import { handler } from './app.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(handler);

server.listen(PORT, () => {
  console.log('==================================');
  console.log(' El food truck esta listo para servir...');
  console.log('==================================');
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
