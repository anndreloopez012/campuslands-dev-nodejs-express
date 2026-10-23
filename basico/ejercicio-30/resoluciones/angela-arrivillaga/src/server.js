import app from './app.js';
import { config } from './config.js';

app.listen(config.port, () => {
  console.log('Servidor (' + config.entorno + ') corriendo en http://localhost:' + config.port);
});
