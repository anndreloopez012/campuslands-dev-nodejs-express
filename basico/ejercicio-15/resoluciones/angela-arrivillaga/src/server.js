import http from 'http';
import { manejarPeticion } from './routes/router.js';

const PORT = 3000;

const server = http.createServer(manejarPeticion);

server.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:' + PORT);
});
